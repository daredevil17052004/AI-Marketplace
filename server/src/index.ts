import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import authRoutes from './routes/auth.js';
import agentRoutes from "./routes/agents.js";
import jobRoutes from "./routes/jobs.js";
import { AppError } from './lib/errors.js';
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
  
  // When the request finishes, log the details
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      // Optional: log user ID if it exists
      userId: (req as any).user?.userId 
    }, 'HTTP Request');
  });
  
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/agents", rateLimiter('agents_api', 60, 60), agentRoutes);
app.use("/api/jobs", rateLimiter('jobs_api', 10, 60), jobRoutes);


app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  logger.error({ err }, "Unexpected error");
  res.status(500).json({ error: "Internal server error" });
});

const server = createServer(app);
initWebSocketServer(server);

server.listen(port, ()=>{
  logger.info(`server running on http://localhost:${port}`);
  logger.info(`WebSocket server listening on ws://localhost:${port}`)
})