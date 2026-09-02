-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HelpCategory" ADD VALUE 'ACCOUNT_SECURITY';
ALTER TYPE "HelpCategory" ADD VALUE 'ONLINE_HARASSMENT';
ALTER TYPE "HelpCategory" ADD VALUE 'FINANCIAL_FRAUD';
ALTER TYPE "HelpCategory" ADD VALUE 'IMAGE_ABUSE';
ALTER TYPE "HelpCategory" ADD VALUE 'CHILD_SAFETY';

-- AlterEnum
ALTER TYPE "HelpRequestStatus" ADD VALUE 'CLOSED';
