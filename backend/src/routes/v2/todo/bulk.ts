import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import { TodoBulkDeleteSchema } from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";

export const bulkTodoRouter = Router();

bulkTodoRouter.delete("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { success, data, error } = TodoBulkDeleteSchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const todoIds = data.todoIds.split(",");

  if (todoIds.length === 0) {
    return res.status(400).json({
      msg: "Need to send atleast one tag Id",
    });
  }

  try {
    const { count: deletedCount } = await prisma.todo.deleteMany({
      where: {
        userId,
        id: { in: todoIds },
      },
    });

    return res.status(200).json({ deletedCount });
  } catch (error) {
    console.error("Failed bulk deleting the todos", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});
