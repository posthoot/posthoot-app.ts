-- AlterTable
ALTER TABLE "ApiKey" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rateLimit" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ApiKeyUsage" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "ApiKeyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApiKeyUsage_apiKeyId_idx" ON "ApiKeyUsage"("apiKeyId");

-- CreateIndex
CREATE INDEX "ApiKeyUsage_timestamp_idx" ON "ApiKeyUsage"("timestamp");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "ApiKeyUsage" ADD CONSTRAINT "ApiKeyUsage_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
