import { Hono } from "hono";
import HighlightController from "../controllers/highlight.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { AIChatConversationSchema } from "../lib/schema-validator.js";
import SpotlightController from "../controllers/spotlight.controller.js";

const router = new Hono();
const basePath = "/spotlight";
const spotlightController = new SpotlightController();

router.get(
  `${basePath}s`,
  useCatchErrors(spotlightController.getSpotlights.bind(spotlightController))
);

router.get(
  `${basePath}/:id`,
  useCatchErrors(
    spotlightController.getSpotlightContent.bind(spotlightController)
  )
);

// router.get(
//   `${basePath}s`,
//   useCatchErrors(
//     isAuthenticated(spotlightController.getSpotlights.bind(spotlightController))
//   )
// );

export default router;
