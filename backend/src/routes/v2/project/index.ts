import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import prisma from "../../../db/index.js";
import {
  CreateProjectSchema,
  createSlug,
  UpdateProjectSchema,
} from "@shiva200701/todotypes";
import z from "zod";

export const projectRouter = Router();

projectRouter.get("/personal", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const querySchema = z.object({
    search: z.string(),
  });

  const { data, success, error } = querySchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const { search } = data;

  try {
    const personalProjects = await prisma.project.findMany({
      where: {
        userId,
        personal: true,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    });

    return res.status(200).json({
      personalProjects,
    });
  } catch (e) {
    console.error("Failed Getting personal Projects", e);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

projectRouter.post("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  const { data, success, error } = CreateProjectSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper query params",
      error,
    });
  }

  const { name, personal, workspaceId } = data;

  if (!personal && !workspaceId) {
    return res.status(400).json({
      message:
        "The project should be part of personalProject or workspace project",
    });
  }

  if (personal && workspaceId) {
    return res.status(400).json({
      message: "A project can't be a personal project and in workspace",
    });
  }

  try {
    const project = await prisma.project.create({
      data: {
        userId,
        name,
        personal: personal ?? false,
        workSpaceId: workspaceId ?? null,
      },
    });

    const slug = createSlug(project.name, project.id);

    const updatedProject = await prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        slug,
      },
    });

    return res.status(200).json({
      message: "Successfully created project",
      project: updatedProject,
    });
  } catch (e) {
    console.error("Failed Creating project", e);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

projectRouter.get("/:id", requireLogin, async (req, res) => {
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
      msg: "No project id found in path",
    });
  }

  try {
    const project = await prisma.project.findUnique({
      where: {
        id: idParam,
      },
      include: {
        todos: true,
      },
    });

    return res.status(200).json({
      project,
    });
  } catch (e) {
    console.error("Error while fetching Project", e);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

projectRouter.put("/:id", requireLogin, async (req, res) => {
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
      msg: "No project id found in path",
    });
  }

  const { data, success, error } = UpdateProjectSchema.safeParse(req.body);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper update data",
      error,
    });
  }

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([key, value]) => value !== undefined)
  );

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ msg: "Send at least one field to update" });
  }

  try {
    const updatedProject = await prisma.project.update({
      where: { userId, id: idParam },
      data: updateData,
    });

    return res.status(200).json({
      message: "project updated successfully",
      project: updatedProject,
    });
  } catch (e) {
    console.error("failed to updated project", error);
    return res.status(500).json({
      msg: "failed to updated project",
    });
  }
});
