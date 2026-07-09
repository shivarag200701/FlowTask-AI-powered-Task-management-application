import { Worker, Job } from "bullmq";
import prisma from "../../db/index.js";
import { DateTime } from "luxon";
import accountabilityService from "./AccountabilityService.js";
import openRouter from "../ai/OpenRouterService.js";
import { buildWeeklyInsightPrompt } from "../ai/prompts/accountability.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const connectionOptions = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  maxRetriesPerRequest: null,
};

async function processDailySnapshot() {
  console.log("[Accountability] Running daily snapshot job");

  const users = await prisma.userPrefrence.findMany({
    where: { accountabilityEnabled: true },
    select: { userId: true },
  });

  const yesterday = DateTime.now().minus({ days: 1 });
  const yesterdayStr = yesterday.toFormat("yyyy-MM-dd");
  const dayOfWeek = yesterday.weekday % 7; // Luxon: 1=Mon...7=Sun, convert to 0=Sun

  for (const { userId } of users) {
    try {
      // Get all tasks due yesterday
      const tasks = await prisma.todo.findMany({
        where: {
          userId,
          dueDate: yesterdayStr,
          parentId: null,
        },
        include: {
          tags: { select: { tag: { select: { name: true } } } },
          project: { select: { name: true } },
        },
      });

      const totalTasksDue = tasks.length;
      const tasksCompleted = tasks.filter((t) => t.completed).length;
      const tasksNotCompleted = tasks.filter((t) => !t.completed).length;

      // Late = completed after end of due day (simplified: completed after dueDate)
      const tasksCompletedLate = tasks.filter((t) => {
        if (!t.completed || !t.completedAt) return false;
        const completedDate = DateTime.fromJSDate(t.completedAt).toFormat("yyyy-MM-dd");
        return completedDate > yesterdayStr;
      }).length;

      // Tasks carried over = incomplete tasks from yesterday that still exist
      const tasksCarriedOver = tasksNotCompleted;

      // Tag breakdown
      const tagBreakdown: Record<string, { due: number; completed: number }> = {};
      for (const task of tasks) {
        for (const tt of task.tags) {
          const tagName = tt.tag.name;
          if (!tagBreakdown[tagName]) tagBreakdown[tagName] = { due: 0, completed: 0 };
          tagBreakdown[tagName].due++;
          if (task.completed) tagBreakdown[tagName].completed++;
        }
      }

      // Project breakdown
      const projectBreakdown: Record<string, { due: number; completed: number }> = {};
      for (const task of tasks) {
        const projectName = task.project?.name || "No Project";
        if (!projectBreakdown[projectName]) projectBreakdown[projectName] = { due: 0, completed: 0 };
        projectBreakdown[projectName].due++;
        if (task.completed) projectBreakdown[projectName].completed++;
      }

      await prisma.accountabilitySnapshot.upsert({
        where: {
          userId_snapshotDate: { userId, snapshotDate: yesterdayStr },
        },
        create: {
          userId,
          snapshotDate: yesterdayStr,
          totalTasksDue,
          tasksCompleted,
          tasksCompletedLate,
          tasksNotCompleted,
          tasksCarriedOver,
          tagBreakdown,
          projectBreakdown,
          dayOfWeek,
        },
        update: {
          totalTasksDue,
          tasksCompleted,
          tasksCompletedLate,
          tasksNotCompleted,
          tasksCarriedOver,
          tagBreakdown,
          projectBreakdown,
          dayOfWeek,
        },
      });
    } catch (err) {
      console.error(`[Accountability] Snapshot failed for user ${userId}:`, err);
    }
  }

  console.log(`[Accountability] Daily snapshot completed for ${users.length} users`);
}

