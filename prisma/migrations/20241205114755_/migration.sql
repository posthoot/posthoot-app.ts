/*
  Warnings:

  - You are about to drop the column `userId` on the `ApiKey` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `EmailTemplate` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `EmailTemplate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamId` to the `MailingList` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "EmailTemplate" DROP CONSTRAINT "EmailTemplate_userId_fkey";

-- DropIndex
DROP INDEX "ApiKey_userId_idx";

-- DropIndex
DROP INDEX "EmailTemplate_userId_idx";

-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "userId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EmailTemplate" DROP COLUMN "userId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MailingList" ADD COLUMN     "teamId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");

-- CreateIndex
CREATE INDEX "Campaign_teamId_idx" ON "Campaign"("teamId");

-- CreateIndex
CREATE INDEX "EmailTemplate_teamId_idx" ON "EmailTemplate"("teamId");

-- CreateIndex
CREATE INDEX "MailingList_teamId_idx" ON "MailingList"("teamId");

-- CreateIndex
CREATE INDEX "Team_id_idx" ON "Team"("id");

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MailingList" ADD CONSTRAINT "MailingList_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
