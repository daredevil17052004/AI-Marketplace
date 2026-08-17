import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import { subscriber, getUserChannel } from "./pubsub.js";
import { verifyAccessToken } from "./tokens.js";

const userConnections = new Map<string, Set<WebSocket>>();

export function initWebSocketServer(server: Server): void {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    // Client connects as: ws://localhost:4000?token=xxx
    const url = new URL(req.url!, `http://localhost`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(1008, "No token provided");
      return;
    }

    // verify token
    let userId: string;
    try {
      const payload = verifyAccessToken(token);
      userId = payload.userId;
    } catch {
      ws.close(1008, "Invalid token");
      return;
    }

    // register this connection
    if (!userConnections.has(userId)) {
      userConnections.set(userId, new Set());
    }
    userConnections.get(userId)!.add(ws);

    // subscribe to this user's Redis channel
    const channel = getUserChannel(userId);
    await subscriber.subscribe(channel);

    // clean up on disconnect
    ws.on("close", async () => {
      userConnections.get(userId)?.delete(ws);
      if (userConnections.get(userId)?.size === 0) {
        userConnections.delete(userId);
        await subscriber.unsubscribe(channel);
      }
    });
  });

  // when Redis publishes a message, forward to the right user's WS
  subscriber.on("message", (channel, message) => {
    // Extract userId from channel name "job:events:{userId}"
    const userId = channel.split(":")[2];

    const connections = userConnections.get(userId);
    if (!connections) return;

    // Send to ALL connections for this user (multiple tabs)
    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
}