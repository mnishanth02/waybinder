import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import serveEmojiFavicon from "../middleware/emoji.middleware";
import defaultHook from "./default-hook";
const API_BASE = "/api";

const createApp = () => {
  const app = new OpenAPIHono({ strict: false, defaultHook }).basePath(API_BASE);

  app.use("*", serveEmojiFavicon("🗻"));

  app.use("*", logger());
  app.use("*", prettyJSON());

  app.use(
    "*",
    cors({
      origin: ["http://localhost:3000", "http://localhost:8000"],
      credentials: true,
      maxAge: 86400,
    })
  );

  return app;
};

export default createApp;
