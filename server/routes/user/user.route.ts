import { protect } from "@/server/middleware";
import type { User } from "better-auth";
import { Hono } from "hono";
import { editProfile, getUserById, getUsers } from "./user.controller";

// Create a new router instance
const userRouter = new Hono()
  .get("/", async (c) => {
    const result = await getUsers();
    return c.json(result);
  })
  .get("/:id", protect, async (c) => {
    const id = c.req.param("id");
    return c.json(await getUserById(id));
  })
  .put("/profile", protect, async (c) => {
    const user = c.get("user") as User;
    const body = await c.req.json();
    body.id = user.id;
    return c.json(await editProfile(body));
  });

export default userRouter;
