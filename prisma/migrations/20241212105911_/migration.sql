/*
  Warnings:

  - Added the required column `name` to the `TeamInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamInvite" ADD COLUMN     "name" TEXT NOT NULL;
