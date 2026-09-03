import { z } from "zod";

export const createCommunityPostSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(10).max(5000),
});

export const createCommunityCommentSchema = z.object({
  content: z.string().trim().min(1).max(1500),
});
