// types.d.ts

import type { WorkspaceRoles } from "@shiva200701/todotypes";
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    email: string | null;
  }
}

declare global {
  namespace Express {
    interface Request {
      userId: string;
      workspaceId?: string;
      workspaceMember?: { id: string; role: WorkspaceRoles };
    }
  }
}
