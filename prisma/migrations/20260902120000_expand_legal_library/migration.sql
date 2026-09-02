-- CreateEnum
CREATE TYPE "LawStatus" AS ENUM ('IN_FORCE', 'REFERENCE', 'SUPERSEDED', 'NOT_IN_FORCE');

-- AlterEnum
ALTER TYPE "LawCategory" ADD VALUE 'ELECTRONIC_EVIDENCE';
ALTER TYPE "LawCategory" ADD VALUE 'TELECOMMUNICATIONS';
ALTER TYPE "LawCategory" ADD VALUE 'CHILD_PROTECTION';
ALTER TYPE "LawCategory" ADD VALUE 'INTELLECTUAL_PROPERTY';
ALTER TYPE "LawCategory" ADD VALUE 'INTERNATIONAL_COOPERATION';
ALTER TYPE "LawCategory" ADD VALUE 'PLATFORM_GOVERNANCE';

-- AlterTable
ALTER TABLE "Law" ADD COLUMN "applicability" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Law" ADD COLUMN "legalTopics" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Law" ADD COLUMN "slug" TEXT;
ALTER TABLE "Law" ADD COLUMN "status" "LawStatus" NOT NULL DEFAULT 'IN_FORCE';

-- Give legacy records a stable unique value before enforcing the constraint.
UPDATE "Law" SET "slug" = CONCAT('legacy-', "id") WHERE "slug" IS NULL;
ALTER TABLE "Law" ALTER COLUMN "slug" SET NOT NULL;

-- CreateTable
CREATE TABLE "CrimeType" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CrimeType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CrimeLawReference" (
    "id" TEXT NOT NULL,
    "crimeTypeId" TEXT NOT NULL,
    "lawId" TEXT NOT NULL,
    "guidance" TEXT NOT NULL,
    "relevantProvisions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    CONSTRAINT "CrimeLawReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrimeType_slug_key" ON "CrimeType"("slug");
CREATE INDEX "CrimeType_category_idx" ON "CrimeType"("category");
CREATE INDEX "CrimeLawReference_lawId_idx" ON "CrimeLawReference"("lawId");
CREATE UNIQUE INDEX "CrimeLawReference_crimeTypeId_lawId_key" ON "CrimeLawReference"("crimeTypeId", "lawId");
CREATE UNIQUE INDEX "Law_slug_key" ON "Law"("slug");
CREATE INDEX "Law_status_idx" ON "Law"("status");

-- AddForeignKey
ALTER TABLE "CrimeLawReference" ADD CONSTRAINT "CrimeLawReference_crimeTypeId_fkey" FOREIGN KEY ("crimeTypeId") REFERENCES "CrimeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CrimeLawReference" ADD CONSTRAINT "CrimeLawReference_lawId_fkey" FOREIGN KEY ("lawId") REFERENCES "Law"("id") ON DELETE CASCADE ON UPDATE CASCADE;
