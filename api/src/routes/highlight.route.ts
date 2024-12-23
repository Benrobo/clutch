import { Hono } from "hono";
import HighlightController from "../controllers/highlight.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";

const router = new Hono();
const basePath = "/highlights";
const highlightController = new HighlightController();

// Toggle like status for a highlight
router.put(
  `${basePath}/:highlightId/like`,
  useCatchErrors(
    isAuthenticated(highlightController.toggleLike.bind(highlightController))
  )
);

export default router;
