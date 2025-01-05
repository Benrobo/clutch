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

router.post(
  `${basePath}/:gameId/upgrade-level`,
  useCatchErrors(
    isAuthenticated(dugoutController.upgradeLevel.bind(dugoutController))
  )
);

router.get(
  `${basePath}/:gameId/challenges`,
  useCatchErrors(
    isAuthenticated(
      dugoutController.getGameLevelChallenges.bind(dugoutController)
    )
  )
);

router.post(
  `${basePath}/:gameId/challenges/:challengeId/complete`,
  useCatchErrors(
    isAuthenticated(dugoutController.completeChallenge.bind(dugoutController))
  )
);

router.get(
  `${basePath}/stats`,
  useCatchErrors(
    isAuthenticated(dugoutController.getUserStats.bind(dugoutController))
  )
);

router.get(
  `${basePath}/points/:gameId`,
  useCatchErrors(
    isAuthenticated(
      dugoutController.getUserPointsByGameId.bind(dugoutController)
    )
  )
);

export default router;
