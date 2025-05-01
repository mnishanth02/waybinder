import { zValidator } from "@/server/lib/validator-wrapper";
import type { SimplificationLevel } from "@/types/geo";
import { Hono } from "hono";
import { z } from "zod";
import { protect } from "../../middleware/auth.middleware";
import {
  getActivityGeoJson,
  getActivityStats,
  getActivityTrackpoints,
  uploadGpsFile,
} from "./gps.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// GeoJSON query parameters
const geoJsonQuerySchema = z.object({
  simplificationLevel: z
    .enum(["high", "medium", "low", "none"] as const)
    .optional()
    .default("medium"),
});

// Trackpoints query parameters
const trackpointsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1000)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  timeRange: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const [start, end] = val.split(",");
      if (!start || !end) return undefined;
      return { start, end };
    }),
});

// Upload GPS file validation schema
const uploadGpsSchema = z.object({
  file: z.any(), // Will be validated in the controller
  journeyId: z.string().min(1, { message: "Journey ID is required" }),
  activityId: z.string().optional(), // Optional for updates to existing activities
});

// Create a new router instance
const gpsRouter = new Hono()
  // Upload GPS file
  .post("/upload", protect, zValidator("form", uploadGpsSchema), async (c) => {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const journeyId = formData.get("journeyId") as string;
    const activityId = formData.get("activityId") as string | undefined;

    // Get user from the auth middleware
    const user = c.get("user");

    if (!user || !user.id) {
      return c.json(
        {
          success: false,
          message: "Unauthorized",
          error: "User not authenticated",
        },
        401
      );
    }

    const userId = user.id;

    if (!file) {
      return c.json(
        {
          success: false,
          message: "No file provided",
          error: "Please upload a GPS file",
        },
        400
      );
    }

    const result = await uploadGpsFile(file, journeyId, userId, activityId);
    return c.json(result, result.success ? 200 : 400);
  })

  // Get GeoJSON for an activity
  .get(
    "/activity/:id/geojson",
    zValidator("param", idParamSchema),
    zValidator("query", geoJsonQuerySchema),
    async (c) => {
      const id = c.req.param("id");
      const { simplificationLevel } = c.req.valid("query");
      const result = await getActivityGeoJson(id, simplificationLevel as SimplificationLevel);
      return c.json(result, result.success ? 200 : 404);
    }
  )

  // Get detailed statistics for an activity
  .get("/activity/:id/stats", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getActivityStats(id);
    return c.json(result, result.success ? 200 : 404);
  })

  // Get trackpoints for an activity (paginated)
  .get(
    "/activity/:id/trackpoints",
    zValidator("param", idParamSchema),
    zValidator("query", trackpointsQuerySchema),
    async (c) => {
      const id = c.req.param("id");
      const { limit, page, timeRange } = c.req.valid("query");
      const result = await getActivityTrackpoints(id, { limit, page, timeRange });
      return c.json(result, result.success ? 200 : 404);
    }
  );

export default gpsRouter;
