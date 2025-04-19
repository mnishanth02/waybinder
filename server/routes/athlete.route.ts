import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  createAthlete,
  deleteAthlete,
  getAthleteById,
  getAthleteByUniqueId,
  getAthletes,
  getMyAthleteProfile,
  updateAthlete,
} from "../controllers/athlete.controller";
import { insertAthleteSchema } from "../db/schema/athlete-schema";
import { protect } from "../middleware/auth.middleware";

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

// Create specific validation schemas for different operations
const createAthleteSchema = insertAthleteSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

const updateAthleteSchema = insertAthleteSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// ===== Route setup =====

// Create a new router instance
const athleteRouter = new Hono()
  .get("/", zValidator("query", athleteQuerySchema), getAthletes)
  .get("/unique/:id", zValidator("param", idParamSchema), getAthleteByUniqueId)
  .get("/:id", zValidator("param", idParamSchema), getAthleteById)
  .get("/me", protect, getMyAthleteProfile)
  .post("/", protect, zValidator("json", createAthleteSchema), createAthlete)
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", updateAthleteSchema),
    updateAthlete
  )
  .delete("/:id", protect, zValidator("param", idParamSchema), deleteAthlete);

export default athleteRouter;
