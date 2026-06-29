import type { Request, Response, NextFunction } from "express";

export function extractWorkspaceId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const workspaceId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
  if (!workspaceId) {
    return res.status(400).json({
      msg: "Workspace Id not found in path",
    });
  }
  next();
}
