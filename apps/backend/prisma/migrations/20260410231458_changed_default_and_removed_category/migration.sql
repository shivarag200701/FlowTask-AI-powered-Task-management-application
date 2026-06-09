/*
  Warnings:

  - You are about to drop the column `category` on the `Todo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "category",
ALTER COLUMN "isAllDay" SET DEFAULT true;
