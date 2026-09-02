import { Router } from "express";
import { crimeController } from "./crime.controller.js";

export const crimeRouter = Router();
crimeRouter.get("/crimes", crimeController.getCrimeTypes);
