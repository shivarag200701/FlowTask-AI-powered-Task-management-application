import { Router } from "express";
import { requireLogin } from "../../middleware.js";

const tagRouter = Router();

tagRouter.post("/", requireLogin, (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }
});

export default tagRouter;
