import { SurveyQuestionType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { cyberSafetySurvey } from "./survey.definition.js";

type SubmittedAnswer = {
  questionKey: string;
  values: string[];
};

type ResultsFilters = {
  questionKey?: string;
  optionValue?: string;
  search?: string;
  from?: Date;
  to?: Date;
  cohortFilters: Array<{ questionKey: string; optionValue: string }>;
};

const publicSurveyInclude = {
  sections: {
    orderBy: { order: "asc" as const },
    include: {
      questions: {
        orderBy: { order: "asc" as const },
        include: { options: { orderBy: { order: "asc" as const } } },
      },
    },
  },
};

async function ensureSurvey() {
  const existing = await prisma.survey.findUnique({
    where: { slug: cyberSafetySurvey.slug },
    include: publicSurveyInclude,
  });

  if (existing) return existing;

  return prisma.survey.create({
    data: {
      slug: cyberSafetySurvey.slug,
      title: cyberSafetySurvey.title,
      isPublished: true,
      metadata: { source: "Google Form", sourceId: "1FAIpQLSfAJwweq83v2jARNbqV1kWwmydoTZRBH61am4FDZKBNt46dpw" },
      sections: {
        create: cyberSafetySurvey.sections.map((section, sectionIndex) => ({
          key: section.key,
          title: section.title,
          description: section.description,
          order: sectionIndex,
          questions: {
            create: section.questions.map((question, questionIndex) => ({
              key: question.key,
              externalId: question.externalId,
              prompt: question.prompt,
              description: question.description,
              type: SurveyQuestionType[question.type],
              isRequired: question.required,
              order: questionIndex,
              config: question.type === "SCALE" ? { min: 0, max: 4 } : undefined,
              options: {
                create: question.options?.map((label, optionIndex) => ({
                  value: `${optionIndex}`,
                  label,
                  order: optionIndex,
                })),
              },
            })),
          },
        })),
      },
    },
    include: publicSurveyInclude,
  });
}

export const surveyService = {
  async getPublishedSurvey(slug: string) {
    if (slug !== cyberSafetySurvey.slug) return null;
    return ensureSurvey();
  },

  async submitResponse(slug: string, userId: string | undefined, answers: SubmittedAnswer[], isAnonymous: boolean) {
    const survey = await this.getPublishedSurvey(slug);
    if (!survey || !survey.isPublished) return null;

    const questions = survey.sections.flatMap((section) => section.questions);
    const questionsByKey = new Map(questions.map((question) => [question.key, question]));
    const answersByKey = new Map(answers.map((answer) => [answer.questionKey, answer]));

    for (const question of questions) {
      const answer = answersByKey.get(question.key);
      if (question.isRequired && (!answer || answer.values.length === 0 || answer.values.every((value) => !value.trim()))) {
        throw new Error(`Please answer: ${question.prompt}`);
      }
    }

    for (const answer of answers) {
      const question = questionsByKey.get(answer.questionKey);
      if (!question) throw new Error("The submitted survey contains an unknown question.");
      if (question.type === "SHORT_TEXT") {
        if (answer.values.length > 1 || answer.values.some((value) => value.length > 500)) {
          throw new Error(`Invalid response for: ${question.prompt}`);
        }
        continue;
      }

      const allowedValues = new Set(question.options.map((option) => option.value));
      if (answer.values.length === 0 || answer.values.some((value) => !allowedValues.has(value))) {
        throw new Error(`Invalid response for: ${question.prompt}`);
      }
      if (question.type !== "MULTIPLE_CHOICE" && answer.values.length !== 1) {
        throw new Error(`Please select one answer for: ${question.prompt}`);
      }
    }

    return prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        userId,
        metadata: { isAnonymous },
        answers: {
          create: answers
            .filter((answer) => answer.values.length > 0)
            .map((answer) => {
              const question = questionsByKey.get(answer.questionKey)!;
              const textValue = question.type === "SHORT_TEXT" ? answer.values[0] : undefined;
              const selectedValues = question.type === "SHORT_TEXT" ? [] : answer.values;
              const selectedLabels = selectedValues.map(
                (value) => question.options.find((option) => option.value === value)?.label ?? value,
              );
              const displayValue = textValue ?? selectedLabels.join(", ");
              return {
                questionId: question.id,
                textValue,
                numberValue: question.type === "SCALE" ? Number(answer.values[0]) : undefined,
                selectedValues,
                selectedLabels,
                displayValue,
                value: { values: answer.values, labels: selectedLabels, displayValue },
              };
            }),
        },
      },
      select: { id: true, submittedAt: true },
    });
  },

  async getResults(slug: string, filters: ResultsFilters) {
    const survey = await this.getPublishedSurvey(slug);
    if (!survey || !survey.isPublished) return null;

    const questions = survey.sections.flatMap((section) => section.questions);
    const selectedQuestion = filters.questionKey
      ? questions.find((question) => question.key === filters.questionKey)
      : undefined;

    if (filters.questionKey && !selectedQuestion) {
      throw new Error("Unknown survey question filter.");
    }

    if (
      filters.optionValue &&
      (!selectedQuestion || !selectedQuestion.options.some((option) => option.value === filters.optionValue))
    ) {
      throw new Error("Unknown survey answer filter.");
    }

    const cohortAnswerFilters = filters.cohortFilters.map((filter) => {
      const question = questions.find((item) => item.key === filter.questionKey);
      if (!question || !question.options.some((option) => option.value === filter.optionValue)) {
        throw new Error("Unknown cohort filter.");
      }
      return { answers: { some: { questionId: question.id, selectedValues: { has: filter.optionValue } } } };
    });

    const answerFilter: Record<string, unknown> = {};
    if (selectedQuestion) answerFilter.questionId = selectedQuestion.id;
    if (filters.optionValue) answerFilter.selectedValues = { has: filters.optionValue };
    if (filters.search) answerFilter.displayValue = { contains: filters.search, mode: "insensitive" };

    const responseWhere = {
      surveyId: survey.id,
      status: "COMPLETED" as const,
      ...(filters.from || filters.to
        ? { submittedAt: { ...(filters.from ? { gte: filters.from } : {}), ...(filters.to ? { lte: filters.to } : {}) } }
        : {}),
      ...(cohortAnswerFilters.length ? { AND: cohortAnswerFilters } : {}),
      ...(Object.keys(answerFilter).length > 0 ? { answers: { some: answerFilter } } : {}),
    };

    const [responses, totalResponseCount] = await Promise.all([prisma.surveyResponse.findMany({
      where: responseWhere,
      select: {
        id: true,
        answers: {
          select: {
            questionId: true,
            selectedValues: true,
            selectedLabels: true,
            numberValue: true,
          },
        },
      },
    }), prisma.surveyResponse.count({ where: { surveyId: survey.id, status: "COMPLETED" } })]);

    const answersByQuestionId = new Map<string, typeof responses[number]["answers"]>();
    for (const response of responses) {
      for (const answer of response.answers) {
        const answers = answersByQuestionId.get(answer.questionId) || [];
        answers.push(answer);
        answersByQuestionId.set(answer.questionId, answers);
      }
    }

    return {
      survey: { slug: survey.slug, title: survey.title },
      responseCount: responses.length,
      totalResponseCount,
      filters: {
        questions: questions.map((question) => ({
          key: question.key,
          prompt: question.prompt,
          type: question.type,
          options: question.options.map((option) => ({ value: option.value, label: option.label })),
        })),
      },
      questions: questions.map((question) => {
        const answers = answersByQuestionId.get(question.id) || [];
        const responseCount = answers.length;
        const values = question.options.map((option) => {
          const count = answers.filter((answer) => answer.selectedValues.includes(option.value)).length;
          return {
            value: option.value,
            label: option.label,
            count,
            percentage: responses.length ? Math.round((count / responses.length) * 1000) / 10 : 0,
          };
        });
        const scaleValues = answers
          .map((answer) => answer.numberValue)
          .filter((value): value is number => value !== null);

        return {
          key: question.key,
          prompt: question.prompt,
          type: question.type,
          responseCount,
          values,
          average: scaleValues.length
            ? Math.round((scaleValues.reduce((sum, value) => sum + value, 0) / scaleValues.length) * 100) / 100
            : null,
        };
      }),
    };
  },
};
