import prisma from "../../../../db/index.js";
import { generateSortKey } from "../../../../utils/todo-ordering.js";

export async function executeToolCall(
  toolName: string,
  args: Record<string, any>,
  userId: string,
  timezone: string
): Promise<string> {
  try {
    switch (toolName) {
      case "complete_task": {
        const task = await prisma.todo.findFirst({
          where: { id: args.task_id, userId },
        });
        if (!task) {
          return JSON.stringify({ success: false, error: `Task not found with id: ${args.task_id}` });
        }
        await prisma.todo.update({
          where: { id: args.task_id },
          data: { completed: true, completedAt: new Date() },
        });
        return JSON.stringify({
          success: true,
          task: { id: task.id, title: task.title },
        });
      }
      case "reschedule_task": {
        const task = await prisma.todo.findFirst({
          where: { id: args.task_id, userId },
        });
        if (!task) {
          return JSON.stringify({ success: false, error: `Task not found with id: ${args.task_id}` });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(args.new_date)) {
          return JSON.stringify({ success: false, error: `Invalid date format: ${args.new_date}. Use YYYY-MM-DD.` });
        }
        await prisma.todo.update({
          where: { id: args.task_id },
          data: { dueDate: args.new_date },
        });
        return JSON.stringify({
          success: true,
          task: { id: task.id, title: task.title, newDate: args.new_date },
        });
      }
      case "delete_task": {
        const task = await prisma.todo.findFirst({
          where: { id: args.task_id, userId },
        });
        if (!task) {
          return JSON.stringify({ success: false, error: `Task not found with id: ${args.task_id}` });
        }
        await prisma.todo.delete({ where: { id: args.task_id } });
        return JSON.stringify({
          success: true,
          task: { id: task.id, title: task.title },
        });
      }
      case "create_task": {
        if (args.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(args.due_date)) {
          return JSON.stringify({ success: false, error: `Invalid date format: ${args.due_date}. Use YYYY-MM-DD.` });
        }
        const last = await prisma.todo.findFirst({
          where: { userId, dueDate: args.due_date },
          orderBy: { sortKey: "desc" },
          select: { sortKey: true },
        });

        const sortKey = generateSortKey(last ? last.sortKey : null, null);
        const task = await prisma.todo.create({
          data: {
            userId,
            title: args.title,
            dueDate: args.due_date || null,
            priority: args.priority || null,
            sortKey,
          },
        });
        return JSON.stringify({
          success: true,
          task: { id: task.id, title: task.title },
        });
      }
      case "get_tasks_for_date": {
        const tasks = await prisma.todo.findMany({
          where: { userId, dueDate: args.date },
          include: {
            tags: { select: { tag: { select: { name: true } } } },
            project: { select: { name: true } },
          },
          orderBy: { sortKey: "asc" },
        });
        return JSON.stringify({
          success: true,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            priority: t.priority,
            tags: t.tags.map((tt: any) => tt.tag.name),
            project: t.project?.name || null,
          })),
        });
      }
      case "search_tasks": {
        const where: any = { userId };
        if (args.query) {
          where.title = { contains: args.query, mode: "insensitive" };
        }
        if (args.priority) {
          where.priority = args.priority;
        }
        if (args.completed !== undefined) {
          where.completed = args.completed;
        }
        if (args.tag) {
          where.tags = { some: { tag: { name: { equals: args.tag, mode: "insensitive" } } } };
        }
        if (args.project) {
          where.project = { name: { equals: args.project, mode: "insensitive" } };
        }

        const tasks = await prisma.todo.findMany({
          where,
          include: {
            tags: { select: { tag: { select: { name: true } } } },
            project: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        });
        return JSON.stringify({
          success: true,
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            completed: t.completed,
            priority: t.priority,
            dueDate: t.dueDate,
            tags: t.tags.map((tt: any) => tt.tag.name),
            project: t.project?.name || null,
          })),
        });
      }
      case "update_task_priority": {
        const task = await prisma.todo.findFirst({
          where: { id: args.task_id, userId },
        });
        if (!task) {
          return JSON.stringify({ success: false, error: `Task not found with id: ${args.task_id}` });
        }
        await prisma.todo.update({
          where: { id: args.task_id },
          data: { priority: args.priority },
        });
        return JSON.stringify({
          success: true,
          task: { id: task.id, title: task.title, priority: args.priority },
        });
      }
      case "list_projects": {
        const projects = await prisma.project.findMany({
          where: { userId },
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" },
        });
        return JSON.stringify({ success: true, projects });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    console.error(`Tool call error (${toolName}):`, err);
    return JSON.stringify({ success: false, error: `Failed to execute ${toolName}` });
  }
}
