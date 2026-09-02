import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.ts";

export default function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal server error";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid Prisma payload";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    const prismaError = err;
    if (prismaError.code === "P2002") {
      message = "Duplicate value error";
    } else if (prismaError.code === "P2003") {
      message = "Referenced record does not exist";
    } else if (prismaError.code === "P2025") {
      message = "Requested record was not found";
    }
  }

  if (err instanceof Error) {
    res.status(statusCode).json({
      success: false,
      message,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
