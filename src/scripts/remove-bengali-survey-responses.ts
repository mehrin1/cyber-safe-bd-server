import { prisma } from "../lib/prisma.js";
import { cyberSafetySurvey } from "../modules/surveys/survey.definition.js";

const importedWorkbookName = "final_data_cyber (2).xlsx";
const bengaliScript = /\p{Script=Bengali}/u;

function isWorkbookImport(metadata: unknown) {
  return typeof metadata === "object" && metadata !== null && (metadata as { source?: unknown }).source === importedWorkbookName;
}

async function main() {
  const survey = await prisma.survey.findUnique({ where: { slug: cyberSafetySurvey.slug } });
  if (!survey) throw new Error("Survey not found.");

  const responses = await prisma.surveyResponse.findMany({
    where: { surveyId: survey.id },
    select: {
      id: true,
      metadata: true,
      answers: { select: { displayValue: true } },
    },
  });

  const responseIds = responses
    .filter((response) => isWorkbookImport(response.metadata) && response.answers.some((answer) => bengaliScript.test(answer.displayValue)))
    .map((response) => response.id);

  if (responseIds.length === 0) {
    console.log("No workbook-imported Bengali-script responses found.");
    return;
  }

  const deletedAnswers = await prisma.surveyAnswer.deleteMany({ where: { responseId: { in: responseIds } } });
  const deletedResponses = await prisma.surveyResponse.deleteMany({ where: { id: { in: responseIds } } });

  const options = await prisma.surveyOption.findMany({
    where: { question: { section: { surveyId: survey.id } } },
    select: { id: true, questionId: true, value: true, label: true },
  });
  const unusedBengaliOptionIds: string[] = [];
  for (const option of options) {
    if (!bengaliScript.test(option.label)) continue;
    const remainingAnswers = await prisma.surveyAnswer.count({
      where: { questionId: option.questionId, selectedValues: { has: option.value } },
    });
    if (remainingAnswers === 0) unusedBengaliOptionIds.push(option.id);
  }
  const deletedOptions = unusedBengaliOptionIds.length
    ? await prisma.surveyOption.deleteMany({ where: { id: { in: unusedBengaliOptionIds } } })
    : { count: 0 };

  console.log(`Removed ${deletedResponses.count} Bengali-script workbook responses, ${deletedAnswers.count} answers, and ${deletedOptions.count} unused imported options.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
