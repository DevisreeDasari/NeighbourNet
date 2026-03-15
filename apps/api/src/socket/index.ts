import type http from "http";
import { Server as SocketIOServer } from "socket.io";
import { socketCorsOrigin } from "../lib/env.js";

let io: SocketIOServer | null = null;

export function initSocket(server: http.Server) {
  io = new SocketIOServer(server, {
    cors: {
      origin: [socketCorsOrigin],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:room", (payload: { userId: string }) => {
      socket.join(`user:${payload.userId}`);
    });
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
