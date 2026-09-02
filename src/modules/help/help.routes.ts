import { Router } from "express";
import { helpController } from "./help.controller.js";
import { optionalAuth, requireAuth } from "../../middlewares/auth.js";

export const helpRouter = Router();

helpRouter.get("/help-requests", requireAuth, helpController.getHelpRequests);
helpRouter.get("/help-requests/:id", requireAuth, helpController.getHelpRequestById);
helpRouter.post("/help-requests", optionalAuth, helpController.createHelpRequest);
helpRouter.get("/help-requests/:id/messages", requireAuth, helpController.getMessages);
helpRouter.post("/help-requests/:id/messages", requireAuth, helpController.createMessage);
