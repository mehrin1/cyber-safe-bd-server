import { z } from "zod";

export const createHelpRequestSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().min(10).max(5000),
  category: z.enum(["LEGAL", "MENTAL", "EMERGENCY", "ACCOUNT_SECURITY", "ONLINE_HARASSMENT", "FINANCIAL_FRAUD", "IMAGE_ABUSE", "CHILD_SAFETY"]),
  isAnonymous: z.boolean().optional().default(false),
});

export const createHelpMessageSchema = z.object({
  text: z.string().trim().min(1).max(3000),
});
