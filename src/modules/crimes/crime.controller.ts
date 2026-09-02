import { Request, Response } from "express";
import { crimeService } from "./crime.service.js";

export const crimeController = {
  async getCrimeTypes(req: Request, res: Response) {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const data = await crimeService.getCrimeTypes(search, category);
    res.json({ success: true, data });
  },
};
