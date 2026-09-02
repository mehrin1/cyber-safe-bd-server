-- AlterEnum
ALTER TYPE "ProfessionalRole" ADD VALUE 'ETHICAL_HACKER';

-- CreateTable
CREATE TABLE "SupportResource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'GUIDANCE',
    "contactLabel" TEXT NOT NULL,
    "contactValue" TEXT NOT NULL,
    "contactUrl" TEXT,
    "availability" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eligibility" TEXT,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupportResource_slug_key" ON "SupportResource"("slug");

-- CreateIndex
CREATE INDEX "SupportResource_region_serviceType_idx" ON "SupportResource"("region", "serviceType");

-- CreateIndex
CREATE INDEX "SupportResource_urgency_idx" ON "SupportResource"("urgency");
