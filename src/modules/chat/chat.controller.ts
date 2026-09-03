import { Request, Response } from "express";
import { ZodError } from "zod";
import { chatService } from "./chat.service.js";
import { sendChatMessageSchema } from "./chat.validation.js";

export const chatController = {
  async listMine(req: Request, res: Response) {
    res.json({ success: true, data: await chatService.listConversations(req.authSession!.user) });
  },

  async listAll(req: Request, res: Response) {
    res.json({ success: true, data: await chatService.listConversations(req.authSession!.user, true) });
  },

  async getConversation(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await chatService.getConversation(id, req.authSession!.user);
    if (!data) return res.status(404).json({ success: false, message: "Conversation not found" });
    res.json({ success: true, data });
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const data = await chatService.sendMessage(sendChatMessageSchema.parse(req.body), req.authSession!.user);
      if (!data) return res.status(404).json({ success: false, message: "Conversation not found" });
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) return res.status(400).json({ success: false, message: "Validation failed", errors: error.issues });
      if (error instanceof Error && error.message === "CHAT_PROVIDER_NOT_CONFIGURED") return res.status(503).json({ success: false, message: "The chat assistant is not configured yet." });
      if (error instanceof Error && error.message.startsWith("CHAT_PROVIDER_")) return res.status(502).json({ success: false, message: "The chat assistant is temporarily unavailable." });
      throw error;
    }
  },
};
