import { inngestClient } from "../config/inngest.js";

export const generateGameHighlightsMetadata = inngestClient.createFunction(
  { id: "generate-game-highlights-metadata" },
  { event: "generate-game-highlights-metadata" },
  async ({ step }) => {
    console.log(`🔃 Generating game highlights metadata...`);
  }
);
