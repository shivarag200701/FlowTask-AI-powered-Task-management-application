/*
  Warnings:

  - You are about to drop the column `dueAt` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `dueOn` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "dueAt",
DROP COLUMN "dueOn",
ADD COLUMN     "dueDate" DATE,
ADD COLUMN     "dueTime" TIMESTAMP(3);
