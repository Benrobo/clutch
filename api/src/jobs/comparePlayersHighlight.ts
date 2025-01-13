import { inngestClient } from "../config/inngest.js";
import redis from "../config/redis.js";
import retry from "async-retry";

export const comparePlayersHighlight = inngestClient.createFunction(
  { id: "compare-players-highlight" },
  {
    event: "process-highlights-video",
  },
  async ({ step }) => {
    console.log(`🔃 Compare players highlight job started`);
  }
);
