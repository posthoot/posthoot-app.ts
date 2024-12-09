/*
  Warnings:

  - You are about to drop the column `userId` on the `MailingList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey";

-- DropForeignKey
ALTER TABLE "MailingList" DROP CONSTRAINT "MailingList_userId_fkey";

-- DropForeignKey
ALTER TABLE "SentEmail" DROP CONSTRAINT "SentEmail_userId_fkey";

-- DropIndex
DROP INDEX "MailingList_userId_idx";

-- AlterTable
ALTER TABLE "MailingList" DROP COLUMN "userId";
