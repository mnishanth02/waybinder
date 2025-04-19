import createApp from "./lib/app";
import configureOpenAPI from "./lib/configure-open-api";
import { errorHandler, notFound } from "./middleware/error.middleware";

const app = createApp();

configureOpenAPI(app);

app.get("/health", (c) => c.json({ status: "ok" }));

app.notFound(notFound);
app.onError(errorHandler);

export default app;
