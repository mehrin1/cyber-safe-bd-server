-- CreateEnum
CREATE TYPE "SurveyQuestionType" AS ENUM ('SHORT_TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'SCALE');

-- CreateEnum
CREATE TYPE "SurveyResponseStatus" AS ENUM ('COMPLETED', 'DISCARDED');

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveySection" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SurveySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyQuestion" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "externalId" TEXT,
    "prompt" TEXT NOT NULL,
    "description" TEXT,
    "type" "SurveyQuestionType" NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "config" JSONB,

    CONSTRAINT "SurveyQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SurveyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "userId" TEXT,
    "status" "SurveyResponseStatus" NOT NULL DEFAULT 'COMPLETED',
    "metadata" JSONB,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" INTEGER,
    "selectedValues" TEXT[],
    "value" JSONB NOT NULL,

    CONSTRAINT "SurveyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Survey_slug_key" ON "Survey"("slug");

-- CreateIndex
CREATE INDEX "Survey_isPublished_idx" ON "Survey"("isPublished");

-- CreateIndex
CREATE INDEX "SurveySection_surveyId_order_idx" ON "SurveySection"("surveyId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SurveySection_surveyId_key_key" ON "SurveySection"("surveyId", "key");

-- CreateIndex
CREATE INDEX "SurveyQuestion_sectionId_order_idx" ON "SurveyQuestion"("sectionId", "order");

-- CreateIndex
CREATE INDEX "SurveyQuestion_externalId_idx" ON "SurveyQuestion"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyQuestion_sectionId_key_key" ON "SurveyQuestion"("sectionId", "key");

-- CreateIndex
CREATE INDEX "SurveyOption_questionId_order_idx" ON "SurveyOption"("questionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyOption_questionId_value_key" ON "SurveyOption"("questionId", "value");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_submittedAt_idx" ON "SurveyResponse"("surveyId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_userId_submittedAt_idx" ON "SurveyResponse"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyAnswer_questionId_numberValue_idx" ON "SurveyAnswer"("questionId", "numberValue");

-- CreateIndex
CREATE INDEX "SurveyAnswer_questionId_idx" ON "SurveyAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyAnswer_responseId_questionId_key" ON "SurveyAnswer"("responseId", "questionId");

-- AddForeignKey
ALTER TABLE "SurveySection" ADD CONSTRAINT "SurveySection_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyQuestion" ADD CONSTRAINT "SurveyQuestion_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "SurveySection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyOption" ADD CONSTRAINT "SurveyOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyAnswer" ADD CONSTRAINT "SurveyAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "SurveyQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
