import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, socketCorsOrigin } from "./lib/env";
import { ensureUploadDir, getPublicUploadBaseUrl } from "./lib/uploads";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { skillsRouter } from "./routes/skills";
import { bookingsRouter } from "./routes/bookings";
import { conversationsRouter } from "./routes/conversations";
import { walletRouter } from "./routes/wallet";
import { notificationsRouter } from "./routes/notifications";
import { leaderboardRouter } from "./routes/leaderboard";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  const uploadAbsDir = ensureUploadDir();
  app.use(getPublicUploadBaseUrl(), express.static(uploadAbsDir));

  app.use(
    cors({
      origin: [env.CLIENT_URL, socketCorsOrigin],
      credentials: true
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(cookieParser());

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/skills", skillsRouter);
  app.use("/api/bookings", bookingsRouter);
  app.use("/api/conversations", conversationsRouter);
  app.use("/api/wallet", walletRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/leaderboard", leaderboardRouter);

  app.use(errorHandler);

  return app;
}
