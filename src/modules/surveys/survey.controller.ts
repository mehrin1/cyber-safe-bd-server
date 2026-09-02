import { Request, Response } from "express";
import { surveyService } from "./survey.service.js";

function getSlug(req: Request) {
  return Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
}

function getQueryValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getCohortFilters(value: unknown) {
  const values = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return values.map((item) => {
    const separator = item.indexOf(":");
    if (separator <= 0 || separator === item.length - 1) throw new Error("Invalid cohort filter.");
    return { questionKey: item.slice(0, separator), optionValue: item.slice(separator + 1) };
  });
}

export const surveyController = {
  async getSurvey(req: Request, res: Response) {
    const survey = await surveyService.getPublishedSurvey(getSlug(req));
    if (!survey) {
      res.status(404).json({ success: false, message: "Survey not found" });
      return;
    }
    res.json({ success: true, data: survey });
  },

  async submitResponse(req: Request, res: Response) {
    if (!Array.isArray(req.body?.answers)) {
      res.status(400).json({ success: false, message: "Survey answers are required" });
      return;
    }

    if (req.body.isAnonymous !== undefined && typeof req.body.isAnonymous !== "boolean") {
      res.status(400).json({ success: false, message: "Anonymous status must be a boolean." });
      return;
    }

    const isAnonymous = req.body.isAnonymous === true;
    // An anonymous submission must not retain an email answer or account link.
    const answers = isAnonymous
      ? req.body.answers.filter((answer: { questionKey?: unknown }) => answer.questionKey !== "email")
      : req.body.answers;

    try {
      const response = await surveyService.submitResponse(
        getSlug(req),
        isAnonymous ? undefined : req.authSession?.user.id,
        answers,
        isAnonymous,
      );
      if (!response) {
        res.status(404).json({ success: false, message: "Survey not found" });
        return;
      }
      res.status(201).json({ success: true, data: response });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Invalid survey response" });
    }
  },

  async getResults(req: Request, res: Response) {
    const fromValue = getQueryValue(req.query.from);
    const toValue = getQueryValue(req.query.to);
    const from = fromValue ? new Date(`${fromValue}T00:00:00.000Z`) : undefined;
    const to = toValue ? new Date(`${toValue}T23:59:59.999Z`) : undefined;

    if ((fromValue && Number.isNaN(from?.getTime())) || (toValue && Number.isNaN(to?.getTime()))) {
      res.status(400).json({ success: false, message: "Invalid date filter." });
      return;
    }

    try {
      const results = await surveyService.getResults(getSlug(req), {
        questionKey: getQueryValue(req.query.question),
        optionValue: getQueryValue(req.query.option),
        search: getQueryValue(req.query.search),
        from,
        to,
        cohortFilters: getCohortFilters(req.query.filter),
      });
      if (!results) {
        res.status(404).json({ success: false, message: "Survey not found" });
        return;
      }
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Unable to load survey results" });
    }
  },
};
