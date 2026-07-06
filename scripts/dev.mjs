// Starts the Vite dev server, then launches Electron pointed at it.

import { spawn } from "node:child_process";
import { createServer } from "vite";

const server = await createServer();
await server.listen();

const address = server.httpServer.address();
const url = `http://localhost:${address.port}`;
console.log(`[dev] Vite dev server: ${url}`);

const electron = spawn("npx", ["electron", "."], {
  stdio: "inherit",
  env: { ...process.env, VITE_DEV_SERVER_URL: url },
});

electron.on("exit", async () => {
  await server.close();
  process.exit(0);
});
