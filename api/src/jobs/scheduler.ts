import { inngestClient } from "../config/inngest.js";

export const processGamesScheduler = inngestClient.createFunction(
  { id: "process-games-scheduler" },
  { cron: "*/10 * * * *" },
  async ({ step }) => {
    // process jobs every 30min
    inngestClient.send({
      name: "generate-game-highlights-metadata",
    });
  }
);

export const processGameHighlightsVideoScheduler = inngestClient.createFunction(
  { id: "process-highlights-video-scheduler" },
  { cron: "*/45 * * * *" },
  async ({ step }) => {
    inngestClient.send({
      name: "process-highlights-video",
    });
  }
);
