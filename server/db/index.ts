import { env } from "@/env/server-env";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Configure neon for serverless environment
if (typeof WebSocket === "undefined") {
  try {
    // This is needed for environments where WebSocket is not available by default
    // like in Node.js environments
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
  } catch {
    console.warn(
      "WebSocket module not found. If running in Node.js, please install the 'ws' package."
    );
  }
} else {
  // In browser environments, WebSocket is available globally
  neonConfig.webSocketConstructor = WebSocket;
}

// Create a connection pool for better transaction support
const pool = new Pool({ connectionString: env.DATABASE_URL });

// Initialize Drizzle with the pool client and schema
const db = drizzle(pool, { schema });

export { db };
