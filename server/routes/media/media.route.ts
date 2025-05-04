import { CreateMediaSchema, UpdateMediaSchema } from "@/features/api-types/media";
import type { UserTypeSelect } from "@/server/db/schema";
import { zValidator } from "@/server/lib/validator-wrapper";
import { protect } from "@/server/middleware";
import { ApiStatusCode } from "@/types/api";
import { Hono } from "hono";
import { z } from "zod";
import {
  createMedia,
  deleteMedia,
  getMediaByActivityId,
  getMediaById,
  getMediaByJourneyId,
  getMediaByUserId,
  updateMedia,
} from "./media.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// Journey ID parameter validation
const journeyIdParamSchema = z.object({
  journeyId: z.string().trim().min(1, { message: "Journey ID is required" }),
});

// Activity ID parameter validation
const activityIdParamSchema = z.object({
  activityId: z.string().trim().min(1, { message: "Activity ID is required" }),
});

// User ID parameter validation
const userIdParamSchema = z.object({
  userId: z.string().trim().min(1, { message: "User ID is required" }),
});

// Query parameters for media listing with pagination and filtering
const mediaQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  mediaType: z.string().optional(),
});

// ===== Route setup =====

// Create a new router instance
const mediaRouter = new Hono()
  // Get media by ID
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getMediaById(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get media by journey ID
  .get(
    "/journey/:journeyId",
    zValidator("param", journeyIdParamSchema),
    zValidator("query", mediaQuerySchema),
    async (c) => {
      const journeyId = c.req.param("journeyId");
      const queryParams = c.req.valid("query");
      const result = await getMediaByJourneyId(journeyId, {
        limit: queryParams.limit || 10,
        page: queryParams.page || 1,
        mediaType: queryParams.mediaType,
      });
      return c.json(result);
    }
  )

  // Get media by activity ID
  .get(
    "/activity/:activityId",
    zValidator("param", activityIdParamSchema),
    zValidator("query", mediaQuerySchema),
    async (c) => {
      const activityId = c.req.param("activityId");
      const queryParams = c.req.valid("query");
      const result = await getMediaByActivityId(activityId, {
        limit: queryParams.limit || 10,
        page: queryParams.page || 1,
        mediaType: queryParams.mediaType,
      });
      return c.json(result);
    }
  )

  // Get media by user ID
  .get(
    "/user/:userId",
    zValidator("param", userIdParamSchema),
    zValidator("query", mediaQuerySchema),
    async (c) => {
      const userId = c.req.param("userId");
      const queryParams = c.req.valid("query");
      const result = await getMediaByUserId(userId, {
        limit: queryParams.limit || 10,
        page: queryParams.page || 1,
        mediaType: queryParams.mediaType,
      });
      return c.json(result);
    }
  )

  // Create a new media
  .post("/", protect, zValidator("json", CreateMediaSchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const body = await c.req.json();
    const result = await createMedia(body, user.id);
    return c.json(result, result.success ? ApiStatusCode.CREATED : ApiStatusCode.BAD_REQUEST);
  })

  // Update a media
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", UpdateMediaSchema),
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as UserTypeSelect;
      const updateData = await c.req.json();
      const result = await updateMedia(id, updateData, user);

      if (!result.success) {
        return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
      }

      return c.json(result);
    }
  )

  // Delete a media
  .delete("/:id", protect, zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user") as UserTypeSelect;
    const result = await deleteMedia(id, user);

    if (!result.success) {
      return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
    }

    return c.json(result);
  });

export default mediaRouter;
