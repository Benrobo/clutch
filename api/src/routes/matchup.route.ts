import { Hono } from "hono";
import MatchupController from "../controllers/matchup.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
import useCatchErrors from "../lib/error.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import {
  CreateMatchupSchema,
  GetTeamPlayersSchema,
} from "../lib/schema-validator.js";

const router = new Hono();
const basePath = "/matchup";
const matchupController = new MatchupController();

router.post(
  `${basePath}`,
  validateSchema(CreateMatchupSchema),
  useCatchErrors(
    isAuthenticated(matchupController.createMatchup.bind(matchupController))
  )
);

router.get(
  `${basePath}s`,
  useCatchErrors(
    isAuthenticated(matchupController.getMatchups.bind(matchupController))
  )
);

router.get(
  `${basePath}/players/:teamId`,
  validateSchema(GetTeamPlayersSchema),
  useCatchErrors(
    isAuthenticated(matchupController.getTeamPlayers.bind(matchupController))
  )
);

export default router;
