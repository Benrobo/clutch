import { Hono } from "hono";
import FeedController from "../controllers/feed.controller.js";
import useCatchErrors from "../lib/error.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { GetTeamRostersSchema } from "../lib/schema-validator.js";

const router = new Hono();
const basePath = "/feed";
const feedController = new FeedController();

// Get all teams
router.get(
  `${basePath}/teams`,
  useCatchErrors(feedController.getTeams.bind(feedController))
);

// Get team rosters
router.post(
  `${basePath}/teams/rosters`,
  validateSchema(GetTeamRostersSchema),
  useCatchErrors(feedController.getTeamRosters.bind(feedController))
);

export default router;
