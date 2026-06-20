/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `Workspace` will be added. If there are existing duplicate values, this will fail.
  - Made the column `inviteCode` on table `Workspace` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Workspace" ALTER COLUMN "inviteCode" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_inviteCode_key" ON "Workspace"("inviteCode");
