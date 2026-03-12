import { Router } from "express";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { createNotification, emitToUser } from "../lib/notify";

export const bookingsRouter = Router();

enum Status {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

const createSchema = z.object({
  skillId: z.string().min(1),
  scheduledAt: z.string().datetime(),
  durationHours: z.number().int().min(1).max(3),
  notes: z.string().optional()
});

bookingsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const seekerId = (req as AuthedRequest).userId;
    const body = createSchema.parse(req.body);

    const skill = await prisma.skill.findUnique({
      where: { id: body.skillId },
      select: { id: true, userId: true, title: true, coinsPerHour: true }
    });

    if (!skill) return res.status(404).json({ message: "Skill not found" });
    if (skill.userId === seekerId) return res.status(400).json({ message: "You cannot book your own skill" });

    const totalCoins = body.durationHours * skill.coinsPerHour;

    const booking = await prisma.booking.create({
      data: {
        skillId: skill.id,
        providerId: skill.userId,
        seekerId,
        scheduledAt: new Date(body.scheduledAt),
        durationHours: body.durationHours,
        totalCoins,
        status: Status.PENDING,
        notes: body.notes
      }
    });

    await createNotification({
      userId: skill.userId,
      type: "booking_request",
      title: "New booking request",
      body: `You received a request for ${skill.title}.`,
      data: { bookingId: booking.id }
    });

    emitToUser(skill.userId, "booking:updated", booking);
    emitToUser(seekerId, "booking:updated", booking);

    return res.status(201).json({ booking });
  } catch (e) {
    return next(e);
  }
});

const listSchema = z.object({
  status: z.string().optional()
});

bookingsRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const q = listSchema.parse(req.query);

    const bookings = await prisma.booking.findMany({
      where: {
        OR: [{ providerId: userId }, { seekerId: userId }],
        ...(q.status ? { status: q.status as any } : {})
      },
      include: {
        skill: { select: { id: true, title: true, category: true } },
        provider: { select: { id: true, name: true, avatar: true } },
        seeker: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { scheduledAt: "asc" }
    });

    return res.json({ bookings });
  } catch (e) {
    return next(e);
  }
});

bookingsRouter.get("/:id", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const id = req.params.id;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      skill: true,
      provider: { select: { id: true, name: true, avatar: true } },
      seeker: { select: { id: true, name: true, avatar: true } },
      review: true
    }
  });

  if (!booking) return res.status(404).json({ message: "Booking not found" });
  if (booking.providerId !== userId && booking.seekerId !== userId) return res.status(403).json({ message: "Forbidden" });

  return res.json({ booking });
});

bookingsRouter.put("/:id/confirm", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const id = req.params.id;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { skill: true } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.providerId !== userId) return res.status(403).json({ message: "Only provider can confirm" });
    if (booking.status !== Status.PENDING) return res.status(400).json({ message: "Booking not pending" });

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const seeker = await tx.user.findUnique({ where: { id: booking.seekerId }, select: { coinBalance: true } });
      if (!seeker) throw new Error("Seeker not found");
      if (seeker.coinBalance < booking.totalCoins) {
        return { error: { status: 400, message: "Insufficient NeighbourCoins" } as const };
      }

      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { status: Status.CONFIRMED }
      });

      await tx.user.update({
        where: { id: booking.seekerId },
        data: { coinBalance: { decrement: booking.totalCoins } }
      });

      await tx.transaction.create({
        data: {
          userId: booking.seekerId,
          amount: -booking.totalCoins,
          type: "SPENT",
          referenceId: booking.id,
          description: `Booking confirmed: ${booking.skill.title}`
        }
      });

      return { booking: updatedBooking };
    });

    if ("error" in result && result.error) return res.status(result.error.status).json({ message: result.error.message });

    await createNotification({
      userId: booking.seekerId,
      type: "booking_confirmed",
      title: "Booking confirmed",
      body: `Your booking for ${booking.skill.title} has been confirmed.`,
      data: { bookingId: booking.id }
    });

    emitToUser(booking.providerId, "booking:updated", result.booking);
    emitToUser(booking.seekerId, "booking:updated", result.booking);

    return res.json({ booking: result.booking });
  } catch (e) {
    return next(e);
  }
});

