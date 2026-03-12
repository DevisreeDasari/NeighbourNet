import { io, type Socket } from "socket.io-client";
import { API_URL } from "./api";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  socket = io(API_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"]
  });
  return socket;
}
