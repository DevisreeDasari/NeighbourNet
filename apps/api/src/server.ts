import http from "http";
import { env } from "./lib/env.js";
import { createApp } from "./app.js";
import { initSocket } from "./socket/index.js";

export function startServer() {
  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  let port = env.PORT;
  let retryTimer: NodeJS.Timeout | null = null;
  let isListening = false;
  let isAttempting = false;

  const tryListen = () => {
    if (isListening || isAttempting) return;
    isAttempting = true;
    server.listen(port, () => {
      if (isListening) return;
      isAttempting = false;
      isListening = true;
      if (retryTimer) {
        clearTimeout(retryTimer);
        retryTimer = null;
      }
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${port}`);
    });
  };

  server.on("error", (err: any) => {
    if (isListening) return;
    if (err?.code === "EADDRINUSE") {
      isAttempting = false;
      const oldPort = port;
      port = port + 1;
      // eslint-disable-next-line no-console
      console.log(`Port ${oldPort} in use, retrying on ${port}...`);
      if (!retryTimer) {
        retryTimer = setTimeout(() => {
          retryTimer = null;
          tryListen();
        }, 50);
      }
      return;
    }
    throw err;
  });

  tryListen();
}
