-- CreateTable
CREATE TABLE "PersonalProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PersonalProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "personalProjectId" TEXT,
    "workSpaceId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalProject_userId_key" ON "PersonalProject"("userId");

-- AddForeignKey
ALTER TABLE "PersonalProject" ADD CONSTRAINT "PersonalProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_personalProjectId_fkey" FOREIGN KEY ("personalProjectId") REFERENCES "PersonalProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
