/*
  Warnings:

  - You are about to drop the column `userId` on the `SentEmail` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `SentEmail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EmailJob" DROP CONSTRAINT "EmailJob_campaignId_fkey";

-- DropIndex
DROP INDEX "SentEmail_userId_idx";

-- AlterTable
ALTER TABLE "EmailJob" ALTER COLUMN "campaignId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SentEmail" DROP COLUMN "userId",
ADD COLUMN     "subscriberId" TEXT,
ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "SentEmail_teamId_idx" ON "SentEmail"("teamId");

-- CreateIndex
CREATE INDEX "SentEmail_subscriberId_idx" ON "SentEmail"("subscriberId");

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailJob" ADD CONSTRAINT "EmailJob_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
