-- CreateTable
CREATE TABLE "SmtpConfig" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "SmtpConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SmtpConfig_teamId_idx" ON "SmtpConfig"("teamId");

-- AddForeignKey
ALTER TABLE "SmtpConfig" ADD CONSTRAINT "SmtpConfig_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
