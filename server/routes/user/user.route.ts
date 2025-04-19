import { isAdmin, protect } from "@/server/middleware";
import { Hono } from "hono";
import { editProfile, getProfile, getUserById, getUsers } from "./user.controller";

// Create a new router instance
const userRouter = new Hono()
  .get("/", isAdmin, getUsers)
  .get("/me", protect, getProfile)
  .put("/profile", protect, editProfile)
  .get("/:id", protect, getUserById);

export default userRouter;
