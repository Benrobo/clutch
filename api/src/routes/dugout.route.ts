import { Hono } from "hono";
import DugoutController from "../controllers/dugout.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";

const router = new Hono();
const basePath = "/dugout";
const dugoutController = new DugoutController();

router.post(
  `${basePath}/:gameId/join`,
  useCatchErrors(
    isAuthenticated(dugoutController.joinGame.bind(dugoutController))
  )
);

router.get(
  `${basePath}/games-progress`,
  useCatchErrors(
    isAuthenticated(
      dugoutController.getUserGamesProgress.bind(dugoutController)
    )
  )
);

export default router;
