import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { createNotification, emitToUser } from "../lib/notify.js";

export const conversationsRouter = Router();

conversationsRouter.get("/", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId }
      }
    },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    },
    orderBy: { lastMessageAt: "desc" }
  });

  return res.json({ conversations });
});

conversationsRouter.get("/:id/messages", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const id = req.params.id;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true }
  });

  if (!conv) return res.status(404).json({ message: "Conversation not found" });
  if (!conv.participants.some((participant: { userId: string }) => participant.userId === userId)) return res.status(403).json({ message: "Forbidden" });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" }
  });

  return res.json({ messages });
});

const startSchema = z.object({
  participantId: z.string().min(1)
});

conversationsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const body = startSchema.parse(req.body);

    if (body.participantId === userId) return res.status(400).json({ message: "Invalid participant" });

    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: body.participantId } } }
        ]
      },
      include: { participants: true }
    });

    if (existing) return res.status(201).json({ conversation: existing });

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: body.participantId }]
        }
      },
      include: { participants: true }
    });

    return res.status(201).json({ conversation });
  } catch (e) {
    return next(e);
  }
});

const messageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(["TEXT", "IMAGE", "SESSION_PROPOSAL"]).default("TEXT"),
  metadata: z.any().optional()
});

conversationsRouter.post("/:id/messages", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const id = req.params.id;
    const body = messageSchema.parse(req.body);

    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: { participants: true }
    });

    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    if (!conv.participants.some((p: { userId: string }) => p.userId === userId)) return res.status(403).json({ message: "Forbidden" });

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        content: body.content,
        type: body.type as any,
        metadata: body.metadata as any
      }
    });

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    });

    for (const p of conv.participants as Array<{ userId: string }>) {
      emitToUser(p.userId, "message:new", message);
      if (p.userId !== userId) {
        await createNotification({
          userId: p.userId,
          type: "message_new",
          title: "New message",
          body: "You have a new message.",
          data: { conversationId: id, messageId: message.id }
        });
      }
    }

    return res.status(201).json({ message });
  } catch (e) {
    return next(e);
  }
});
