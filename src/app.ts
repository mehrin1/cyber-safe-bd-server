import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { notFound } from "./middlewares/notFound.js";
import errorHandler from "./middlewares/globalErrorHandler.js";
import { learnRouter } from "./modules/learn/learn.routes.js";
import { lawRouter } from "./modules/laws/law.routes.js";
import { professionalRouter } from "./modules/professionals/professional.routes.js";
import { helpRouter } from "./modules/help/help.routes.js";
import { requireAuth } from "./middlewares/auth.js";
import { surveyRouter } from "./modules/surveys/survey.routes.js";
import { crimeRouter } from "./modules/crimes/crime.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

const app = express();

app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Cyber Safe BD server is running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    service: "cyber-safe-bd-server",
  });
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.get("/api/account/me", requireAuth, (req, res) => {
  const { user, session } = req.authSession!;

  res.json({
    success: true,
    data: {
      user,
      session: {
        expiresAt: session.expiresAt,
      },
    },
  });
});
app.use("/api", learnRouter);
app.use("/api", lawRouter);
app.use("/api", professionalRouter);
app.use("/api", helpRouter);
app.use("/api", surveyRouter);
app.use("/api", crimeRouter);
app.use("/api", dashboardRouter);
app.use(notFound);
app.use(errorHandler);

export default app;
