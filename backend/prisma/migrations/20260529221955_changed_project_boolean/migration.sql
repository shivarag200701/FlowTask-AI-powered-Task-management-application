/*
  Warnings:

  - You are about to drop the column `personalProjectId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `PersonalProject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PersonalProject" DROP CONSTRAINT "PersonalProject_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_personalProjectId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "personalProjectId",
ADD COLUMN     "personal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PersonalProject";

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
