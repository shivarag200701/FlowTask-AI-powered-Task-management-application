import { Router } from "express";
import { CreateTodoSchema } from "@shiva200701/todotypes";
import { requireLogin } from "../../middleware.js";
import { generateSortKey } from "../../utils/todo-ordering.js";
import prisma from "../../db/index.js";

const todoRouter = Router();

todoRouter.post("/", requireLogin, async (req, res) => {
  const { data, success, error } = CreateTodoSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const {
    title,
    description,
    priority,
    completeAt,
    color,
    reminder,
    isAllDay,
  } = data;

  const last = await prisma.todo.findFirst({
    where: { userId, dueOn: completeAt },
    orderBy: { sortKey: "asc" },
    select: { sortKey: true },
  });

  const sortKey = generateSortKey(last ? last.sortKey : null, null);

  const todo = await prisma.todo.create({
    data: {
      userId,
      title,
      description,
      priority,
      dueOn: isAllDay ? completeAt : null,
      dueAt: !isAllDay ? completeAt : null,
      color: color ?? null,
      sortKey,
      isAllDay: isAllDay ?? null,
    },
  });

  return res.status(201).json({ msg: "todo added sucessfully", todo });
});

export default todoRouter;
