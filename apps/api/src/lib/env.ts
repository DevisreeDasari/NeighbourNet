import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  SOCKET_CORS_ORIGIN: z.string().optional(),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1)
});

export const env = envSchema.parse(process.env);

export const socketCorsOrigin = env.SOCKET_CORS_ORIGIN ?? env.CLIENT_URL;
