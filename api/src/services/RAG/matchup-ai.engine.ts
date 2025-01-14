import MLBAPIHelper from "../../helpers/mlb/mlb-api.helper.js";
import Gemini from "../../helpers/gemini.helper.js";
import retry from "async-retry";
import prisma from "../../prisma/index.js";

export default class MatchupAIEngine {
  private gemini: Gemini;
  private mlbApi: MLBAPIHelper;
  constructor() {
    this.gemini = new Gemini();
    this.mlbApi = new MLBAPIHelper();
  }

  private async getPlayerStats(challenger: number, opponent: number) {
    try {
      return await retry(
        async () => {
          const [challengerStats, opponentStats] = await Promise.all([
            this.mlbApi.getPlayerStats(challenger),
            this.mlbApi.getPlayerStats(opponent),
          ]);
          return { challengerStats, opponentStats };
        },
        {
          retries: 3,
          onRetry(e, attempt) {
            console.log(`Failed to get player stats, attempt ${attempt}`);
          },
        }
      );
    } catch (e: any) {
      throw new Error("Failed to get player stats");
    }
  }

  async generateMatchupHighlights(matchupId: string) {
    const matchup = await prisma.matchups.findUnique({
      where: { id: matchupId },
    });

    const challenger = matchup?.challenger_id;
    const opponent = matchup?.opponent_id;

    if (!challenger || !opponent) {
      throw new Error("Challenger or opponent not found");
    }

    const { challengerStats, opponentStats } = await this.getPlayerStats(
      challenger,
      opponent
    );

    console.log(challengerStats, opponentStats);
  }
}
