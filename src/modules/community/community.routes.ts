import { Router } from "express";
import { optionalAuth, requireAuth } from "../../middlewares/auth.js";
import { communityController } from "./community.controller.js";

export const communityRouter = Router();

communityRouter.get("/community/posts", optionalAuth, communityController.getPosts);
communityRouter.post("/community/posts", requireAuth, communityController.createPost);
communityRouter.get("/community/posts/:id/comments", communityController.getComments);
communityRouter.post("/community/posts/:id/comments", requireAuth, communityController.createComment);
communityRouter.post("/community/posts/:id/likes", requireAuth, communityController.toggleLike);
