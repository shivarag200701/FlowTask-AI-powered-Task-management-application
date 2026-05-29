import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import prisma from "../../../db/index.js";

const personalProjectRouter = Router();

personalProjectRouter.get("/", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      msg: "unauthorized",
    });
  }

  try {
    const response = await prisma.personalProject.findUnique({
      where: {
        userId,
      },
      select: { projects: true },
    });

    return res.status(200).json({ projects: response?.projects });
  } catch (error) {
    console.error("Failed getting personal projects", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

export default personalProjectRouter;
