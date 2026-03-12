import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";

export const walletRouter = Router();

walletRouter.get("/balance", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { coinBalance: true } });
  return res.json({ balance: user?.coinBalance ?? 0 });
});

walletRouter.get("/transactions", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200
  });

  return res.json({ transactions });
});
