/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `nextOccurrence` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `parentRecurringId` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `recurrenceEndDate` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `recurrenceInterval` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `recurrencePattern` on the `Todo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Todo` table. All the data in the column will be lost.
  - Added the required column `sortKey` to the `Todo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Todo" DROP COLUMN "createdAt",
DROP COLUMN "isRecurring",
DROP COLUMN "nextOccurrence",
DROP COLUMN "order",
DROP COLUMN "parentRecurringId",
DROP COLUMN "recurrenceEndDate",
DROP COLUMN "recurrenceInterval",
DROP COLUMN "recurrencePattern",
DROP COLUMN "updatedAt",
ADD COLUMN     "sortKey" TEXT NOT NULL;
