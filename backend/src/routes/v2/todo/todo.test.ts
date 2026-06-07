import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the redis client and search service before importing middleware
vi.mock("../../../index.js", () => ({
  redisClient: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("../../../services/search/index.js", () => ({
  searchService: {
    reindexUser: vi.fn().mockResolvedValue({ todosCount: 0, tagsCount: 0 }),
  },
}));

import { requireLogin } from "../../../middleware.js";
import type { Request, Response, NextFunction } from "express";
import { redisClient } from "../../../index.js";

function createMockReqRes(sessionData?: { userId?: string }) {
  const req = {
    session: sessionData ?? {},
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe("requireLogin middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: pretend user already indexed so we don't trigger reindex
    vi.mocked(redisClient.get).mockResolvedValue("1");
  });

  it("calls next() when session has a userId", () => {
    const { req, res, next } = createMockReqRes({ userId: "user-1" });

    requireLogin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when session has no userId", () => {
    const { req, res, next } = createMockReqRes();

    requireLogin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      isAuthenticated: "false",
    });
  });

  it("returns 401 when session is undefined", () => {
    const req = {} as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    const next = vi.fn() as NextFunction;

    requireLogin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
