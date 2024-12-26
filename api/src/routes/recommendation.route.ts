import { Hono } from "hono";
import RecommendationController from "../controllers/recommendation.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";

const router = new Hono();
const basePath = "/recommendations";
const recommendationController = new RecommendationController();

router.get(
  `${basePath}/feed`,
  useCatchErrors(
    isAuthenticated(
      recommendationController.getFeed.bind(recommendationController)
    )
  )
);

router.get(
  `${basePath}/feed/v2`,
  useCatchErrors(
    isAuthenticated(
      recommendationController.getFeedV2.bind(recommendationController)
    )
  )
);

router.post(
  `${basePath}/highlight/mark-seen`,
  useCatchErrors(
    isAuthenticated(
      recommendationController.markVideoAsSeen.bind(recommendationController)
    )
  )
);

export default router;
