-- Rename tables (preserves data)
ALTER TABLE "AccountabilitySession" RENAME TO "AiConversation";
ALTER TABLE "AccountabilityMessage" RENAME TO "AiMessage";

-- Rename sessionId column to conversationId
ALTER TABLE "AiMessage" RENAME COLUMN "sessionId" TO "conversationId";

-- Drop columns no longer needed on AiConversation
ALTER TABLE "AiConversation" DROP COLUMN "type";
ALTER TABLE "AiConversation" DROP COLUMN "status";
ALTER TABLE "AiConversation" DROP COLUMN "taskSnapshot";
ALTER TABLE "AiConversation" DROP COLUMN "startedAt";
ALTER TABLE "AiConversation" DROP COLUMN "completedAt";

-- Add title column
ALTER TABLE "AiConversation" ADD COLUMN "title" TEXT;

-- Rename preference columns
ALTER TABLE "UserPrefrence" RENAME COLUMN "accountabilityEnabled" TO "aiAssistantEnabled";
ALTER TABLE "UserPrefrence" RENAME COLUMN "accountabilityTone" TO "aiAssistantTone";

-- Drop old indexes and create new ones
DROP INDEX IF EXISTS "AccountabilitySession_userId_status_idx";
DROP INDEX IF EXISTS "AccountabilitySession_userId_type_idx";
DROP INDEX IF EXISTS "AccountabilityMessage_sessionId_idx";

CREATE INDEX "AiConversation_userId_idx" ON "AiConversation"("userId");
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- Rename foreign key constraints
ALTER TABLE "AiConversation" RENAME CONSTRAINT "AccountabilitySession_userId_fkey" TO "AiConversation_userId_fkey";
ALTER TABLE "AiMessage" RENAME CONSTRAINT "AccountabilityMessage_sessionId_fkey" TO "AiMessage_conversationId_fkey";
