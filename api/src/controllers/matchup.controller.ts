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
    const { player1Id, player2Id } = await c.req.json();

    // const matchup = await this.baseballInsightService.createMatchup(userId, player1Id, player2Id);
  }
}

export default MatchupController;
