import type { NextFunction, Request, Response } from "express";

export function requireWorkspaceOwner(
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(req.workspaceMember);

  if (!req.workspaceMember || req.workspaceMember.role !== "owner") {
    return res.status(403).json({
      msg: "Only owners can perform this action",
    });
  }
  next();
}
