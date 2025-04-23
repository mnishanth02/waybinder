import { CreateJourneySchema, UpdateJourneySchema } from "@/features/types/journey";
import type { UserTypeSelect } from "@/server/db/schema";
import { zValidator } from "@/server/lib/validator-wrapper";
import { ApiStatusCode } from "@/types/api";
import { Hono } from "hono";
import { z } from "zod";
import { protect } from "../../middleware/auth.middleware";
import {
  createJourney,
  deleteJourney,
  getJourneyById,
  getJourneyBySlug,
  getJourneyByUniqueId,
  getJourneys,
  getMyJourneys,
  updateJourney,
} from "./journey.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// Query parameters for journey listing with pagination and filtering
const journeyQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  journeyType: z.string().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ===== Route setup =====

// Create a new router instance
const journeyRouter = new Hono()
  // Get all journeys with filtering and pagination
  .get("/", zValidator("query", journeyQuerySchema), async (c) => {
    const queryParams = c.req.valid("query");
    const result = await getJourneys({
      limit: queryParams.limit || 10,
      page: queryParams.page || 1,
      journeyType: queryParams.journeyType,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    return c.json(result);
  })

  // Get journey by unique ID
  .get("/unique/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getJourneyByUniqueId(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get journey by slug
  .get("/slug/:slug", zValidator("param", z.object({ slug: z.string() })), async (c) => {
    const slug = c.req.param("slug");
    const result = await getJourneyBySlug(slug);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get journey by ID
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const result = await getJourneyById(id);
    if (!result.success) {
      return c.json(result, ApiStatusCode.NOT_FOUND);
    }
    return c.json(result);
  })

  // Get current user's journeys
  .get("/me", protect, zValidator("query", journeyQuerySchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const queryParams = c.req.valid("query");
    const result = await getMyJourneys(user.id, {
      limit: queryParams.limit || 10,
      page: queryParams.page || 1,
      journeyType: queryParams.journeyType,
      search: queryParams.search,
      sortBy: queryParams.sortBy,
      sortOrder: queryParams.sortOrder,
    });
    return c.json(result);
  })

  // Create a new journey
  .post("/", protect, zValidator("json", CreateJourneySchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const body = await c.req.json();
    const result = await createJourney(body, user.id);
    return c.json(result, ApiStatusCode.CREATED);
  })

  // Update a journey
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", UpdateJourneySchema),
    async (c) => {
      const id = c.req.param("id");
      const user = c.get("user") as UserTypeSelect;
      const updateData = await c.req.json();
      const result = await updateJourney(id, updateData, user);

      if (!result.success) {
        return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
      }

      return c.json(result);
    }
  )

  // Delete a journey
  .delete("/:id", protect, zValidator("param", idParamSchema), async (c) => {
    const id = c.req.param("id");
    const user = c.get("user") as UserTypeSelect;
    const result = await deleteJourney(id, user);

    if (!result.success) {
      return c.json(result, result.statusCode || ApiStatusCode.BAD_REQUEST);
    }

    return c.json(result);
  });

export default journeyRouter;
