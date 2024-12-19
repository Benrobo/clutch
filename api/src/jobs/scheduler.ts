import { inngestClient } from "../config/inngest.js";

export const processGamesEvery30Minutes = inngestClient.createFunction(
  { id: "process-games-every-30min" },
  { cron: "*/30 * * * *" }, // every 30 minutes
  async ({ step }) => {
    // process jobs every hour
    inngestClient.send({
      name: "generate-game-highlights-metadata",
    });
  }
);
