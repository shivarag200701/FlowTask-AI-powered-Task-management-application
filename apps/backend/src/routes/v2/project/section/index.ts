import { Router } from "express";
import { requireLogin } from "../../../../middleware.js";
import prisma from "../../../../db/index.js";
import {
  CreateProjectSectionSchema,
  UpdateProjectSectionSchema,
} from "@shiva200701/todotypes";
import { generateSortKey } from "../../../../utils/todo-ordering.js";
import type { Prisma } from "@prisma/client";

export const sectionRouter = Router({ mergeParams: true });

sectionRouter.post("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const projectId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!projectId) {
    return res.status(400).json({
      msg: "No project id found in path",
    });
  }

  const { data, error, success } = CreateProjectSectionSchema.safeParse(
    req.body
  );

  if (!success) {
    return res.status(400).json({
      msg: "Send proper body",
      error,
    });
  }

  const { name: sectionName } = data;

  try {
    const project = await prisma.project.findFirst({
      where: {
        userId,
        id: projectId,
      },
    });

    if (!project) {
      return res.status(400).json({
        msg: "Project with that id does not exist",
      });
    }

    const last = await prisma.projectSection.findFirst({
      where: { projectId },
      orderBy: { sortKey: "desc" },
      select: { sortKey: true },
    });

    const sortKey = generateSortKey(last ? last.sortKey : null, null);

    const section = await prisma.projectSection.create({
      data: { name: sectionName, sortKey, projectId },
    });

    return res.status(200).json({
      msg: "project section created",
      section,
    });
  } catch (error) {
    console.error("Failed Creating project section", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

sectionRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const projectId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!projectId) {
    return res.status(400).json({
      msg: "No project id found in path",
    });
  }

  try {
    const sections = await prisma.projectSection.findMany({
      where: {
        projectId,
      },
      include: {
        todos: true,
      },
    });

    return res.status(200).json({
      sections,
    });
  } catch (error) {
    console.error("Failed getting project section", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

sectionRouter.get("/:sectionId", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const projectId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!projectId) {
    return res.status(400).json({
      msg: "No project id found in path",
    });
  }

  const sectionId = Array.isArray(req.params.sectionId)
    ? req.params.sectionId[0]
    : req.params.sectionId;

  if (!sectionId) {
    return res.status(400).json({
      msg: "No section id found in path",
    });
  }

  try {
    const section = await prisma.projectSection.findUnique({
      where: { id: sectionId },
    });

    return res.status(200).json({
      section,
    });
  } catch (error) {
    console.error("Failed getting project section", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

sectionRouter.patch("/:sectionId", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const projectId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!projectId) {
    return res.status(400).json({
      msg: "No project id found in path",
    });
  }

  const sectionId = Array.isArray(req.params.sectionId)
    ? req.params.sectionId[0]
    : req.params.sectionId;

  if (!sectionId) {
    return res.status(400).json({
      msg: "No section id found in path",
    });
  }

  const { data, success, error } = UpdateProjectSectionSchema.safeParse(
    req.body
  );

  if (!success) {
    return res.status(400).json({
      msg: "send proper data",
      error,
    });
  }

  const { name, projectId: updatedProjectId, prevIndex, nextIndex } = data;

  let updateData: Prisma.ProjectSectionUpdateInput = {};

  updateData = {
    ...(name && { name }),
    ...(updatedProjectId && { project: { connect: { id: updatedProjectId } } }),
    ...((prevIndex !== undefined || nextIndex !== undefined) && {
      sortKey: generateSortKey(prevIndex ?? null, nextIndex ?? null),
    }),
  };

  try {
    const updatedSection = await prisma.projectSection.update({
      where: { id: sectionId },
      data: updateData,
    });

    return res.status(200).json({
      msg: "project section updated sucessfully",
      updatedSection,
    });
  } catch (error) {
    console.error("Failed updating project section", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

sectionRouter.delete("/:sectionId", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const projectId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!projectId) {
    return res.status(400).json({
      msg: "No project id found in path",
    });
  }

  const sectionId = Array.isArray(req.params.sectionId)
    ? req.params.sectionId[0]
    : req.params.sectionId;

  if (!sectionId) {
    return res.status(400).json({
      msg: "No section id found in path",
    });
  }

  try {
    await prisma.projectSection.delete({
      where: { id: sectionId },
    });

    return res.status(200).json({
      msg: "section deleted sucessfully",
    });
  } catch (error) {
    console.error("Failed deleting project section", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});
