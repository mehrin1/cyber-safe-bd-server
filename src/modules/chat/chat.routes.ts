import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middlewares/auth.js";
import { chatController } from "./chat.controller.js";

export const chatRouter = Router();

chatRouter.get("/chat/conversations", requireAuth, chatController.listMine);
chatRouter.get("/chat/admin/conversations", requireAuth, requireAdmin, chatController.listAll);
chatRouter.get("/chat/conversations/:id", requireAuth, chatController.getConversation);
chatRouter.post("/chat/messages", requireAuth, chatController.sendMessage);
