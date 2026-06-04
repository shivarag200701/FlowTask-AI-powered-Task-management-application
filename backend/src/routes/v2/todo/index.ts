import { Router } from "express";
import {
  CreateTodoSchema,
  todoQuerySchema,
  UpdateTodoSchema,
} from "@shiva200701/todotypes";
import { requireLogin } from "../../../middleware.js";
import { generateSortKey } from "../../../utils/todo-ordering.js";
import prisma from "../../../db/index.js";
import constructPatchPayload from "../../../utils/construct-patch-payload.js";
import { bulkTodoRouter } from "./bulk.js";
import { searchService } from "../../../services/search/index.js";

const todoRouter = Router();

todoRouter.use("/bulk", bulkTodoRouter);

todoRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  const { data, success, error } = todoQuerySchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper query params",
      error,
    });
  }

  const { tagIds, completed } = data;

  const tagIdArray = tagIds?.split(",");

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }
  try {
    const rawTodos = await prisma.todo.findMany({
      where: {
        userId,
        ...(tagIdArray?.length
          ? {
              tags: { some: { tagId: { in: tagIdArray } } },
            }
          : {}),
        ...(completed !== undefined ? { completed: completed === "true" } : {}),
      },
      include: {
        notifications: true,
        children: true,
        tags: {
          select: {
            tag: {
              select: {
                name: true,
                id: true,
                color: true,
              },
            },
          },
        },
      },
      ...(completed === "true"
        ? { orderBy: { completedAt: "desc" as const } }
        : {}),
    });

    const todos = rawTodos.map((todo) => ({
      ...todo,
      tags: todo.tags.map(({ tag }) => ({
        name: tag.name,
        id: tag.id,
        color: tag.color,
      })),
    }));

    return res.status(200).json({ todos });
  } catch (error) {
    console.error("Failed getting todos", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.post("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { data, success, error } = CreateTodoSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const {
    title,
    description,
    priority,
    dueDate,
    dueTime,
    color,
    //todo, Reminder not yet hooked up
    reminder,
    isAllDay,
    tags,
    parentId,
    projectId,
    projectSectionId,
  } = data;

  let InboxProjectId: string = "";

  if (!projectId) {
    const inbox = await prisma.project.findFirst({
      where: { userId, isDefault: true },
      select: { id: true },
    });
    InboxProjectId = inbox?.id!;
  }

  try {
    if (parentId) {
      const parent = await prisma.todo.findFirst({
        where: { userId, id: parentId },
      });

      if (!parent) {
        return res.status(400).json({
          msg: "A task with the parent Id does not exist, Create the parent task first",
        });
      }
      if (parent?.parentId) {
        return res
          .status(400)
          .json({ msg: "Cannot create subtask of a subtask" });
      }
    }

    const last = await prisma.todo.findFirst({
      where: { userId, dueDate },
      orderBy: { sortKey: "desc" },
      select: { sortKey: true },
    });

    const sortKey = generateSortKey(last ? last.sortKey : null, null);

    const todo = await prisma.todo.create({
      data: {
        userId,
        title,
        description: description ?? null,
        priority,
        dueDate,
        dueTime: dueTime ?? null,
        color: color ?? null,
        sortKey,
        isAllDay: isAllDay ?? null,
        parentId: parentId ?? null,
        projectId: projectId ?? InboxProjectId ?? null,
        projectSectionId: projectSectionId ?? null,
        tags: {
          create:
            tags?.map((tagId) => ({
              tag: {
                connect: { id: tagId },
              },
            })) ?? [],
        },
      },
    });

    searchService.upsertTodo(todo).catch((err) => {
      console.error("Meilisearch sync failed (create)", err);
    });

    return res.status(201).json({
      msg: "todo added sucessfully",
      todo,
    });
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.get("/search", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ msg: "unauthorized" });
  }

  const query = req.query.q;
  if (typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ msg: "Query parameter 'q' is required" });
  }

  try {
    const { todos, tags } = await searchService.search(userId, query.trim());
    return res.status(200).json({ todos, tags });
  } catch (error) {
    console.error("Search failed", error);
    return res.status(500).json({ msg: "Search failed" });
  }
});

todoRouter.post("/search/reindex", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ msg: "unauthorized" });
  }

  try {
    const result = await searchService.reindexUser(userId);

    return res.status(200).json({
      msg: "Reindex started",
      ...result,
    });
  } catch (error) {
    console.error("Reindex failed", error);
    return res.status(500).json({ msg: "Reindex failed" });
  }
});

//fix string id for todo
todoRouter.patch("/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!idParam) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }
  try {
    const existing = await prisma.todo.findFirst({
      where: { id: idParam, userId },
    });

    if (!existing) {
      return res.status(404).json({ msg: "Todo not found" });
    }

    const { data, success, error } = UpdateTodoSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        msg: "Send proper data",
        error,
      });
    }

    const patch = data;

    const updateData = constructPatchPayload(patch);

    const updatedTodo = await prisma.todo.update({
      where: { id: idParam, userId },
      data: {
        ...updateData,
        ...(patch.tags !== undefined && {
          tags: {
            deleteMany: {},
            create: patch.tags.map((tagId) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
      },
    });

    //update child todo to completed
    if (updateData.completed) {
      await prisma.todo.updateMany({
        where: { parentId: updatedTodo.id, userId },
        data: { completed: true, completedAt: new Date() },
      });
    }

    // Sync to Meilisearch (fire-and-forget)
    searchService.upsertTodo(updatedTodo).catch((err) => {
      console.error("Meilisearch sync failed (update)", err);
    });

    // If completing parent, also sync children
    if (updateData.completed) {
      prisma.todo
        .findMany({
          where: { parentId: updatedTodo.id, userId },
        })
        .then((children) => {
          const docs = children.map((child) => ({
            id: child.id,
            title: child.title,
            description: child.description,
            userId: child.userId,
            completed: child.completed,
            priority: child.priority,
            parentId: child.parentId,
            dueDate: child.dueDate,
            createdAt: child.createdAt.toISOString(),
          }));
          if (docs.length > 0) {
            searchService.bulkUpsert(docs).catch((err) => {
              console.error("Meilisearch sync failed (children)", err);
            });
          }
        })
        .catch((err) => {
          console.error("Meilisearch child sync failed", err);
        });
    }

    return res.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    console.error("Error while updating todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

todoRouter.delete("/:id", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!idParam) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }

  try {
    // Get children IDs before deleting (cascade will remove them)
    const children = await prisma.todo.findMany({
      where: { parentId: idParam },
      select: { id: true },
    });

    await prisma.todo.delete({
      where: { id: idParam },
    });

    // Sync to Meilisearch (fire-and-forget)
    const idsToDelete = [idParam, ...children.map((c) => c.id)];
    searchService.deleteTodos(idsToDelete).catch((err) => {
      console.error("Meilisearch sync failed (delete)", err);
    });

    return res.status(200).json({
      msg: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("failed to delete todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

export default todoRouter;
