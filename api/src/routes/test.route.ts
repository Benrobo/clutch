import { Hono } from "hono";

const router = new Hono();
const basePath = "/test";

router.get(`${basePath}`, (c) => {
  return c.text("Hello Hono!");
});

export default router;
