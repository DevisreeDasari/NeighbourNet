import { Router } from "express";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  colony: z.string().optional(),
  pincode: z.string().optional()
});

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash,
        colony: body.colony,
        pincode: body.pincode
      },
      select: {
        id: true,
        name: true,
        email: true,
        coinBalance: true
      }
    });

    const tokenId = nanoid();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });

    res.cookie("nn_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/auth"
    });

    return res.status(201).json({ user, accessToken: signAccessToken(user.id) });
  } catch (e) {
    return next(e);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user?.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const tokenId = nanoid();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });

    res.cookie("nn_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/auth"
    });

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, coinBalance: user.coinBalance },
      accessToken: signAccessToken(user.id)
    });
  } catch (e) {
    return next(e);
  }
});

const sendOtpSchema = z.object({
  email: z.string().email()
});

authRouter.post("/send-otp", async (req, res, next) => {
  try {
    const body = sendOtpSchema.parse(req.body);

    const user = await prisma.user.upsert({
      where: { email: body.email },
      create: {
        email: body.email,
        name: body.email.split("@")[0] ?? "Neighbour"
      },
      update: {}
    });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await bcrypt.hash(code, 10);

    await prisma.otpCode.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 10)
      }
    });

    return res.json({ ok: true, devOtp: process.env.NODE_ENV === "production" ? undefined : code });
  } catch (e) {
    return next(e);
  }
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6)
});

authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const body = verifyOtpSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    if (!otp) return res.status(400).json({ message: "OTP expired or not found" });

    const ok = await bcrypt.compare(body.code, otp.codeHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    await prisma.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

    const tokenId = nanoid();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });

    res.cookie("nn_refresh", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/auth"
    });

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, coinBalance: user.coinBalance },
      accessToken: signAccessToken(user.id)
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/refresh-token", async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.nn_refresh as string | undefined;
    const token = cookieToken ?? (req.body?.refreshToken as string | undefined);

    if (!token) return res.status(401).json({ message: "Missing refresh token" });

    const payload = verifyRefreshToken(token);

    const activeTokens = await prisma.refreshToken.findMany({
      where: {
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    let match = false;
    for (const t of activeTokens) {
      if (await bcrypt.compare(token, t.tokenHash)) {
        match = true;
        break;
      }
    }

    if (!match) return res.status(401).json({ message: "Refresh token not recognized" });

    const newTokenId = nanoid();
    const newRefresh = signRefreshToken(payload.sub, newTokenId);
    const newHash = await bcrypt.hash(newRefresh, 10);

    await prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    });

    res.cookie("nn_refresh", newRefresh, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/api/auth"
    });

    return res.json({ accessToken: signAccessToken(payload.sub) });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie("nn_refresh", { path: "/api/auth" });
  return res.json({ ok: true });
});
