import { Router } from "express";
import { lawController } from "./law.controller.js";

export const lawRouter = Router();

lawRouter.get("/laws", lawController.getLaws);
lawRouter.get("/laws/:slug", lawController.getLawBySlug);
