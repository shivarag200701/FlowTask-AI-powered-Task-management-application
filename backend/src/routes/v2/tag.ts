import { Router } from "express";
import { requireLogin } from "../../middleware.js";
import { createId } from "../../utils/create-id.js";
import { CreateTagSchema, RESOURCE_COLORS } from "@shiva200701/todotypes";
import randomValue from "../../utils/random-value.js";
import prisma from "../../db/index.js";

const tagRouter = Router();

tagRouter.post("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { data, error, success } = CreateTagSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const { name, color } = data;

  const existingTag = await prisma.tag.findFirst({
    where: { name },
  });

  if (existingTag) {
    return res.status(400).json({
      msg: "A tag with the same name already exisits",
    });
  }

  try {
    const tag = await prisma?.tag.create({
      data: {
        id: createId({ prefix: "tag_" }),
        name,
        color: color || randomValue(RESOURCE_COLORS),
      },
    });

    return res.status(201).json({
      msg: "todo added sucessfully",
      tag,
    });
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

export default tagRouter;
