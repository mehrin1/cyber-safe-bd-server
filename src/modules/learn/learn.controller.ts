import { Request, Response } from "express";
import { learnService } from "./learn.service.js";

export const learnController = {
  async getCategories(_req: Request, res: Response) {
    const data = await learnService.getCategories();
    res.json({ success: true, data });
  },

  async getArticles(req: Request, res: Response) {
    const categoryId =
      typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const data = await learnService.getArticles(categoryId);
    res.json({ success: true, data });
  },

  async getArticleById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await learnService.getArticleById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Article not found",
      });
      return;
    }

    res.json({ success: true, data });
  },
};
