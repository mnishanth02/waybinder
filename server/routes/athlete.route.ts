import { athleteOnboardingSchema, athleteUpdateSchema } from "@/lib/validations/athlete-onboarding";
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
import { protect } from "../middleware/auth.middleware";

// ID parameter validation
const idParamSchema = z.object({
  id: z.string().min(1, { message: "ID is required" }),
});

// Create a new router instance with proper validation and protection
const athleteRouter = new Hono()
  .get("/", getAthletes)
  .get("/me", protect, getMyAthleteProfile)
  .get("/unique/:id", zValidator("param", idParamSchema), getAthleteByUniqueId)
  .get("/:id", zValidator("param", idParamSchema), getAthleteById)
  .post("/", protect, zValidator("json", athleteOnboardingSchema), createAthlete)
  .put(
    "/:id",
    protect,
    zValidator("param", idParamSchema),
    zValidator("json", athleteUpdateSchema),
    updateAthlete
  )
  .delete("/:id", protect, zValidator("param", idParamSchema), deleteAthlete);

export default athleteRouter;
