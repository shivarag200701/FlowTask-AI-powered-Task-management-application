import dotenv from "dotenv";

dotenv.config();
import prisma from "../src/db/index.js";

async function createInboxProject() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    for (const user of users) {
      await prisma.project.create({
        data: {
          name: "Inbox",
          userId: user.id,
          isDefault: true,
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

createInboxProject();
