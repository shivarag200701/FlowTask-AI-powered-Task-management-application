import { Router } from "express";
import { requireLogin } from "../../../middleware/requireLogin.js";
import prisma from "../../../db/index.js";
import {
  createSlug,
  CreateWorkspaceSchema,
  INVITE_ERROR_CODES,
  JoinWorkspaceSchema,
  PatchWorkspaceMemberSchema,
} from "@shiva200701/todotypes";
import { nanoid } from "../../../utils/nanoid.js";
import inviteRouter from "./invite/index.js";
import multer from "multer";
import { S3 } from "../../../services/s3/index.js";
import hashToken from "../../../utils/hash-token.js";
import z from "zod";
import { extractWorkspaceId } from "../../../middleware/extractWorkspaceId.js";
import { requireWorkspaceMember } from "../../../middleware/requireWorkspaceMember.js";
import { requireWorkspaceOwner } from "../../../middleware/requireWorkspaceOwner.js";

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
        //check if the user already has a workspace, currently only one can create/be owner only one workspace
        const count = await prisma.workspaceMember.count({
          where: {
            userId,
            role: "owner",
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

  try {
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

    await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
      },
    });

    return res.status(200).json({
      msg: "Successfully joined the workspace",
      workspaceSlug: workspace.slug,
    });
  } catch (error) {
    console.error("Error while accepting invite code", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
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

workspaceRouter.get(
  "/:id",
  requireLogin,
  extractWorkspaceId,
  requireWorkspaceMember,
  async (req, res) => {
    const workspaceId = req.workspaceId!;
    const workspaceMember = req.workspaceMember;

    try {
      const workspace = await prisma.workspace.findFirst({
        where: {
          OR: [{ id: workspaceId }, { slug: workspaceId }],
        },
      });

      if (!workspace) {
        return res.status(404).json({
          msg: "Workspace not found",
        });
      }

      return res.status(200).json({
        workspace: {
          ...workspace,
          currentUserRole: workspaceMember?.role,
        },
      });
    } catch (error) {
      console.error("error while getting workspace information", error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  }
);

workspaceRouter.get(
  "/:id/members",
  requireLogin,
  extractWorkspaceId,
  requireWorkspaceMember,
  async (req, res) => {
    const workspaceId = req.workspaceId!;

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
      const members = await prisma.workspaceMember.findMany({
        where: {
          workspaceId,
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      const invited = await prisma.workspaceInvite.findMany({
        where: {
          workspaceId,
        },
        select: {
          email: true,
          createdAt: true,
        },
      });

      return res.status(200).json({
        members,
        invited,
      });
    } catch (error) {
      console.error("Unable to fetch memebers of the workspace", error);
      return res.status(500).json("Internal server error");
    }
  }
);

workspaceRouter.patch(
  "/:id/members/:memberId",
  requireLogin,
  extractWorkspaceId,
  requireWorkspaceMember,
  requireWorkspaceOwner,
  async (req, res) => {
    const userId = req.userId;
    const workspaceId = req.workspaceId!;
    const workspaceMember = req.workspaceMember!;

    const memberId = Array.isArray(req.params.memberId)
      ? req.params.memberId[0]
      : req.params.memberId;

    if (!memberId) {
      return res.status(400).json({
        msg: "No member id found in path",
      });
    }

    const { success, data, error } = PatchWorkspaceMemberSchema.safeParse(
      req.body
    );

    if (!success) {
      return res.status(400).json({
        msg: "Send proper data",
        error,
      });
    }

    // user cannot change their own role
    if (memberId === workspaceMember.id) {
      return res.status(403).json({
        msg: "You cannot change your own role",
      });
    }

    const { role } = data;

    try {
      await prisma.workspaceMember.update({
        where: {
          id: memberId,
          workspaceId,
        },
        data: {
          role,
        },
      });

      return res.status(200).json({
        msg: "Member updated Successfully",
      });
    } catch (error) {
      console.error("Error while updating member", error);
      return res.status(500).json({
        msg: "Internal server Error",
      });
    }
  }
);

workspaceRouter.delete(
  "/:id/members/:memberId",
  requireLogin,
  extractWorkspaceId,
  requireWorkspaceMember,
  async (req, res) => {
    const userId = req.userId;
    const workspaceId = req.workspaceId!;
    const workspaceMember = req.workspaceMember!;

    const memberId = Array.isArray(req.params.memberId)
      ? req.params.memberId[0]
      : req.params.memberId;

    if (!memberId) {
      return res.status(400).json({
        msg: "No member id found in path",
      });
    }

    //leaving the group, do not need to be an owner

    try {
      if (memberId === workspaceMember.id) {
        //removing last owner
        if (workspaceMember.role === "owner") {
          const ownerCount = await prisma.workspaceMember.count({
            where: { workspaceId: req.workspaceId!, role: "owner" },
          });
          if (ownerCount <= 1) {
            return res.status(400).json({
              msg: "You are the only owner. Transfer ownership before leaving.",
            });
          }
        }
        await prisma.workspaceMember.delete({
          where: {
            id: memberId,
          },
        });

        return res.status(200).json({
          msg: "You have successfully left the workspace",
        });
      }

      if (workspaceMember.role !== "owner") {
        return res.status(403).json({
          msg: "Only owner can remove other members from the workspace",
        });
      }

      await prisma.workspaceMember.delete({
        where: {
          id: memberId,
        },
      });

      return res.status(200).json({
        msg: "You have successfully removed the member from the workspace",
      });
    } catch (error) {
      console.error("Error while removing member", error);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  }
);

workspaceRouter.use(
  "/:id/invite",
  requireLogin,
  extractWorkspaceId,
  inviteRouter
);
