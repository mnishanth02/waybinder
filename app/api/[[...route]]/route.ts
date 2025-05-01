import { handle } from "hono/vercel";

import app from "@/server";
import activityRouter from "@/server/routes/activity/activity.route";
import athleteRouter from "@/server/routes/athlete/athlete.route";
import gpsRouter from "@/server/routes/gps/gps.route";
import journeyRouter from "@/server/routes/journey/journey.route";
import userRouter from "@/server/routes/user/user.route";

export const runtime = "edge";

const routes = app
  .route("/user", userRouter)
  .route("/athlete", athleteRouter)
  .route("/journey", journeyRouter)
  .route("/activity", activityRouter)
  .route("/gps", gpsRouter);

//

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
