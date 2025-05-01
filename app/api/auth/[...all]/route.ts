import { auth } from "@/server/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Specify Node.js runtime to avoid Edge Runtime compatibility issues
export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler(auth.handler);
