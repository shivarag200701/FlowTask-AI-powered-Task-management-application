-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "originalTodoId" TEXT,
ADD COLUMN     "recurrenceEndDate" TEXT,
ADD COLUMN     "recurrenceRule" JSONB;
