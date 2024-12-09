/*
  Warnings:

  - You are about to drop the column `userId` on the `SmtpConfig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teamId,provider]` on the table `SmtpConfig` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "SmtpConfig_userId_idx";

-- AlterTable
ALTER TABLE "SmtpConfig" DROP COLUMN IF EXISTS "userId",
ALTER COLUMN "provider" SET DEFAULT 'custom';

-- CreateIndex
CREATE UNIQUE INDEX "SmtpConfig_teamId_provider_key" ON "SmtpConfig"("teamId", "provider");
