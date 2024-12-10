/*
  Warnings:

  - You are about to drop the column `userId` on the `Campaign` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CampaignSchedule" AS ENUM ('ONE_TIME', 'RECURRING');

-- CreateEnum
CREATE TYPE "CampaignRecurringSchedule" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');

-- DropIndex
DROP INDEX "Campaign_userId_idx";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "userId",
ADD COLUMN     "cronExpression" TEXT,
ADD COLUMN     "recurringSchedule" "CampaignRecurringSchedule",
ADD COLUMN     "schedule" "CampaignSchedule",
ADD COLUMN     "smtpConfigId" TEXT;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_smtpConfigId_fkey" FOREIGN KEY ("smtpConfigId") REFERENCES "SmtpConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
