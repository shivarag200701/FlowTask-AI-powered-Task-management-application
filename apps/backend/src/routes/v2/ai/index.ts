import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import openRouter from "../../../services/ai/OpenRouterService.js";
import {
  AiParseTaskSchema,
  type ParsedTask,
} from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";

const aiRouter = Router();

aiRouter.post("/parse-task", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { success, data, error } = AiParseTaskSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }
  const response: ParsedTask = await openRouter.chat({ message: data.text, timezone: data.timezone });

  //check if the generated tasks exisits
  if (response.tags.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: {
        name: { in: response.tags },
        userId,
      },
    });

    if (existingTags.length !== response.tags.length) {
      return res.status(400).json({
        msg: "One or more specified tags do not exist, Create them first",
      });
    }
  }
  return res.status(200).json({
    response,
  });
});
export default aiRouter;
