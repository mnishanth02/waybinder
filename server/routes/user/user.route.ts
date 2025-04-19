import { isAdmin, protect } from "@/server/middleware";
import { Hono } from "hono";
import {
  editProfile,
  getProfile,
  getUserById,
  getUserWithAthleteProfile,
  getUsers,
} from "./user.controller";

// Create a new router instance
const userRouter = new Hono()
  .get("/", isAdmin, getUsers)
  .get("/me", protect, getProfile)
  .get("/:id", protect, getUserById)
  .get("/:id/athlete", protect, getUserWithAthleteProfile)
  .put("/profile", protect, editProfile);

export default userRouter;
