import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;

declare module "express-serve-static-core" {
  interface Request {
    authSession?: AuthSession;
  }
}

async function loadSession(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) return null;

  const bootstrapAdminEmail = (process.env.BOOTSTRAP_ADMIN_EMAIL || "faysalahmed915@gmail.com").toLowerCase();
  if (session.user.email.toLowerCase() === bootstrapAdminEmail && session.user.role !== "ADMIN") {
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: "Faysal Ahmed", role: "ADMIN" },
      select: { name: true, role: true },
    });
    return { ...session, user: { ...session.user, name: user.name, role: user.role } };
  }

  return session;
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    req.authSession = await loadSession(req);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await loadSession(req);

    if (!session) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    req.authSession = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.authSession) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  if (req.authSession.user.role !== "ADMIN") {
    res.status(403).json({ success: false, message: "Administrator access required" });
    return;
  }

  next();
}
