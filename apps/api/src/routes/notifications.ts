import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return res.json({ notifications });
});

notificationsRouter.put("/read-all", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  });

  return res.json({ ok: true });
});
