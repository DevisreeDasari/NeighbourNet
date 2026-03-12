import { PrismaClient } from "@prisma/client";

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
  const query = `
    SELECT
      u."id" as id,
      (
        6371000 * 2 * asin(
          sqrt(
            pow(sin(radians(($1::double precision - u."lat") / 2)), 2) +
            cos(radians(u."lat")) * cos(radians($1::double precision)) *
            pow(sin(radians(($2::double precision - u."lng") / 2)), 2)
          )
        )
      ) as distance_meters
    FROM "User" u
    WHERE u."lat" IS NOT NULL AND u."lng" IS NOT NULL
    ORDER BY distance_meters ASC
    LIMIT $3
  `;

  const rows = (await params.prisma.$queryRawUnsafe(query, params.lat, params.lng, limit)) as Array<{
    id: string;
    distance_meters: number;
  }>;

  return rows
    .filter((r: { id: string; distance_meters: number }) => Number(r.distance_meters) <= params.radiusMeters)
    .map((r: { id: string; distance_meters: number }) => ({ userId: r.id, distanceMeters: Number(r.distance_meters) }));
}
