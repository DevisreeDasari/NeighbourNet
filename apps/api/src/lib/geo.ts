import { Prisma, PrismaClient } from "@prisma/client";

export type NearbyUserDistance = { userId: string; distanceMeters: number };

// Haversine distance in meters. Works without PostGIS.
export async function findNearbyUsers(params: {
  prisma: PrismaClient;
  lat: number;
  lng: number;
  radiusMeters: number;
  limit?: number;
}): Promise<NearbyUserDistance[]> {
  const limit = params.limit ?? 50;

  // Note: table names are quoted to match Prisma's default mappings.
  // Uses 6371000m earth radius.
  const rows = await params.prisma.$queryRaw<
    Array<{ id: string; distance_meters: number }>
  >(Prisma.sql`
    SELECT
      u."id" as id,
      (
        6371000 * 2 * asin(
          sqrt(
            pow(sin(radians((${params.lat}::double precision - u."lat") / 2)), 2) +
            cos(radians(u."lat")) * cos(radians(${params.lat}::double precision)) *
            pow(sin(radians((${params.lng}::double precision - u."lng") / 2)), 2)
          )
        )
      ) as distance_meters
    FROM "User" u
    WHERE u."lat" IS NOT NULL AND u."lng" IS NOT NULL
    ORDER BY distance_meters ASC
    LIMIT ${limit}
  `);

  return rows
    .filter((r) => Number(r.distance_meters) <= params.radiusMeters)
    .map((r) => ({ userId: r.id, distanceMeters: Number(r.distance_meters) }));
}
