import { Router } from "express";
import { CreateTodoSchema, UpdateTodoSchema } from "@shiva200701/todotypes";
import { requireLogin } from "../../middleware.js";
import { generateSortKey } from "../../utils/todo-ordering.js";
import prisma from "../../db/index.js";
import { Prisma } from "@prisma/client";
import constructPatchPayload from "../../utils/construct-patch-payload.js";

const todoRouter = Router();

todoRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      include: {
        notifications: true,
      },
    });

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
  } = data;

  try {
    const last = await prisma.todo.findFirst({
      where: { userId, dueDate },
      orderBy: { sortKey: "desc" },
      select: { sortKey: true },
    });

    console.log("last key", last?.sortKey);

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
      },
    });

    return res.status(201).json({
      msg: "todo added sucessfully",
      todo,
    });
  } catch {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

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
      where: { id: parseInt(idParam), userId },
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
      where: { id: parseInt(idParam), userId },
      data: updateData,
    });

    return res.status(200).json({
      todo: updatedTodo,
    });
  } catch (error) {
    console.error("Error while adding todo", error);
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
      where: { id: parseInt(idParam) },
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
