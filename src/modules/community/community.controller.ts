import { Request, Response } from "express";
import { ZodError } from "zod";
import { parseBoolean, parsePositiveInt } from "../../utils/api.js";
import { communityService } from "./community.service.js";
import { createCommunityCommentSchema, createCommunityPostSchema } from "./community.validation.js";

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validationResponse(res: Response, error: ZodError) {
  res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  });
}

export const communityController = {
  async getPosts(req: Request, res: Response) {
    const mine = parseBoolean(req.query.mine) === true;
    if (mine && !req.authSession?.user) {
      res.status(401).json({ success: false, message: "Sign in to view your posts" });
      return;
    }

    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 160) : undefined;
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const limit = Math.min(parsePositiveInt(req.query.limit, 12), 50);
    const data = await communityService.getPosts({ search, mine, cursor, limit }, req.authSession?.user);
    res.json({ success: true, data });
  },

  async createPost(req: Request, res: Response) {
    try {
      const data = await communityService.createPost(createCommunityPostSchema.parse(req.body), req.authSession!.user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) return validationResponse(res, error);
      throw error;
    }
  },

  async toggleLike(req: Request, res: Response) {
    const data = await communityService.toggleLike(getParam(req.params.id)!, req.authSession!.user);
    if (!data) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.json({ success: true, data });
  },

  async getComments(req: Request, res: Response) {
    const data = await communityService.getComments(getParam(req.params.id)!);
    if (!data) {
      res.status(404).json({ success: false, message: "Post not found" });
      return;
    }
    res.json({ success: true, data });
  },

  async createComment(req: Request, res: Response) {
    try {
      const data = await communityService.createComment(
        getParam(req.params.id)!,
        createCommunityCommentSchema.parse(req.body),
        req.authSession!.user,
      );
      if (!data) {
        res.status(404).json({ success: false, message: "Post not found" });
        return;
      }
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) return validationResponse(res, error);
      throw error;
    }
  },
};
