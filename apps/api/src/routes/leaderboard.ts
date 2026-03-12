import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

export const leaderboardRouter = Router();

const querySchema = z.object({
  period: z.enum(["week", "month", "all"]).default("month"),
  category: z.string().optional()
});

leaderboardRouter.get("/", async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);

    const since =
      q.period === "week"
        ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
        : q.period === "month"
          ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
          : null;

    // Simple leaderboard: coins earned in period + trustScore tiebreaker
    const earned = await prisma.transaction.groupBy({
      by: ["userId"],
      where: {
        type: "EARNED",
        ...(since ? { createdAt: { gte: since } } : {})
      },
      _sum: { amount: true }
    });

    const earnedMap = new Map(earned.map((e: any) => [e.userId, e._sum?.amount ?? 0] as const));

    // If category filter: only include users who have skills in that category
    let allowedUserIds: Set<string> | null = null;
    if (q.category) {
      const users = await prisma.skill.findMany({
        where: { category: q.category },
        select: { userId: true },
        distinct: ["userId"]
      });
      allowedUserIds = new Set(users.map((u: any) => u.userId));
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        colony: true,
        trustScore: true,
        isVerified: true
      }
    });

    const rows = users
      .filter((u: any) => (allowedUserIds ? allowedUserIds.has(u.id) : true))
      .map((u: any) => ({
        user: u,
        coinsEarned: earnedMap.get(u.id) ?? 0
      }))
      .sort((a: any, b: any) => {
        if (b.coinsEarned !== a.coinsEarned) return b.coinsEarned - a.coinsEarned;
        return (b.user.trustScore ?? 0) - (a.user.trustScore ?? 0);
      })
      .slice(0, 100)
      .map((r: any, idx: number) => ({
        rank: idx + 1,
        ...r
      }));

    return res.json({ leaderboard: rows });
  } catch (e) {
    return next(e);
  }
});
