import { Router } from "express";
import { requireLogin } from "../../../../middleware.js";
import prisma from "../../../../db/index.js";
import { nanoid } from "../../../../utils/nanoid.js";
import { EmailInvitesSchema } from "@shiva200701/todotypes";
import z from "zod";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../../../../services/email/EmailService.js";
import { randomBytes } from "crypto";
import hashToken from "../../../../utils/hash-token.js";
import { pluralize } from "@shiva200701/todotypes";

const inviteRouter = Router({ mergeParams: true });

export default inviteRouter;

inviteRouter.post("/code/reset", requireLogin, async (req, res) => {
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
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        inviteCode: nanoid(24),
      },
    });

    return res.status(200).json({
      inviteCode: workspace.inviteCode,
    });
  } catch (error) {
    console.error("Failed creating new Invite Code for workspace", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

inviteRouter.post("/email/send", requireLogin, async (req, res) => {
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
    const [workspace, user] = await Promise.all([
      prisma.workspace.findUnique({ where: { id: workspaceId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      }),
    ]);

    if (!workspace) return res.status(404).json({ msg: "Workspace not found" });
    if (!user || !user.email)
      return res.status(401).json({ msg: "User not found" });

    const { success, data, error } = EmailInvitesSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        msg: "Send proper data",
        error,
      });
    }

    const invited: string[] = [];
    const skipped: string[] = [];

    const { invites } = data;

    //check if any invited member is already is in teh workspace
    const alreadyInWorkspace = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        user: {
          email: { in: invites.map((i) => i.email) },
        },
      },
      select: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (alreadyInWorkspace && alreadyInWorkspace.length > 0) {
      const emailsInWorkspace = alreadyInWorkspace.map(
        (user) => user.user.email
      );

      return res.status(409).json({
        msg: `${pluralize("User", emailsInWorkspace.length)} ${emailsInWorkspace.join(", ")} already exists in this workspace.`,
      });
    }

    for (const { email, role } of invites) {
      try {
        await prisma.workspaceInvite.create({
          data: {
            email,
            role,
            expires: DateTime.now().plus({ days: 14 }).toJSDate(),
            workspaceId,
          },
        });

        invited.push(email);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          skipped.push(email);
          continue;
        }
        console.error("failed to add email to workspace Invites", error);
        return res.status(500).json({ msg: "Internal server error" });
      }
    }

    // const callbackURL = `${process.env.FRONTEND_URL}/app/workspaces/${workspace.slug}/invite`;

    await Promise.all(
      invited.map(async (email) => {
        const token = randomBytes(32).toString("hex");

        await prisma.verificationToken.create({
          data: {
            identifier: email,
            token: hashToken(token),
            expires: DateTime.now().plus({ days: 14 }).toJSDate(),
            workspaceId,
          },
        });
        const params = new URLSearchParams({
          token,
          email,
        });
        const callbackURL = `${process.env.FRONTEND_URL}/app/workspaces/${workspace.slug}/invite?${params.toString()}`;
        return sendEmail({
          template: "workspace-invite",
          email,
          senderEmail: user.email ?? "",
          workspaceName: workspace.name,
          senderName: user.name ?? "A teammate",
          callbackURL,
        });
      })
    );

    return res.status(200).json({
      invited,
      skipped,
    });
  } catch (error) {
    console.error("Error sending email invites", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

//introduce a cron job to delete verrification tokens, which are more than 1 day older
inviteRouter.post("/email/accept", requireLogin, async (req, res) => {
  const userId = req.userId;

  const email = req.session.email;

  const workspaceId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

  if (!workspaceId) {
    return res.status(400).json({
      msg: "No workspace id found in path",
    });
  }

  try {
    const email = req.session?.email;

    if (!email) {
      return res
        .status(400)
        .json({ msg: "No email associated with your account" });
    }

    const invite = await prisma.workspaceInvite.findFirst({
      where: {
        email, // use session email, not query param
        workspaceId,
      },
    });

    if (!invite) {
      return res.status(400).json({
        msg: "This invite is not found",
      });
    }

    if (invite.expires < new Date()) {
      return res.status(400).json({
        msg: "This invite has expired",
      });
    }

    //do a transaction to check if the user is already a member, todo:- check if the number of users > limit later, add to workspace, delete the invite

    const workspace = await prisma.$transaction(async (tx) => {
      const existingMember = await tx.workspaceMember.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (existingMember) {
        throw new Error("ALREADY_MEMBER");
      }

      await tx.workspaceMember.create({
        data: {
          role: invite.role,
          userId,
          workspaceId: invite.workspaceId,
        },
      });

      //delete the invite link
      await tx.workspaceInvite.delete({
        where: {
          email_workspaceId: {
            email: invite.email,
            workspaceId: invite.workspaceId,
          },
        },
      });

      const slug = await tx.workspace.findFirst({
        where: {
          id: workspaceId,
        },
        select: {
          slug: true,
        },
      });

      return slug;
    });

    return res.status(200).json({
      slug: workspace?.slug,
      msg: "Invite Accepted.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_MEMBER") {
      return res
        .status(409)
        .json({ msg: "You are already a member of this workspace." });
    }
    console.error("Error while accepting email invite", error);
    return res.status(500).json({
      msg: "Internal Server error",
    });
  }
});
