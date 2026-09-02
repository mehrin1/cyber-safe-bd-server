import { Request, Response } from "express";
import { ZodError } from "zod";
import { helpService } from "./help.service.js";
import {
  createHelpMessageSchema,
  createHelpRequestSchema,
} from "./help.validation.js";

function formatValidationError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

export const helpController = {
  async getHelpRequests(req: Request, res: Response) {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const data = await helpService.getHelpRequests(req.authSession!.user, status);
    res.json({ success: true, data });
  },

  async getHelpRequestById(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await helpService.getHelpRequestById(id, req.authSession!.user);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Help request not found",
      });
      return;
    }

    res.json({ success: true, data });
  },

  async createHelpRequest(req: Request, res: Response) {
    try {
      const payload = createHelpRequestSchema.parse(req.body);
      const data = await helpService.createHelpRequest(payload, req.authSession?.user);
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formatValidationError(error),
        });
        return;
      }

      throw error;
    }
  },

  async getMessages(req: Request, res: Response) {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await helpService.getMessages(id, req.authSession!.user);
    if (!data) {
      res.status(404).json({ success: false, message: "Help request not found" });
      return;
    }
    res.json({ success: true, data });
  },

  async createMessage(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const payload = createHelpMessageSchema.parse(req.body);
      const data = await helpService.createMessage(id, payload, req.authSession!.user);
      if (!data) {
        res.status(404).json({ success: false, message: "Help request not found" });
        return;
      }
      res.status(201).json({ success: true, data });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formatValidationError(error),
        });
        return;
      }

      throw error;
    }
  },
};
