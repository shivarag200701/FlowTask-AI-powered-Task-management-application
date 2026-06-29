import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../index.js";
import { searchService } from "../services/search/index.js";

const REINDEX_EXPIRY = 60 * 60 * 24 * 30; // 30 days

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | void {
  if (req.session?.userId) {
    req.userId = req.session.userId;
    triggerSearchIndexIfNeeded(req.userId);
    next();
  } else {
    return res.status(401).json({
      isAuthenticated: "false",
    });
  }
}

function triggerSearchIndexIfNeeded(userId: string) {
  const redisKey = `search:indexed:${userId}`;

  redisClient
    .get(redisKey)
    .then(async (value) => {
      //key already present and indexed within thirty days
      if (value) return;

      console.log(`[Search] Auto-indexing for user ${userId}`);
      const result = await searchService.reindexUser(userId);
      await redisClient.set(redisKey, "1", { EX: REINDEX_EXPIRY });
      console.log(
        `[Search] Indexed ${result.todosCount} todos and ${result.tagsCount} tags and ${result.projectCount} projects for user ${userId}`
      );
    })
    .catch((err) => {
      console.error(`[Search] Auto-index failed for user ${userId}:`, err);
    });
}
