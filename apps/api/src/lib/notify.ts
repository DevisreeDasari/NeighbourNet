import { prisma } from "./prisma";
import { getIo } from "../socket";

export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: unknown;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      data: params.data as any
    }
  });

  try {
    const io = getIo();
    io.to(`user:${params.userId}`).emit("notification:new", notification);
  } catch {
    // Socket not initialized (e.g. during tests)
  }

  return notification;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  try {
    const io = getIo();
    io.to(`user:${userId}`).emit(event, payload);
  } catch {
    // ignore
  }
}
