-- CreateEnum
CREATE TYPE "TrackingType" AS ENUM ('CLICKED', 'OPENED');

-- DropForeignKey
ALTER TABLE "SentEmail" DROP CONSTRAINT "SentEmail_templateId_fkey";

-- AlterTable
ALTER TABLE "SentEmail" ALTER COLUMN "templateId" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EmailTracking" (
    "id" TEXT NOT NULL,
    "sentEmailId" TEXT NOT NULL,
    "type" "TrackingType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailTracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTracking" ADD CONSTRAINT "EmailTracking_sentEmailId_fkey" FOREIGN KEY ("sentEmailId") REFERENCES "SentEmail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
