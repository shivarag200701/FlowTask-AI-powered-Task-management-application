import type { Request, Response, NextFunction } from "express";
import prisma from "../db/index.js";

export async function extractWorkspaceId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const param = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!param) {
    return res.status(400).json({
      msg: "Workspace Id not found in path",
    });
  }
  const workspace = await prisma.workspace.findFirst({
    where: { OR: [{ id: param }, { slug: param }] },
    select: { id: true },
  });

  if (!workspace) {
    return res.status(404).json({ msg: "Workspace not found" });
  }

  req.workspaceId = workspace.id;
  next();
}
