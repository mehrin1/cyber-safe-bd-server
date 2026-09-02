import { prisma } from "../lib/prisma.js";

async function main() {
  const answers = await prisma.surveyAnswer.findMany({
    include: {
      question: {
        include: { options: true },
      },
    },
  });

  await prisma.$transaction(
    answers.map((answer) => {
      const selectedLabels = answer.selectedValues.map(
        (value) => answer.question.options.find((option) => option.value === value)?.label ?? value,
      );
      const displayValue = answer.textValue ?? selectedLabels.join(", ");

      return prisma.surveyAnswer.update({
        where: { id: answer.id },
        data: {
          selectedLabels,
          displayValue,
          value: { values: answer.selectedValues, labels: selectedLabels, displayValue },
        },
      });
    }),
  );

  console.log(`Backfilled ${answers.length} survey answers.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
