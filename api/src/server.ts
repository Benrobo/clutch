import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { inngestClient, inngestFunctions } from "./jobs/index.js";
import { serve as ingestServe } from "inngest/hono";
import env from "./config/env.js";
import testRoute from "./routes/test.route.js";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import feedRoute from "./routes/feed.route.js";
import recommendationRoute from "./routes/recommendation.route.js";
import highlightRoute from "./routes/highlight.route.js";
import baseballInsightRoute from "./routes/baseball-insight.route.js";
import spotlightRoute from "./routes/spotlight.route.js";
import dugoutRoute from "./routes/dugout.route.js";
import matchupRoute from "./routes/matchup.route.js";
import "./test.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Middleware config
app.use(
  "*",
  cors({
    origin: [
      env.CLIENT_URL,
      "http://localhost:4173",
      "http://benlab.a.pinggy.link",
    ],
    exposeHeaders: ["Content-Length"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    maxAge: 600,
  })
);
app.options("*", (c) => c.text("", 204));

// Routes config
const routes: any[] = [
  testRoute,
  authRoute,
  userRoute,
  feedRoute,
  recommendationRoute,
  highlightRoute,
  baseballInsightRoute,
  spotlightRoute,
  dugoutRoute,
  matchupRoute,
];
routes.forEach((route) => {
  app.route("/api", route);
});

app.on(
  ["GET", "POST", "PUT", "DELETE"],
  "/api/inngest",
  ingestServe({
    client: inngestClient,
    functions: inngestFunctions,
  })
);

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 4050;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
