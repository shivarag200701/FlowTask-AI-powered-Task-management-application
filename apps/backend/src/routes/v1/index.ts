import { Router } from "express";
import todoRouter from "./todo.js";
import userRouter from "./user.js";
import oauthRouter from "./oauth.js";

const router = Router();

router.use("/todo", todoRouter);
router.use("/user", userRouter);
router.use("/oauth", oauthRouter);

export default router;
