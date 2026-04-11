import { Router } from "express";
import { CreateTodoSchema, UpdateTodoSchema } from "@shiva200701/todotypes";
import { requireLogin } from "../../middleware.js";
import { generateSortKey } from "../../utils/todo-ordering.js";
import prisma from "../../db/index.js";
import { Prisma } from "@prisma/client";
import { log } from "console";

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

    return res.status(200).json({
      todos: todos.map(({ dueOn, dueAt, ...rest }) => ({
        ...rest,
        due: dueAt ?? dueOn ?? null,
      })),
    });
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

  const { title, description, priority, due, color, reminder, isAllDay } = data;

  try {
    const last = await prisma.todo.findFirst({
      where: { userId, dueOn: due },
      orderBy: { sortKey: "asc" },
      select: { sortKey: true },
    });

    const sortKey = generateSortKey(last ? last.sortKey : null, null);

    const todo = await prisma.todo.create({
      data: {
        userId,
        title,
        description: description ?? null,
        priority,
        dueOn: isAllDay ? due : null,
        dueAt: !isAllDay ? due : null,
        color: color ?? null,
        sortKey,
        isAllDay: isAllDay ?? null,
      },
    });

    return res.status(201).json({
      msg: "todo added sucessfully",
      todo: { ...todo, due },
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
    const updateData: Prisma.TodoUpdateInput = {};

    //Todo move this to seperate function
    if (patch.title !== undefined) updateData.title = patch.title;
    if (patch.description !== undefined)
      updateData.description = patch.description;
    if (patch.priority !== undefined) updateData.priority = patch.priority;
    if (patch.color !== undefined) updateData.color = patch.color;
    if (patch.isAllDay !== undefined) updateData.isAllDay = patch.isAllDay;
    if (patch.due !== undefined) {
      if (patch.due === null) {
        updateData.dueOn = null;
        updateData.dueAt = null;
      } else {
        const allDay = patch.isAllDay ?? existing.isAllDay ?? true;
        updateData.dueOn = allDay ? patch.due : null;
        updateData.dueAt = allDay ? null : patch.due;
        updateData.isAllDay = allDay;
      }
    }
    if (patch.prevIndex !== undefined || patch.nextIndex !== undefined) {
      updateData.sortKey = generateSortKey(
        patch.prevIndex ?? null,
        patch.nextIndex ?? null,
      );
    }
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

export default todoRouter;
