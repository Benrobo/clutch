import { inngestClient } from "../config/inngest.js";

export const processGamesEvery30Minutes = inngestClient.createFunction(
  { id: "process-games-every-30min" },
  { cron: "*/30 * * * *" }, // every 30 minutes
  async ({ step }) => {
    // process jobs every 30min
    inngestClient.send({
      name: "generate-game-highlights-metadata",
    });
  }
);

export const processGameHighlightsVideoEvery30Minutes =
  inngestClient.createFunction(
    { id: "process-highlights-video-every-30min" },
    { cron: "*/30 * * * *" }, // every 30 minutes
    async ({ step }) => {
      // process jobs every 30min
      inngestClient.send({
        name: "process-highlights-video",
      });
    }
  );
