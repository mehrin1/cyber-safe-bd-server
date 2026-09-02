import { Router } from "express";
import { learnController } from "./learn.controller.js";

export const learnRouter = Router();

learnRouter.get("/learn/categories", learnController.getCategories);
learnRouter.get("/learn/articles", learnController.getArticles);
learnRouter.get("/learn/articles/:id", learnController.getArticleById);
