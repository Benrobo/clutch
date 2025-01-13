import { Context } from "hono";
import MatchupService from "../services/matchup.service.js";
import sendResponse from "../lib/send-response.js";

class MatchupController {
  private matchupService: MatchupService;

  constructor() {
    this.matchupService = new MatchupService();
  }

  async createMatchup(c: Context) {
    const userId = c.get("userId");
    const {
      challengerId,
      opponentId,
      challengerTeamId,
      opponentTeamId,
      position,
    } = await c.req.json();

    // check if user has already created a matchup for this team, challenger, opponent and position

    // const matchup = await this.baseballInsightService.createMatchup(userId, player1Id, player2Id);
  }
}

export default MatchupController;
