import prisma from "../../db/index.js";
import { DateTime } from "luxon";

interface TaskSnapshot {
  yesterdayCompleted: Array<{ id: string; title: string; tags: string[]; project: string | null }>;
  yesterdayIncomplete: Array<{ id: string; title: string; tags: string[]; project: string | null }>;
  todayTasks: Array<{ id: string; title: string; priority: string | null; tags: string[]; project: string | null }>;
  overdueTasks: Array<{ id: string; title: string; dueDate: string; tags: string[]; project: string | null }>;
  recentCompletions: Array<{ id: string; title: string; completedAt: string | null }>;
}

class AccountabilityService {
  async buildTaskSnapshot(userId: string, timezone: string): Promise<TaskSnapshot> {
    const now = DateTime.now().setZone(timezone);
    const todayStr = now.toFormat("yyyy-MM-dd");
    const yesterdayStr = now.minus({ days: 1 }).toFormat("yyyy-MM-dd");

    const todoInclude = {
      tags: {
        select: {
          tag: { select: { name: true } },
        },
      },
      project: { select: { name: true } },
    };

    // Yesterday's completed tasks
    const yesterdayCompleted = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: yesterdayStr,
        completed: true,
      },
      include: todoInclude,
    });

    // Yesterday's incomplete tasks
    const yesterdayIncomplete = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: yesterdayStr,
        completed: false,
      },
      include: todoInclude,
    });

    // Today's tasks
    const todayTasks = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: todayStr,
        completed: false,
      },
      include: todoInclude,
      orderBy: { sortKey: "asc" },
    });

    // Overdue tasks (before today, not completed)
    const overdueTasks = await prisma.todo.findMany({
      where: {
        userId,
        dueDate: { lt: todayStr },
        completed: false,
      },
      include: todoInclude,
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    // Recent completions (last 3 days)
    const threeDaysAgo = now.minus({ days: 3 }).toJSDate();
    const recentCompletions = await prisma.todo.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: threeDaysAgo },
      },
      include: todoInclude,
      orderBy: { completedAt: "desc" },
      take: 10,
    });

    const mapTask = (t: any) => ({
      id: t.id,
      title: t.title,
      priority: t.priority || null,
      tags: t.tags.map((tt: any) => tt.tag.name),
      project: t.project?.name || null,
      dueDate: t.dueDate || "",
      completedAt: t.completedAt?.toISOString() || null,
    });

    return {
      yesterdayCompleted: yesterdayCompleted.map(mapTask),
      yesterdayIncomplete: yesterdayIncomplete.map(mapTask),
      todayTasks: todayTasks.map(mapTask),
      overdueTasks: overdueTasks.map(mapTask),
      recentCompletions: recentCompletions.map(mapTask),
    };
  }

  async computeCompletionRate(userId: string, days: number): Promise<number> {
    const since = DateTime.now().minus({ days }).toFormat("yyyy-MM-dd");

    const snapshots = await prisma.accountabilitySnapshot.findMany({
      where: {
        userId,
        snapshotDate: { gte: since },
      },
    });

    if (snapshots.length === 0) {
      // Fall back to direct task query
      const totalDue = await prisma.todo.count({
        where: {
          userId,
          dueDate: { gte: since },
          parentId: null,
        },
      });
      if (totalDue === 0) return 0;

      const completed = await prisma.todo.count({
        where: {
          userId,
          dueDate: { gte: since },
          completed: true,
          parentId: null,
        },
      });
      return Math.round((completed / totalDue) * 100);
    }

    const totalDue = snapshots.reduce((sum, s) => sum + s.totalTasksDue, 0);
    const totalCompleted = snapshots.reduce((sum, s) => sum + s.tasksCompleted, 0);

    if (totalDue === 0) return 0;
    return Math.round((totalCompleted / totalDue) * 100);
  }

  formatTasksForPrompt(tasks: Array<{ title: string; tags?: string[]; project?: string | null; priority?: string | null; dueDate?: string }>): string {
    if (tasks.length === 0) return "None";

    return tasks
      .map((t) => {
        const parts = [`- ${t.title}`];
        if (t.priority) parts.push(`[${t.priority}]`);
        if (t.tags && t.tags.length > 0) parts.push(`(${t.tags.map((tag) => `#${tag}`).join(" ")})`);
        if (t.project) parts.push(`in "${t.project}"`);
        if (t.dueDate) parts.push(`due ${t.dueDate}`);
        return parts.join(" ");
      })
      .join("\n");
  }

  async identifyPatterns(userId: string): Promise<{
    mostProductiveDay: string | null;
    leastProductiveDay: string | null;
    problematicTags: Array<{ tag: string; rate: number }>;
    problematicProjects: Array<{ project: string; rate: number }>;
  }> {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const since = DateTime.now().minus({ days: 30 }).toFormat("yyyy-MM-dd");

    const snapshots = await prisma.accountabilitySnapshot.findMany({
      where: {
        userId,
        snapshotDate: { gte: since },
      },
    });

    if (snapshots.length === 0) {
      return { mostProductiveDay: null, leastProductiveDay: null, problematicTags: [], problematicProjects: [] };
    }

    // Day-of-week analysis
    const dayStats: Record<number, { due: number; completed: number }> = {};
    for (const s of snapshots) {
      if (!dayStats[s.dayOfWeek]) dayStats[s.dayOfWeek] = { due: 0, completed: 0 };
      const ds = dayStats[s.dayOfWeek]!;
      ds.due += s.totalTasksDue;
      ds.completed += s.tasksCompleted;
    }

    let mostProductiveDay: string | null = null;
    let leastProductiveDay: string | null = null;
    let highestRate = -1;
    let lowestRate = 101;

    for (const [day, stats] of Object.entries(dayStats)) {
      if (stats.due === 0) continue;
      const rate = stats.completed / stats.due;
      if (rate > highestRate) {
        highestRate = rate;
        mostProductiveDay = dayNames[Number(day)] ?? null;
      }
      if (rate < lowestRate) {
        lowestRate = rate;
        leastProductiveDay = dayNames[Number(day)] ?? null;
      }
    }

    // Tag analysis - aggregate from snapshots
    const tagStats: Record<string, { due: number; completed: number }> = {};
    for (const s of snapshots) {
      const breakdown = s.tagBreakdown as Record<string, { due: number; completed: number }> | null;
      if (!breakdown) continue;
      for (const [tag, stats] of Object.entries(breakdown)) {
        if (!tagStats[tag]) tagStats[tag] = { due: 0, completed: 0 };
        const ts = tagStats[tag]!;
        ts.due += stats.due;
        ts.completed += stats.completed;
      }
    }

    const problematicTags = Object.entries(tagStats)
      .filter(([_, stats]) => stats.due >= 3) // Only consider tags with enough data
      .map(([tag, stats]) => ({ tag, rate: Math.round((stats.completed / stats.due) * 100) }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);

    // Project analysis
    const projectStats: Record<string, { due: number; completed: number }> = {};
    for (const s of snapshots) {
      const breakdown = s.projectBreakdown as Record<string, { due: number; completed: number }> | null;
      if (!breakdown) continue;
      for (const [project, stats] of Object.entries(breakdown)) {
        if (!projectStats[project]) projectStats[project] = { due: 0, completed: 0 };
        const ps = projectStats[project]!;
        ps.due += stats.due;
        ps.completed += stats.completed;
      }
    }

    const problematicProjects = Object.entries(projectStats)
      .filter(([_, stats]) => stats.due >= 3)
      .map(([project, stats]) => ({ project, rate: Math.round((stats.completed / stats.due) * 100) }))
      .sort((a, b) => a.rate - b.rate)
      .slice(0, 3);

    return { mostProductiveDay, leastProductiveDay, problematicTags, problematicProjects };
  }

  async computeStreak(userId: string): Promise<number> {
    const snapshots = await prisma.accountabilitySnapshot.findMany({
      where: { userId },
      orderBy: { snapshotDate: "desc" },
      take: 60,
    });

    let streak = 0;
    for (const s of snapshots) {
      if (s.totalTasksDue === 0) continue;
      if (s.tasksCompleted >= s.totalTasksDue) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}

const accountabilityService = new AccountabilityService();
export default accountabilityService;
