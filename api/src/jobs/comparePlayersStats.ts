import { inngestClient } from "../config/inngest.js";
import redis from "../config/redis.js";
import retry from "async-retry";
import MatchupAIEngine from "../services/RAG/matchup-ai.engine.js";

export const comparePlayersStats = inngestClient.createFunction(
  { id: "compare-players-stats" },
  {
    event: "compare-players-stats",
  },
  async ({ step, event }) => {
    console.log(`🔃 Compare players stats job started`);
    const matchupId = event.data.matchupId;

    const matchupAIEngine = new MatchupAIEngine();
    await matchupAIEngine.generateMatchupHighlights(matchupId);
  }
);
