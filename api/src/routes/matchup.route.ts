import { Hono } from "hono";
import MatchupController from "../controllers/matchup.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";

const router = new Hono();
const basePath = "/matchup";
const matchupController = new MatchupController();

router.post(
  `${basePath}/create`,
  useCatchErrors(
    isAuthenticated(matchupController.createMatchup.bind(matchupController))
  )
);

export default router;
