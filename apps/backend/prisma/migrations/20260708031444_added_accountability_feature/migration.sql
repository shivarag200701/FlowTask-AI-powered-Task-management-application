-- AlterTable
ALTER TABLE "UserPrefrence" ADD COLUMN     "accountabilityEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "accountabilityTone" TEXT NOT NULL DEFAULT 'supportive',
ADD COLUMN     "dailyStandupTime" TEXT,
ADD COLUMN     "weeklyInsightDay" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "AccountabilitySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "taskSnapshot" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilitySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountabilityMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountabilityMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountabilitySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "snapshotDate" TEXT NOT NULL,
    "totalTasksDue" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksCompletedLate" INTEGER NOT NULL DEFAULT 0,
    "tasksNotCompleted" INTEGER NOT NULL DEFAULT 0,
    "tasksCarriedOver" INTEGER NOT NULL DEFAULT 0,
    "tagBreakdown" JSONB,
    "projectBreakdown" JSONB,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyInsight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStartDate" TEXT NOT NULL,
    "weekEndDate" TEXT NOT NULL,
    "overallCompletionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previousWeekRate" DOUBLE PRECISION,
    "trend" TEXT NOT NULL DEFAULT 'STABLE',
    "mostProductiveDay" TEXT,
    "leastProductiveDay" TEXT,
    "problematicTags" JSONB,
    "problematicProjects" JSONB,
    "summary" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountabilitySession_userId_status_idx" ON "AccountabilitySession"("userId", "status");

-- CreateIndex
CREATE INDEX "AccountabilitySession_userId_type_idx" ON "AccountabilitySession"("userId", "type");

-- CreateIndex
CREATE INDEX "AccountabilityMessage_sessionId_idx" ON "AccountabilityMessage"("sessionId");

-- CreateIndex
CREATE INDEX "AccountabilitySnapshot_userId_idx" ON "AccountabilitySnapshot"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountabilitySnapshot_userId_snapshotDate_key" ON "AccountabilitySnapshot"("userId", "snapshotDate");

-- CreateIndex
CREATE INDEX "WeeklyInsight_userId_idx" ON "WeeklyInsight"("userId");

-- CreateIndex
CREATE INDEX "WeeklyInsight_userId_weekStartDate_idx" ON "WeeklyInsight"("userId", "weekStartDate");

-- AddForeignKey
ALTER TABLE "AccountabilitySession" ADD CONSTRAINT "AccountabilitySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityMessage" ADD CONSTRAINT "AccountabilityMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AccountabilitySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilitySnapshot" ADD CONSTRAINT "AccountabilitySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyInsight" ADD CONSTRAINT "WeeklyInsight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
