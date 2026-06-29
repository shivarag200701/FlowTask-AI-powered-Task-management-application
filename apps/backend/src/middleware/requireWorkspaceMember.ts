import type { NextFunction, Request, Response } from "express";
import prisma from "../db/index.js";

export async function requireWorkspaceMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const workspaceId = req.workspaceId;
  try {
    const member = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: workspaceId!,
        userId: req.userId,
      },
    });
    if (!member) {
      return res.status(403).json({
        msg: "You are not a member of this workspace",
      });
    }

    req.workspaceMember = { id: member.id, role: member.role };
    next();
  } catch (error) {
    console.error("error while getting membership for workspace", error);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
}
