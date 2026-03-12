import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";

export type AuthedRequest = Request & { userId: string };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    (req as AuthedRequest).userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
