import { Router } from "express";
import todoRouter from "./todo.js";
import tagRouter from "./tag/index.js";

const router = Router();
router.use("/todo", todoRouter);
router.use("/tag", tagRouter);

export default router;
