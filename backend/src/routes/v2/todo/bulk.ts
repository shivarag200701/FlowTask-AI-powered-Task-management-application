import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import { TodoBulkDeleteSchema, UpdateTodoSchema } from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";
import constructPatchPayload from "../../../utils/construct-patch-payload.js";

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
      msg: "Need to send atleast one todo Id",
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

bulkTodoRouter.patch("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const BulkPatchSchema = UpdateTodoSchema.omit({
    color: true,
    description: true,
    nextIndex: true,
    prevIndex: true,
    title: true,
  });

  const { data, success, error } = TodoBulkDeleteSchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Todo Ids not sent",
      error,
    });
  }

  const todoIds = data.todoIds.split(",");

  if (todoIds.length === 0) {
    return res.status(400).json({
      msg: "Need to send atleast one todo Id",
    });
  }

  const {
    data: updateData,
    success: bodySuccess,
    error: bodyParseError,
  } = BulkPatchSchema.safeParse(req.body);

  if (!bodySuccess) {
    console.log("error parsing body", bodyParseError);

    return res.status(400).json({
      msg: "Send proper body",
      bodyParseError,
    });
  }

  const bulkUpdateData = constructPatchPayload(updateData);

  try {
    const { count: updatedCount } = await prisma.$transaction(async (tx) => {
      const result = await tx.todo.updateMany({
        where: { userId, id: { in: todoIds } },
        data: bulkUpdateData,
      });

      const tags = updateData.tags;
      if (tags !== undefined) {
        await tx.todoTag.deleteMany({
          where: { todoId: { in: todoIds } },
        });

        if (tags.length > 0) {
          await tx.todoTag.createMany({
            data: todoIds.flatMap((todoId) =>
              tags.map((tagId) => ({ todoId, tagId }))
            ),
            skipDuplicates: true,
          });
        }
      }

      return result;
    });

    return res.status(200).json({
      todos: updatedCount,
    });
  } catch (error) {
    console.error("Error while bulk updating todos", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});
