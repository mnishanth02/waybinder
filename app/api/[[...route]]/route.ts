import { handle } from "hono/vercel";

import app from "@/server";
import athleteRouter from "@/server/routes/athlete/athlete.route";
import userRouter from "@/server/routes/user/user.route";

export const runtime = "edge";

const routes = app.route("/user", userRouter).route("/athlete", athleteRouter);

//

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
