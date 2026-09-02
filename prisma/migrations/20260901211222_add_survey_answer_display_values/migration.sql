-- AlterTable
ALTER TABLE "SurveyAnswer" ADD COLUMN     "displayValue" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "selectedLabels" TEXT[] DEFAULT ARRAY[]::TEXT[];
