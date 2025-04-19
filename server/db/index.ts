import { env } from "@/env/server-env";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

if (typeof WebSocket === "undefined") {
  try {
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch {
    console.warn(
      "WebSocket module not found. If running in Node.js, please install the 'ws' package."
    );
  }
} else {
  neonConfig.webSocketConstructor = WebSocket;
}

const pool = new Pool({ connectionString: env.DATABASE_URL });

const db = drizzle(pool, { schema });

export { db };
