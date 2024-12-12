/*
  Warnings:

  - You are about to drop the column `inviteeId` on the `TeamInvite` table. All the data in the column will be lost.
  - Added the required column `email` to the `TeamInvite` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TeamInvite" DROP CONSTRAINT "TeamInvite_inviteeId_fkey";

-- DropIndex
DROP INDEX "TeamInvite_inviteeId_idx";

-- AlterTable
ALTER TABLE "TeamInvite" DROP COLUMN "inviteeId",
ADD COLUMN     "email" TEXT NOT NULL;
