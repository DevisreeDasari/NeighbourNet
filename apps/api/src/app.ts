import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env, socketCorsOrigin } from "./lib/env.js";
import { ensureUploadDir, getPublicUploadBaseUrl } from "./lib/uploads.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { skillsRouter } from "./routes/skills.js";
import { bookingsRouter } from "./routes/bookings.js";
import { conversationsRouter } from "./routes/conversations.js";
import { walletRouter } from "./routes/wallet.js";
import { notificationsRouter } from "./routes/notifications.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { errorHandler } from "./middleware/error.js";

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
