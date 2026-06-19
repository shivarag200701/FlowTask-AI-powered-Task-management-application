// types.d.ts

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
    }
  }
}
