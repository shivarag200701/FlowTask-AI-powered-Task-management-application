import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import openRouter from "../../../services/ai/OpenRouterService.js";
import {
  AiParseTaskSchema,
  ParsedTaskSchema,
  type ParsedTask,
} from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";

const aiRouter = Router();

aiRouter.post("/parse-task", requireLogin, async (req, res) => {
  const userId = req.userId;

  const { success, data, error } = AiParseTaskSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  try {
    const aiResponse = await openRouter.chat({
      message: data.text,
      timezone: data.timezone,
    });

    //validate AI response
    const {
      success: isValid,
      data: validatedResult,
      error: validationError,
    } = ParsedTaskSchema.safeParse(aiResponse);
    if (!isValid) {
      console.log("malformed ai response", validationError);
      return res.status(422).json({
        msg: "AI couldn't parse your input. Try rephrasing or add the task manually.",
      });
    }

    const tagNames: string[] = validatedResult.tags ?? [];
    const response: ParsedTask = { ...validatedResult, tags: [] };

    if (tagNames.length > 0) {
      const existingTags = await prisma.tag.findMany({
        where: {
          name: { in: tagNames },
          userId,
        },
      });

      if (existingTags.length !== tagNames.length) {
        return res.status(400).json({
          msg: "One or more specified tags do not exist, Create them first",
        });
      }

      response.tags = existingTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      }));
    }
    return res.status(200).json({
      response,
    });
  } catch (error) {
    console.error("Error while making API call to openRouter", error);
    res.status(500).json({
      msg: "Internal Server error",
    });
  }
});
export default aiRouter;