bookingsRouter.put("/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const id = req.params.id;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { skill: true } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.providerId !== userId && booking.seekerId !== userId) return res.status(403).json({ message: "Forbidden" });
    if (booking.status === Status.CANCELLED) return res.json({ booking });
    if (booking.status === Status.COMPLETED) return res.status(400).json({ message: "Cannot cancel a completed booking" });

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedBooking = await tx.booking.update({ where: { id }, data: { status: Status.CANCELLED } });

      if (booking.status === Status.CONFIRMED) {
        await tx.user.update({
          where: { id: booking.seekerId },
          data: { coinBalance: { increment: booking.totalCoins } }
        });

        await tx.transaction.create({
          data: {
            userId: booking.seekerId,
            amount: booking.totalCoins,
            type: "BONUS",
            referenceId: booking.id,
            description: `Refund for cancelled booking: ${booking.skill.title}`
          }
        });
      }

      return updatedBooking;
    });

    await createNotification({
      userId: booking.providerId,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: `A booking for ${booking.skill.title} was cancelled.`,
      data: { bookingId: booking.id }
    });

    await createNotification({
      userId: booking.seekerId,
      type: "booking_cancelled",
      title: "Booking cancelled",
      body: `A booking for ${booking.skill.title} was cancelled.`,
      data: { bookingId: booking.id }
    });

    emitToUser(booking.providerId, "booking:updated", updated);
    emitToUser(booking.seekerId, "booking:updated", updated);

    return res.json({ booking: updated });
  } catch (e) {
    return next(e);
  }
});

bookingsRouter.put("/:id/complete", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const id = req.params.id;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { skill: true } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.providerId !== userId) return res.status(403).json({ message: "Only provider can complete" });
    if (booking.status !== Status.CONFIRMED) return res.status(400).json({ message: "Booking not confirmed" });

    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const updatedBooking = await tx.booking.update({ where: { id }, data: { status: Status.COMPLETED } });

      await tx.user.update({
        where: { id: booking.providerId },
        data: { coinBalance: { increment: booking.totalCoins } }
      });

      await tx.transaction.create({
        data: {
          userId: booking.providerId,
          amount: booking.totalCoins,
          type: "EARNED",
          referenceId: booking.id,
          description: `Session completed: ${booking.skill.title}`
        }
      });

      await tx.skill.update({
        where: { id: booking.skillId },
        data: { totalSessions: { increment: 1 } }
      });

      return updatedBooking;
    });

    await createNotification({
      userId: booking.seekerId,
      type: "booking_completed",
      title: "Session completed",
      body: `Your session for ${booking.skill.title} is marked complete. Leave a review!`,
      data: { bookingId: booking.id }
    });

    emitToUser(booking.providerId, "booking:updated", updated);
    emitToUser(booking.seekerId, "booking:updated", updated);

    return res.json({ booking: updated });
  } catch (e) {
    return next(e);
  }
});

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional()
});

bookingsRouter.post("/:id/review", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const id = req.params.id;
    const body = reviewSchema.parse(req.body);

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== Status.COMPLETED) return res.status(400).json({ message: "Can only review completed bookings" });

    const isSeeker = booking.seekerId === userId;
    const isProvider = booking.providerId === userId;
    if (!isSeeker && !isProvider) return res.status(403).json({ message: "Forbidden" });

    const revieweeId = isSeeker ? booking.providerId : booking.seekerId;

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: userId,
        revieweeId,
        rating: body.rating,
        comment: body.comment
      }
    });

    const agg = await prisma.review.aggregate({
      where: { revieweeId },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.user.update({
      where: { id: revieweeId },
      data: { trustScore: agg._avg.rating ?? 0 }
    });

    await createNotification({
      userId: revieweeId,
      type: "review_received",
      title: "New review received",
      body: `You received a ${body.rating}★ review.`,
      data: { bookingId: booking.id, reviewId: review.id }
    });

    return res.status(201).json({ review, stats: { avgRating: agg._avg.rating, count: agg._count.rating } });
  } catch (e) {
    return next(e);
  }
});
