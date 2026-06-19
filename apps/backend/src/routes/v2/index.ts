import { Router } from "express";
import todoRouter from "./todo/index.js";
import tagRouter from "./tag/index.js";
import { projectRouter } from "./project/index.js";
import aiRouter from "./ai/index.js";
import { workspaceRouter } from "./workspace/index.js";

const router = Router();
router.use("/todo", todoRouter);
router.use("/tag", tagRouter);
router.use("/projects", projectRouter);
router.use("/ai", aiRouter);
router.use("/workspaces", workspaceRouter);

export default router;
