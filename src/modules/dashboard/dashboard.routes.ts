import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { dashboardController } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/dashboard/me", requireAuth, dashboardController.getMyDashboard);
dashboardRouter.get("/dashboard/admin", requireAuth, requireAdmin, dashboardController.getAdminDashboard);
