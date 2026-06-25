import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import prisma from "../../../db/index.js";
import {
  createSlug,
  CreateWorkspaceSchema,
  INVITE_ERROR_CODES,
  JoinWorkspaceSchema,
} from "@shiva200701/todotypes";
import { nanoid } from "../../../utils/nanoid.js";
import inviteRouter from "./invite/index.js";
import multer from "multer";
import { S3 } from "../../../services/s3/index.js";
import hashToken from "../../../utils/hash-token.js";

export const workspaceRouter = Router();

const CDN_URL = process.env.CDN_URL;
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    const fileTypes = ["image/jpeg", "image/png"];

    callback(null, fileTypes.includes(file.mimetype));
  },
});

workspaceRouter.post(
  "/",
  requireLogin,
  upload.single("image"),
  async (req, res) => {
    const userId = req.userId;

    const { success, data, error } = CreateWorkspaceSchema.safeParse(req.body);
    if (!success) {
      return res.status(400).json({
        msg: "Send proper data",
        error,
      });
    }

    try {
      const { name, slug } = data;
      const file = req.file;

      let imageURL: string | undefined;

      const finalSlug = createSlug(slug ?? name);

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

        const existingSlug = await tx.workspace.findUnique({
          where: { slug: finalSlug },
        });

        if (existingSlug) {
          throw new Error("SLUG_TAKEN");
        }

        const newWorkspace = await tx.workspace.create({
          data: {
            name,
            slug: finalSlug,
            createdBy: userId,
            inviteCode: nanoid(24),
            members: {
              create: {
                userId,
                role: "owner",
              },
            },
          },
        });

        if (file) {
          const key = `workspace/logos/${newWorkspace.id}_${nanoid(7)}`;

          await S3.upload({
            key: key,
            body: file.buffer,
            contentType: file.mimetype,
          });

          //todo add cdn url infront after setting up cloud front
          imageURL = `${CDN_URL}${key}`;

          return tx.workspace.update({
            where: { id: newWorkspace.id },
            data: { icon: imageURL },
          });
        }
        return newWorkspace;
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
      if (error instanceof Error && error.message === "SLUG_TAKEN") {
        return res.status(409).json({
          msg: "This slug is already taken",
        });
      }
      console.error("error while creating workspace", error);
      return res.status(500).json({
        msg: "Internal Server Error",
      });
    }
  }
);

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

workspaceRouter.post("/invite/code/accept", requireLogin, async (req, res) => {
  const userId = req.userId;

  const { success, data, error } = JoinWorkspaceSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const { inviteCode } = data;

  const workspace = await prisma.workspace.findUnique({
    where: { inviteCode },
    include: {
      members: {
        where: {
          userId,
        },
      },
    },
  });

  if (!workspace) {
    return res.status(404).json({
      code: INVITE_ERROR_CODES.INVALID_ERROR_CODE,
      msg: "The invite link you are trying to use is invalid. Please contact the workspace owner for more information.",
    });
  }

  if (workspace.members.length > 0) {
    return res.status(409).json({
      code: INVITE_ERROR_CODES.ALREADY_MEMBER,
      msg: "You're already a member",
      workspaceSlug: workspace.slug,
    });
  }

  //add a check in the future to check the limit of the number of users

  await prisma.workspaceMember.create({
    data: {
      userId,
      workspaceId: workspace.id,
    },
  });

  return res.status(200).json({
    msg: "sucessfully joined the workspace",
    workspaceSlug: workspace.slug,
  });
});

workspaceRouter.get("/invite/email/preview", requireLogin, async (req, res) => {
  const token = req.query.token as string;
  const email = req.query.email as string;

  if (!token || !email) {
    return res.status(400).json({
      msg: "Token and email are required",
    });
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: { token: hashToken(token), identifier: email },
      },
    });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return res.status(400).json({
        msg: "Invalid or expired token",
      });
    }

    const invite = await prisma.workspaceInvite.findFirst({
      where: { email, workspaceId: verificationToken.workspaceId! },
      include: {
        workspace: {
          select: {
            name: true,
            icon: true,
            slug: true,
            _count: { select: { members: true } },
            id: true,
          },
        },
      },
    });

    if (!invite || invite.expires < new Date()) {
      return res.status(404).json({
        msg: "Invite expired or Invalid token",
        description:
          "This invite link is no longer valid. Ask the workspace admin to send a new one.",
      });
    }

    return res.json({
      workspace: {
        name: invite.workspace.name,
        icon: invite.workspace.icon,
        memberCount: invite.workspace._count.members,
        slug: invite.workspace.slug,
        id: invite.workspace.id,
      },
      role: invite.role,
      email: invite.email,
    });
  } catch (error) {
    console.error("Error while getting preview of invite", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
});

workspaceRouter.get("/check-slug", requireLogin, async (req, res) => {
  const userId = req.userId;

  let slug = (req.query.slug as string) || "";

  slug = createSlug(slug);
  if (!slug) {
    return res.status(400).json({
      msg: "Slug not found in the query param",
    });
  }

  try {
    const existingSlug = await prisma.workspace.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return res.status(409).json({
        msg: `The slug ${slug} is already in use`,
      });
    }

    res.status(200).json({
      msg: `Slug ${slug} available`,
    });
  } catch (error) {
    console.error("unable to verify the slug", error);
    return res.status(500).json({
      msg: "Internal Server Error",
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
        OR: [{ id: workspaceId }, { slug: workspaceId }],
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

workspaceRouter.use("/:id/invite", inviteRouter);
