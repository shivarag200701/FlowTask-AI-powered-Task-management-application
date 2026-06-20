import { Router } from "express";
import { requireLogin } from "../../../../middleware.js";
import prisma from "../../../../db/index.js";
import { nanoid } from "../../../../utils/nanoid.js";

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
});
