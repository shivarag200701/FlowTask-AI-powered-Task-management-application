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
import bulkTagRouter from "../tag/bulk.js";
import { bulkTodoRouter } from "./bulk.js";

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

  const { tagIds } = data;

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
      },
      include: {
        notifications: true,
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
    reminder,
    isAllDay,
    tags,
  } = data;

  try {
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
    await prisma.todo.delete({
      where: { id: idParam },
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