async function processWeeklyInsights() {
  console.log("[Accountability] Running weekly insights job");

  const users = await prisma.userPrefrence.findMany({
    where: { accountabilityEnabled: true },
    select: {
      userId: true,
      accountabilityTone: true,
      user: { select: { name: true } },
    },
  });

  const weekEnd = DateTime.now().minus({ days: 1 });
  const weekStart = weekEnd.minus({ days: 6 });
  const weekStartStr = weekStart.toFormat("yyyy-MM-dd");
  const weekEndStr = weekEnd.toFormat("yyyy-MM-dd");

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (const { userId, accountabilityTone, user } of users) {
    try {
      const snapshots = await prisma.accountabilitySnapshot.findMany({
        where: {
          userId,
          snapshotDate: { gte: weekStartStr, lte: weekEndStr },
        },
        orderBy: { snapshotDate: "asc" },
      });

      if (snapshots.length === 0) continue;

      const totalDue = snapshots.reduce((s, snap) => s + snap.totalTasksDue, 0);
      const totalCompleted = snapshots.reduce((s, snap) => s + snap.tasksCompleted, 0);
      const overallCompletionRate = totalDue > 0 ? Math.round((totalCompleted / totalDue) * 100) : 0;

      // Get previous week's insight for comparison
      const prevInsight = await prisma.weeklyInsight.findFirst({
        where: { userId },
        orderBy: { weekStartDate: "desc" },
      });
      const previousWeekRate = prevInsight?.overallCompletionRate ?? null;

      // Determine trend
      let trend: "IMPROVING" | "DECLINING" | "STABLE" = "STABLE";
      if (previousWeekRate !== null) {
        if (overallCompletionRate > previousWeekRate + 5) trend = "IMPROVING";
        else if (overallCompletionRate < previousWeekRate - 5) trend = "DECLINING";
      }

      // Day-by-day breakdown
      const dayByDayBreakdown = snapshots
        .map((s) => `${dayNames[s.dayOfWeek]} (${s.snapshotDate}): ${s.tasksCompleted}/${s.totalTasksDue} completed`)
        .join("\n");

      // Tag & project breakdown
      const patterns = await accountabilityService.identifyPatterns(userId);

      const tagBreakdown = patterns.problematicTags
        .map((t) => `${t.tag}: ${t.rate}% completion`)
        .join("\n") || "No significant tag patterns";

      const projectBreakdown = patterns.problematicProjects
        .map((p) => `${p.project}: ${p.rate}% completion`)
        .join("\n") || "No significant project patterns";

      const tone = (accountabilityTone as "supportive" | "direct" | "tough") || "supportive";

      const summary = await openRouter.chatAccountability({
        systemPrompt: buildWeeklyInsightPrompt({
          tone,
          userName: user?.name || "",
          dayByDayBreakdown,
          overallCompletionRate,
          previousWeekRate,
          tagBreakdown,
          projectBreakdown,
          mostProductiveDay: patterns.mostProductiveDay || "N/A",
          leastProductiveDay: patterns.leastProductiveDay || "N/A",
        }),
        messages: [{ role: "user", content: "Generate my weekly insight summary." }],
      });

      await prisma.weeklyInsight.create({
        data: {
          userId,
          weekStartDate: weekStartStr,
          weekEndDate: weekEndStr,
          overallCompletionRate,
          previousWeekRate,
          trend,
          mostProductiveDay: patterns.mostProductiveDay,
          leastProductiveDay: patterns.leastProductiveDay,
          problematicTags: patterns.problematicTags,
          problematicProjects: patterns.problematicProjects,
          summary,
        },
      });
    } catch (err) {
      console.error(`[Accountability] Weekly insight failed for user ${userId}:`, err);
    }
  }

  console.log(`[Accountability] Weekly insights completed for ${users.length} users`);
}

async function processDailyStandupTrigger() {
  // This job would send notifications to users whose standup time matches
  // For now, it's a placeholder — the frontend polls/checks for standup availability
  console.log("[Accountability] Daily standup trigger check");
}

const accountabilityWorker = new Worker(
  "accountability",
  async (job: Job) => {
    switch (job.name) {
      case "daily-snapshot":
        await processDailySnapshot();
        break;
      case "weekly-insights":
        await processWeeklyInsights();
        break;
      case "daily-standup-trigger":
        await processDailyStandupTrigger();
        break;
      default:
        console.log(`[Accountability] Unknown job: ${job.name}`);
    }
  },
  { connection: connectionOptions }
);

accountabilityWorker.on("error", (err) => {
  console.error("[Accountability] Worker error:", err);
});

accountabilityWorker.on("completed", (job) => {
  console.log(`[Accountability] Job ${job.name} completed`);
});

console.log("Accountability worker has started");

export default accountabilityWorker;
