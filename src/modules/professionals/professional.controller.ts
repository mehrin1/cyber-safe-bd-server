import { Request, Response } from "express";
import { professionalService } from "./professional.service.js";
import { parseBoolean } from "../../utils/api.js";

export const professionalController = {
  async getProfessionals(req: Request, res: Response) {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const verified = parseBoolean(req.query.verified);
    const data = await professionalService.getProfessionals({
      role,
      verified,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  },

  async getAdvices(req: Request, res: Response) {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const verified = parseBoolean(req.query.verified);
    const data = await professionalService.getAdvices({
      role,
      verified,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  },

  async getSupportResources(req: Request, res: Response) {
    const getQueryValue = (value: unknown) => typeof value === "string" ? value : undefined;
    const data = await professionalService.getSupportResources({
      region: getQueryValue(req.query.region),
      serviceType: getQueryValue(req.query.serviceType),
      urgency: getQueryValue(req.query.urgency),
      search: getQueryValue(req.query.search),
    });
    res.json({ success: true, data });
  },
};
