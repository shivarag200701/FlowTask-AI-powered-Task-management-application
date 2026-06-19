import { Router } from "express";
import { requireLogin } from "../../../middleware.js";
import { TagBulkDeleteSchema } from "@shiva200701/todotypes";
import prisma from "../../../db/index.js";
import { searchService } from "../../../services/search/index.js";

const bulkTagRouter = Router();

bulkTagRouter.delete("/", requireLogin, async (req, res) => {
  const userId = req.userId;

  const { success, data, error } = TagBulkDeleteSchema.safeParse(req.query);

  if (!success) {
    return res.status(400).json({
      msg: "Send proper data",
      error,
    });
  }

  const tagIds = data.tagIds.split(",");

  console.log("tagIds", tagIds);

  if (tagIds.length === 0) {
    return res.status(400).json({
      msg: "Need to send atleast one tag Id",
    });
  }

  try {
    const { count: deletedCount } = await prisma.tag.deleteMany({
      where: {
        userId,
        id: { in: tagIds },
      },
    });

    // Sync to Meilisearch (fire-and-forget)
    searchService.deleteTags(tagIds).catch((err) => {
      console.error("Meilisearch sync failed (bulk tag delete)", err);
    });

    return res.status(200).json({ deletedCount });
  } catch (error) {
    console.error("Failed bulk deleting the tags", error);
    return res.status(500).json({
      msg: "internal Server Error",
    });
  }
});

export default bulkTagRouter;
