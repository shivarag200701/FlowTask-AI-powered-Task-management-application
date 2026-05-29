import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import prisma from "../../../db/index.js";
import { CreateProjectSchema } from "@shiva200701/todotypes";

export const projectRouter = Router();

projectRouter.get("/personal", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  try {
    const personalProjects = await prisma.project.findMany({
      where: {
        userId,
        personal: true,
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

  const { name, personal, workSpaceId } = data;

  if (!personal && !workSpaceId) {
    return res.status(400).json({
      message:
        "The project should be part of personalProject or workspace project",
    });
  }

  if (personal && workSpaceId) {
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
        workSpaceId: workSpaceId ?? null,
      },
    });

    return res.status(200).json({
      message: "Successfully created project",
      project,
    });
  } catch (e) {
    console.error("Failed Creating project", e);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});
