import { inngestClient } from "../config/inngest.js";

export const processGameHighlightsVideo = inngestClient.createFunction(
  { id: "process-highlights-video" },
  { event: "process-highlights-video" },
  async ({ step }) => {}
);
