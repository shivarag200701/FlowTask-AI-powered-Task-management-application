import { Router } from "express";
import { requireLogin } from "../../middleware.js";
import { createId } from "../../utils/create-id.js";
import {
  CreateTagSchema,
  GetTagQuerySchema,
  RESOURCE_COLORS,
} from "@shiva200701/todotypes";
import randomValue from "../../utils/random-value.js";
import prisma from "../../db/index.js";

const tagRouter = Router();

//get all tags or use filter
tagRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { data, success, error } = GetTagQuerySchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const { search, ids } = data;

  try {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
        ...(search && {
          name: {
            contains: search,
          },
        }),
        ...(ids && {
          id: {
            in: ids,
          },
        }),
      },
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            todos: true,
          },
        },
      },
    });

    return res.status(200).json({
      tags,
    });
  } catch (error) {
    console.error("Failed getting/ filtering tags", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

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
        userId,
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
