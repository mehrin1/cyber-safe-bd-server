import { Router } from "express";
import { professionalController } from "./professional.controller.js";

export const professionalRouter = Router();

professionalRouter.get("/professionals", professionalController.getProfessionals);
professionalRouter.get("/advices", professionalController.getAdvices);
professionalRouter.get("/support-resources", professionalController.getSupportResources);
