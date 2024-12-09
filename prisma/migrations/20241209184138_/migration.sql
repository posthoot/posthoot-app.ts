-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "address" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "customFields" JSONB,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "title" TEXT;

-- CreateIndex
CREATE INDEX "Subscriber_email_idx" ON "Subscriber"("email");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- CreateIndex
CREATE INDEX "Subscriber_lastActivityAt_idx" ON "Subscriber"("lastActivityAt");
