import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import authRoutes from './routes/auth.js';
import agentRoutes from "./routes/agents.js";
import jobRoutes from "./routes/jobs.js";
import creditRoutes from "./routes/credits.js";
import adminRoutes from "./routes/admin.js";
import { AppError } from './lib/errors.js';
import { ZodError } from 'zod';
import { createServer } from "http";
import { initWebSocketServer } from "./lib/websocket.js";
import logger from "./lib/logger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

// --- Global Request Logger ---
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: (req as Request & { user?: { userId: string } }).user?.userId
    }, 'HTTP Request');
  });

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", rateLimiter('agents_api', 60, 60), agentRoutes);
app.use("/api/jobs", rateLimiter('jobs_api', 10, 60), jobRoutes);
app.use("/api/credits", rateLimiter('credits_api', 30, 60), creditRoutes);
app.use("/api/admin", adminRoutes);

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: err.issues.map((i) => i.message).join(", ") });
    return;
  }
  logger.error({ err }, "Unexpected error");
  res.status(500).json({ error: "Internal server error" });
});

const server = createServer(app);
initWebSocketServer(server);

server.listen(port, () => {
  logger.info(`server running on http://localhost:${port}`);
  logger.info(`WebSocket server listening on ws://localhost:${port}`)
});