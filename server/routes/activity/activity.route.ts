import { CreateActivitySchema, UpdateActivitySchema } from "@/features/api-types/activity";
import type { UserTypeSelect } from "@/server/db/schema";
import { zValidator } from "@/server/lib/validator-wrapper";
import { ApiStatusCode } from "@/types/api";
import { Hono } from "hono";
import { z } from "zod";
import { protect } from "../../middleware/auth.middleware";
import {
  createActivity,
  deleteActivity,
  getActivities,
  getActivitiesByJourneyId,
  getActivityById,
  getActivityByUniqueId,
  updateActivity,
} from "./activity.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// Journey ID parameter validation
const journeyIdParamSchema = z.object({
  journeyId: z.string().trim().min(1, { message: "Journey ID is required" }),
});

// Query parameters for activity listing with pagination and filtering
const activityQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  journeyId: z.string().optional(),
  activityType: z.string().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ===== Route setup =====

// Create a new router instance
const activityRouter = new Hono()
  // Get all activities with filtering and pagination
  .get("/", zValidator("query", activityQuerySchema), async (c) => {
    const queryParams = c.req.valid("query");
    const result = await getActivities({
      limit: queryParams.limit || 10,
      page: queryParams.page || 1,
      journeyId: queryParams.journeyId,
      activityType: queryParams.activityType,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    return c.json(result);
  })

  // Get activities by journey ID
  .get(
    "/journey/:journeyId",
    zValidator("param", journeyIdParamSchema),
    zValidator("query", activityQuerySchema),
    async (c) => {
      const journeyId = c.req.param("journeyId");
      const queryParams = c.req.valid("query");
      const result = await getActivitiesByJourneyId(journeyId, {
        limit: queryParams.limit || 10,
        page: queryParams.page || 1,
        activityType: queryParams.activityType,
        search: queryParams.search,
        sortBy: queryParams.sortBy,
        sortOrder: queryParams.sortOrder,
      });
      return c.json(result);
    }
  )

  // Get activity by unique ID
  .get("/unique/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getActivityByUniqueId(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get activity by ID
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getActivityById(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Create a new activity
  .post("/", protect, zValidator("json", CreateActivitySchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const body = await c.req.json();
    const result = await createActivity(body, user.id);
    return c.json(result, ApiStatusCode.CREATED);
  })

  // Update an activity
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", UpdateActivitySchema),
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as UserTypeSelect;
      const updateData = await c.req.json();
      const result = await updateActivity(id, updateData, user);

      if (!result.success) {
        return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
      }

      return c.json(result);
    }
  )

  // Delete an activity
  .delete("/:id", protect, zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user") as UserTypeSelect;
    const result = await deleteActivity(id, user);

    if (!result.success) {
      return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
    }

    return c.json(result);
  });

export default activityRouter;
