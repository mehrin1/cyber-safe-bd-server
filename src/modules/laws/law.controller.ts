import { Request, Response } from "express";
import { lawService } from "./law.service.js";

export const lawController = {
  async getLaws(req: Request, res: Response) {
    const region = typeof req.query.region === "string" ? req.query.region : undefined;
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const topic = typeof req.query.topic === "string" ? req.query.topic : undefined;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;

    const data = await lawService.getLaws({ region, category, status, topic, search });
    res.json({ success: true, data });
  },

  async getLawBySlug(req: Request, res: Response) {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const data = await lawService.getLawBySlug(slug);
    if (!data) {
      res.status(404).json({ success: false, message: "Law not found" });
      return;
    }
    res.json({ success: true, data });
  },
};
