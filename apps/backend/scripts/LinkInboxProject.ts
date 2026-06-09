import dotenv from "dotenv";

dotenv.config();
import prisma from "../src/db/index.js";

async function linkInboxProject() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      const inbox = await prisma.project.findFirst({
        where: { userId: user.id, isDefault: true },
        select: { id: true },
      });

      if (!inbox) continue;

      await prisma.todo.updateMany({
        where: {
          userId: user.id,
          projectId: null,
        },
        data: {
          projectId: inbox.id,
        },
      });
    }
  } catch (error) {
    console.error("error updating prefences for user", error);
    process.exit(1);
  }
  console.log("migration complete");
  await prisma.$disconnect();
}

linkInboxProject();
