import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import authRoutes from './routes/auth.js';
import agentRoutes from "./routes/agents.js";
import jobRoutes from "./routes/jobs.js";
import { AppError } from './lib/errors.js';
import { createServer } from "http";
import { initWebSocketServer } from "./lib/websocket.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error("Unexpected error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// app.listen(port, () => {
//     console.log(`Server running on http://localhost:${port}`);
// });

const server = createServer(app);
initWebSocketServer(server);

server.listen(port, ()=>{
  console.log(`server running on http://localhost:${port}`);
  console.log(`WebSocket server listening on ws://localhost:${port}`)
})