import { Hono } from "hono";
import gpxFilesRouter from "./gpx-files.route";
import mediaRouter from "./media.route";

const mediaRoutes = new Hono().route("/", mediaRouter).route("/gpx", gpxFilesRouter);

export default mediaRoutes;
