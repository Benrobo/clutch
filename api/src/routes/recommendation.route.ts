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

export default router;
