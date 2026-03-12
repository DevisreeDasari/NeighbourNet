import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { findNearbyUsers } from "../lib/geo";

export const skillsRouter = Router();

const listSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  userId: z.string().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().int().min(100).max(20000).optional()
});

skillsRouter.get("/", async (req, res, next) => {
  try {
    const q = listSchema.parse(req.query);

    const geoEnabled = typeof q.lat === "number" && typeof q.lng === "number";
    let distanceByUserId: Map<string, number> | null = null;
    let allowedUserIds: string[] | null = null;

    if (geoEnabled) {
      const nearby = await findNearbyUsers({
        prisma,
        lat: q.lat!,
        lng: q.lng!,
        radiusMeters: q.radius ?? 2000,
        limit: 500
      });
      allowedUserIds = nearby.map((n) => n.userId);
      distanceByUserId = new Map(nearby.map((n) => [n.userId, n.distanceMeters] as const));

      if (allowedUserIds.length === 0) return res.json({ skills: [] });
    }

    const skills = await prisma.skill.findMany({
      where: {
        isActive: true,
        ...(allowedUserIds ? { userId: { in: allowedUserIds } } : {}),
        ...(q.category ? { category: q.category } : {}),
        ...(q.userId ? { userId: q.userId } : {}),
        ...(q.search
          ? {
              OR: [
                { title: { contains: q.search, mode: "insensitive" } },
                { description: { contains: q.search, mode: "insensitive" } },
                { tags: { has: q.search } }
              ]
            }
          : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            colony: true,
            city: true,
            trustScore: true,
            isVerified: true,
            lat: true,
            lng: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const skillsWithDistance = geoEnabled && distanceByUserId
      ? skills
          .map((s: any) => ({
            ...s,
            distanceMeters: distanceByUserId!.get(s.userId) ?? null
          }))
          .sort((a: any, b: any) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
      : skills;

    return res.json({ skills: skillsWithDistance });
  } catch (e) {
    return next(e);
  }
});

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  proficiency: z.string().min(2),
  coinsPerHour: z.number().int().min(1).default(1)
});

skillsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as AuthedRequest).userId;
    const body = createSchema.parse(req.body);

    const skill = await prisma.skill.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        category: body.category,
        tags: body.tags,
        proficiency: body.proficiency,
        coinsPerHour: body.coinsPerHour
      }
    });

    return res.status(201).json({ skill });
  } catch (e) {
    return next(e);
  }
});

skillsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;

  const skill = await prisma.skill.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          colony: true,
          city: true,
          trustScore: true,
          isVerified: true
        }
      }
    }
  });

  if (!skill) return res.status(404).json({ message: "Skill not found" });
  return res.json({ skill });
});
