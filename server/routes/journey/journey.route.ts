import { CreateAthleteSchema, UpdateAthleteSchema } from "@/features/types/athlete";
import type { UserTypeSelect } from "@/server/db/schema";
import { zValidator } from "@/server/lib/validator-wrapper";
import { ApiStatusCode } from "@/types/api";
import { Hono } from "hono";
import { z } from "zod";
import type { NewAthleteProfileType } from "../../db/schema/athlete-schema";
import { protect } from "../../middleware/auth.middleware";
import {
  createAthlete,
  deleteAthlete,
  getAthleteById,
  getAthleteByUniqueId,
  getAthletes,
  getMyAthleteProfile,
  updateAthlete,
} from "./journey.controller";

// ===== Validation schemas =====

// ID parameter validation with sanitization
const idParamSchema = z.object({
  id: z.string().trim().min(1, { message: "ID is required" }),
});

// Query parameters for athlete listing with pagination and filtering
const athleteQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 10)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : 1)),
  activity: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
  fitnessLevel: z.string().optional(),
  search: z
    .string()
    .optional()
    .transform((val) => val?.trim()),
});

// ===== Route setup =====

// Create a new router instance
const journeyRouter = new Hono()
  .get("/", zValidator("query", athleteQuerySchema), getAthletes)
  .get("/unique/:id", zValidator("param", idParamSchema), getAthleteByUniqueId)
  .get("/:id", zValidator("param", idParamSchema), getAthleteById)
  .get("/me", protect, getMyAthleteProfile)
  .post("/", protect, zValidator("json", CreateAthleteSchema), async (c) => {
    const user = c.get("user") as UserTypeSelect;
    const body = (await c.req.json()) as NewAthleteProfileType;
    body.userId = user.id;
    const result = await createAthlete(body);
    return c.json(result, ApiStatusCode.CREATED);
  })
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", UpdateAthleteSchema),
    updateAthlete
  )
  .delete("/:id", protect, zValidator("param", idParamSchema), deleteAthlete);

export default journeyRouter;
