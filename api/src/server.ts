import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { inngestClient, inngestFunctions } from "./jobs/index.js";
import { serve as ingestServe } from "inngest/hono";
import env from "./config/env.js";
import testRoute from "./routes/test.route.js";
import authRoute from "./routes/auth.route.js";
import "./test.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Middleware config
app.use(
  "*",
  cors({
    origin: [env.CLIENT_URL],
    exposeHeaders: ["Content-Length"],
    allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"],
    credentials: true,
    maxAge: 600,
  })
);
app.options("*", (c) => c.text("", 204));

app.on(
  ["GET", "POST", "PUT", "DELETE"],
  "/api/inngest",
  ingestServe({
    client: inngestClient,
    functions: inngestFunctions,
  })
);

// Routes config
const routes: any[] = [testRoute, authRoute];
routes.forEach((route) => {
  app.route("/api", route);
});

const port = 4050;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
