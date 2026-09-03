import app from "../src/app.js";

// Vercel invokes this Express app as a serverless function. Local development
// continues to use src/server.ts, which is the only place that calls listen().
export default app;
