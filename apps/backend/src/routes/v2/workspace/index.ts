import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import prisma from "../../../db/index.js";
import { createSlug, CreateWorkspaceSchema } from "@shiva200701/todotypes";

export const workspaceRouter = Router();

workspaceRouter.post("/", requireLogin, async (req, res) => {
  const userId = req.userId;

  const { success, data, error } = CreateWorkspaceSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  try {
    const { name } = data;
    //Create an invite code
    const workspace = await prisma.$transaction(async (tx) => {
      //check if the user already has a workspace, currently only one can create only one workspace
      const count = await prisma.workspace.count({
        where: {
          createdBy: userId,
        },
      });

      if (count >= 1) {
        throw new Error("WORKSPACE_LIMIT");
      }

      const newWorkspace = await tx.workspace.create({
        data: {
          name,
          createdBy: userId,
          members: {
            create: {
              userId,
              role: "owner",
            },
          },
        },
      });

      const slug = createSlug(name, newWorkspace.id);

      return tx.workspace.update({
        where: { id: newWorkspace.id },
        data: {
          slug,
        },
      });
    });

    return res.status(201).json({
      workspace,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WORKSPACE_LIMIT") {
      return res.status(409).json({
        msg: "You're not allowed to create more than one workspace",
      });
    }
    console.error("error while creating workspace", error);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
});

//get all workspaces that the user is a part of and also the owner, does not return the full result
workspaceRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.userId;

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    return res.status(200).json({
      workspaces,
    });
  } catch (error) {
    console.error("error while getting workspaces for a user", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
});

workspaceRouter.get("/:id", requireLogin, async (req, res) => {
  const userId = req.userId;

  const workspaceId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!workspaceId) {
    return res.status(400).json({
      msg: "No workspace id found in path",
    });
  }

  try {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: { some: { userId } },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                image: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return res.status(200).json({
      workspace,
    });
  } catch (error) {
    console.error("error while getting workspace information", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
});
