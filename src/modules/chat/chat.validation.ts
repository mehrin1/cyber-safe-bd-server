import { z } from "zod";

export const sendChatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(2000),
});
