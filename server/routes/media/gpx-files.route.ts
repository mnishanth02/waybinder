import { CreateGpxFileSchema, UpdateGpxFileSchema } from "@/features/api-types/media";
import type { UserTypeSelect } from "@/server/db/schema";
import { zValidator } from "@/server/lib/validator-wrapper";
import { protect } from "@/server/middleware";
import { ApiStatusCode } from "@/types/api";
import { Hono } from "hono";
import { z } from "zod";
import {
  createGpxFile,
  deleteGpxFile,
  getGpxFileById,
  getGpxFileByMediaId,
  getGpxFilesByActivityId,
  updateGpxFile,
} from "./gpx-files.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// Media ID parameter validation
const mediaIdParamSchema = z.object({
  mediaId: z.string().trim().min(1, { message: "Media ID is required" }),
});

// Activity ID parameter validation
const activityIdParamSchema = z.object({
  activityId: z.string().trim().min(1, { message: "Activity ID is required" }),
});

// Query parameters for GPX files listing with pagination
const gpxFilesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
});

// ===== Route setup =====

// Create a new router instance
const gpxFilesRouter = new Hono()
  // Get GPX file by ID
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getGpxFileById(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get GPX file by media ID
  .get("/media/:mediaId", zValidator("param", mediaIdParamSchema), async (c) => {
    const mediaId = c.req.param("mediaId");
    const result = await getGpxFileByMediaId(mediaId);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get GPX files by activity ID
  .get(
    "/activity/:activityId",
    zValidator("param", activityIdParamSchema),
    zValidator("query", gpxFilesQuerySchema),
    async (c) => {
      const activityId = c.req.param("activityId");
      const queryParams = c.req.valid("query");
      const result = await getGpxFilesByActivityId(activityId, {
        limit: queryParams.limit || 10,
        page: queryParams.page || 1,
      });
      return c.json(result);
    }
  )

  // Create a new GPX file
  .post("/", protect, zValidator("json", CreateGpxFileSchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const body = await c.req.json();
    const result = await createGpxFile(body, user.id);
    return c.json(result, result.success ? ApiStatusCode.CREATED : ApiStatusCode.BAD_REQUEST);
  })

  // Update a GPX file
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", UpdateGpxFileSchema),
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as UserTypeSelect;
      const updateData = await c.req.json();
      const result = await updateGpxFile(id, updateData, user);

      if (!result.success) {
        return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
      }

      return c.json(result);
    }
  )

  // Delete a GPX file
  .delete("/:id", protect, zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user") as UserTypeSelect;
    const result = await deleteGpxFile(id, user);

    if (!result.success) {
      return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
    }

    return c.json(result);
  });

export default gpxFilesRouter;
