import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import { createId } from "../../../utils/create-id.js";
import {
  CreateTagSchema,
  GetTagsQuerySchema,
  RESOURCE_COLORS,
} from "@shiva200701/todotypes";
import randomValue from "../../../utils/random-value.js";
import prisma from "../../../db/index.js";
import { Prisma } from "@prisma/client";
import bulkTagRouter from "./bulk.js";
import { searchService } from "../../../services/search/index.js";

const tagRouter = Router();
tagRouter.use("/bulk", bulkTagRouter);

//get all tags or use filter
tagRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.userId;

  const { data, success, error } = GetTagsQuerySchema.safeParse(req.query);

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
  const userId = req.userId;

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

    // Sync to Meilisearch (fire-and-forget)
    searchService
      .upsertTag({ id: tag.id, name: tag.name, color: tag.color, userId })
      .catch((err) => {
        console.error("Meilisearch sync failed (tag create)", err);
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

tagRouter.patch("/:id", requireLogin, async (req, res) => {
  const userId = req.userId;

  const idParam = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!idParam) {
    return res.status(400).json({
      msg: "No todo id found in path",
    });
  }

  try {
    const existing = prisma.tag.findFirst({
      where: { id: idParam, userId },
    });
    if (!existing) {
      return res.status(404).json({ msg: "Tag not found" });
    }

    const { data, success, error } = CreateTagSchema.partial().safeParse(
      req.body
    );
    if (!success) {
      return res.status(400).json({
        msg: "Send proper data",
        error,
      });
    }

    const { color, name } = data;

    let updateData: Prisma.TagUpdateInput = {};

    if (color !== undefined) updateData.color = color;
    if (name !== undefined) updateData.name = name;

    const updatedTag = await prisma.tag.update({
      where: { id: idParam, userId },
      data: {
        ...updateData,
      },
    });

    // Sync tag to Meilisearch (fire-and-forget)
    searchService
      .upsertTag({
        id: updatedTag.id,
        name: updatedTag.name,
        color: updatedTag.color,
        userId,
      })
      .catch((err) => {
        console.error("Meilisearch sync failed (tag update)", err);
      });

    return res.status(200).json({
      tag: updatedTag,
    });
  } catch (error) {
    console.error("Error while adding todo", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

tagRouter.get("/count", requireLogin, async (req, res) => {
  const userId = req.userId;

  try {
    const count = await prisma.tag.count({
      where: { userId },
    });

    return res.status(200).json({
      count,
    });
  } catch (error) {}
});

export default tagRouter;
