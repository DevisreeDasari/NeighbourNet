import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { imageUpload, getPublicUploadBaseUrl } from "../lib/uploads.js";
import { findNearbyUsers } from "../lib/geo.js";

export const usersRouter = Router();

usersRouter.get("/me", requireAuth, async (req, res) => {
  const userId = (req as AuthedRequest).userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      lat: true,
      lng: true,
      radius: true,
      pincode: true,
      colony: true,
      city: true,
      coinBalance: true,
      trustScore: true,
      isVerified: true,
      verificationStatus: true,
      createdAt: true
    }
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});

const nearbySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().int().min(100).max(20000).default(2000)
});

usersRouter.get("/nearby", async (req, res, next) => {
  try {
    const q = nearbySchema.parse(req.query);

    const nearby = await findNearbyUsers({
      prisma,
      lat: q.lat,
      lng: q.lng,
      radiusMeters: q.radius,
      limit: 200
    });

    const ids = nearby.map((n) => n.userId);
    if (ids.length === 0) return res.json({ users: [] });

    const users = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        avatar: true,
        colony: true,
        city: true,
        trustScore: true,
        isVerified: true,
        createdAt: true
      }
    });

    const distanceById = new Map(nearby.map((n) => [n.userId, n.distanceMeters] as const));

    const usersWithDistance = users
      .map((u: any) => ({ ...u, distanceMeters: distanceById.get(u.id) ?? null }))
      .sort((a: any, b: any) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

    return res.json({ users: usersWithDistance });
  } catch (e) {
    return next(e);
  }
});

const updateMeSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(200).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  radius: z.number().int().optional(),
  pincode: z.string().optional(),
  colony: z.string().optional(),
  city: z.string().optional()
});

usersRouter.put("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const body = updateMeSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        lat: true,
        lng: true,
        radius: true,
        pincode: true,
        colony: true,
        city: true
      }
    });

    return res.json({ user });
  } catch (e) {
    return next(e);
  }
});

usersRouter.post(
  "/me/photo",
  requireAuth,
  imageUpload.single("photo"),
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Missing file" });

    const avatarUrl = `${getPublicUploadBaseUrl()}/${file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    return res.status(201).json({ user });
  }
);

usersRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatar: true,
      coverPhoto: true,
      colony: true,
      city: true,
      trustScore: true,
      isVerified: true,
      createdAt: true
    }
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user });
});
