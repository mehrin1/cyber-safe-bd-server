import { Router } from "express";
import { optionalAuth } from "../../middlewares/auth.js";
import { surveyController } from "./survey.controller.js";

export const surveyRouter = Router();

surveyRouter.get("/surveys/:slug", surveyController.getSurvey);
surveyRouter.get("/surveys/:slug/results", surveyController.getResults);
surveyRouter.post("/surveys/:slug/responses", optionalAuth, surveyController.submitResponse);
