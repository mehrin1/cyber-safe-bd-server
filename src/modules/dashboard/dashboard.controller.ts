import { Request, Response } from "express";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  async getMyDashboard(req: Request, res: Response) {
    const data = await dashboardService.getUserDashboard(req.authSession!.user.id);
    res.json({ success: true, data });
  },

  async getAdminDashboard(_req: Request, res: Response) {
    const data = await dashboardService.getAdminDashboard();
    res.json({ success: true, data });
  },
};
