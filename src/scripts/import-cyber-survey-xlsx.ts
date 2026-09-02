import { createHash, randomUUID } from "node:crypto";
import XLSX from "xlsx";

import { prisma } from "../lib/prisma.js";
import { cyberSafetySurvey } from "../modules/surveys/survey.definition.js";
import { surveyService } from "../modules/surveys/survey.service.js";

const sourcePath = process.env.SURVEY_XLSX_PATH;
const sourceName = "final_data_cyber (2).xlsx";

const columnMappings = [
  [1, "age"], [2, "gender"], [3, "profession"], [4, "education-level"], [5, "residence"], [6, "division"], [7, "daily-internet-usage"], [8, "frequent-platform"],
  [9, "harm-frequency"], [10, "harm-types"], [11, "incident-stress"], [12, "help-sought"],
  [13, "resilience-1"], [14, "resilience-2"], [15, "resilience-3"], [16, "resilience-4"], [17, "resilience-5"], [18, "resilience-6"], [19, "resilience-7"], [20, "resilience-8"], [21, "resilience-9"], [22, "resilience-10"],
  [24, "coping-private-image"], [25, "coping-impersonation"], [26, "coping-threats"], [27, "coping-account-security"], [28, "coping-prize-scam"], [29, "coping-sextortion"], [30, "coping-friend"],
  [31, "law-private-image"], [32, "law-fake-account"], [33, "law-threats"], [34, "law-sextortion"], [35, "law-account-access"], [36, "law-phishing"], [37, "law-evidence"], [38, "law-support"], [39, "law-authority"], [40, "law-procedure"],
  [42, "platform-need"], [43, "platform-use"], [44, "platform-features"],
] as const;

const requiredHeaderFragments = [
  [1, "age"], [9, "experienced any form of cyberbullying"], [13, "able to adapt"], [24, "private photo online"], [31, "private image/video"], [42, "centralized online platform"],
] as const;

type WorkbookRow = unknown[];
type ImportQuestion = {
  id: string;
  key: string;
  type: "SHORT_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "SCALE";
  options: Array<{ value: string; label: string }>;
};

function cellText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeHeader(value: unknown) {
  return cellText(value).replace(/\s+/g, " ").toLowerCase();
}

function selectedLabels(question: ImportQuestion, rawValue: string) {
  return question.type === "MULTIPLE_CHOICE"
    ? rawValue.split(",").map((value) => value.trim()).filter(Boolean)
    : [rawValue];
}

function importedOptionValue(questionId: string, label: string) {
  return `imported-${createHash("sha256").update(`${questionId}:${label}`).digest("hex").slice(0, 16)}`;
}

function chunk<T>(items: T[], size: number) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size));
}

async function main() {
  if (!sourcePath) throw new Error("Set SURVEY_XLSX_PATH to the workbook path before running this import.");

  const workbook = XLSX.readFile(sourcePath, { raw: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("The workbook does not contain a worksheet.");

  const rows = XLSX.utils.sheet_to_json<WorkbookRow>(workbook.Sheets[firstSheetName], { header: 1, defval: "", raw: false });
  const [headers, ...dataRows] = rows;
  if (!headers || dataRows.length === 0) throw new Error("The workbook does not contain survey response rows.");

  for (const [columnIndex, expected] of requiredHeaderFragments) {
    if (!normalizeHeader(headers[columnIndex]).includes(expected)) {
      throw new Error(`Workbook column ${columnIndex + 1} does not match the expected survey structure.`);
    }
  }

  const records = dataRows.filter((row) => columnMappings.some(([columnIndex]) => cellText(row[columnIndex])));
  if (records.length === 0) throw new Error("The workbook has no importable responses.");

  const existingSurvey = await prisma.survey.findUnique({ where: { slug: cyberSafetySurvey.slug } });
  if (existingSurvey) {
    await prisma.$transaction([
      prisma.surveyAnswer.deleteMany({ where: { response: { surveyId: existingSurvey.id } } }),
      prisma.surveyResponse.deleteMany({ where: { surveyId: existingSurvey.id } }),
      prisma.survey.delete({ where: { id: existingSurvey.id } }),
    ]);
  }

  const survey = await surveyService.getPublishedSurvey(cyberSafetySurvey.slug);
  if (!survey) throw new Error("Unable to recreate the survey definition.");

  const questions = survey.sections.flatMap((section) => section.questions) as ImportQuestion[];
  const questionsByKey = new Map(questions.map((question) => [question.key, question]));
  const optionValuesByQuestionId = new Map(questions.map((question) => [question.id, new Map(question.options.map((option) => [option.label, option.value]))]));

  const optionsToCreate: Array<{ id: string; questionId: string; value: string; label: string; order: number }> = [];
  for (const [columnIndex, key] of columnMappings) {
    const question = questionsByKey.get(key)!;
    if (question.type === "SHORT_TEXT" || question.type === "SCALE") continue;

    const labels = new Set(records.flatMap((row) => selectedLabels(question, cellText(row[columnIndex]))).filter(Boolean));
    const existingOptions = optionValuesByQuestionId.get(question.id)!;
    for (const label of labels) {
      if (existingOptions.has(label)) continue;
      const value = importedOptionValue(question.id, label);
      existingOptions.set(label, value);
      optionsToCreate.push({ id: randomUUID(), questionId: question.id, value, label, order: existingOptions.size - 1 });
    }
  }
  for (const batch of chunk(optionsToCreate, 500)) {
    await prisma.surveyOption.createMany({ data: batch });
  }

  const responses: Array<{ id: string; surveyId: string; metadata: object }> = [];
  const answers: Array<{ id: string; responseId: string; questionId: string; textValue?: string; numberValue?: number; selectedValues: string[]; selectedLabels: string[]; displayValue: string; value: object }> = [];

  records.forEach((row, index) => {
    const responseId = randomUUID();
    responses.push({
      id: responseId,
      surveyId: survey.id,
      metadata: { source: sourceName, sourceRow: index + 2, importedScores: { score: cellText(row[0]), psychologicalResilienceTotal: cellText(row[23]), legalAwarenessTotal: cellText(row[41]) } },
    });

    for (const [columnIndex, key] of columnMappings) {
      const rawValue = cellText(row[columnIndex]);
      if (!rawValue) continue;
      const question = questionsByKey.get(key)!;
      const labels = selectedLabels(question, rawValue);
      const values = question.type === "SHORT_TEXT"
        ? []
        : question.type === "SCALE"
          ? [String(Math.trunc(Number(rawValue)))]
          : labels.map((label) => optionValuesByQuestionId.get(question.id)!.get(label)!);

      answers.push({
        id: randomUUID(), responseId, questionId: question.id,
        ...(question.type === "SHORT_TEXT" ? { textValue: rawValue } : {}),
        ...(question.type === "SCALE" ? { numberValue: Number(values[0]) } : {}),
        selectedValues: values,
        selectedLabels: question.type === "SHORT_TEXT" ? [] : labels,
        displayValue: rawValue,
        value: { values, labels: question.type === "SHORT_TEXT" ? [] : labels, displayValue: rawValue },
      });
    }
  });

  for (const batch of chunk(responses, 250)) await prisma.surveyResponse.createMany({ data: batch });
  for (const batch of chunk(answers, 1_000)) await prisma.surveyAnswer.createMany({ data: batch });

  console.log(`Imported ${responses.length} responses and ${answers.length} answers from ${sourceName}. Added ${optionsToCreate.length} workbook-specific options.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
