import { Router } from "express";
import { requireLogin } from "../../../../middleware.js";
import prisma from "../../../../db/index.js";
import { nanoid } from "../../../../utils/nanoid.js";
import { EmailInvitesSchema } from "@shiva200701/todotypes";
import z from "zod";
import { DateTime } from "luxon";
import { Prisma } from "@prisma/client";
import { sendEmail } from "../../../../services/email/EmailService.js";

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

  let invited: string[] = [];
  let skipped: string[] = [];

  const { invites } = data;

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

  const callbackURL = `${process.env.FRONTEND_URL}/app/workspaces/${workspace.slug}/invite`;

  await Promise.all(
    invited.map((email) =>
      sendEmail({
        template: "workspace-invite",
        email,
        senderEmail: user.email ?? "",
        workspaceName: workspace.name,
        senderName: user.name ?? "A teammate",
        callbackURL,
      })
    )
  );

  return res.status(200).json({
    invited,
    skipped,
  });
});
