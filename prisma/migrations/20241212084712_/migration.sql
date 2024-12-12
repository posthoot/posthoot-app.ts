-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "logoUrl" TEXT;

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sslStatus" TEXT NOT NULL DEFAULT 'pending',
    "sslCertificate" TEXT,
    "sslPrivateKey" TEXT,
    "sslExpiresAt" TIMESTAMP(3),
    "verificationToken" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");

-- CreateIndex
CREATE INDEX "CustomDomain_teamId_idx" ON "CustomDomain"("teamId");

-- CreateIndex
CREATE INDEX "CustomDomain_domain_idx" ON "CustomDomain"("domain");

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
