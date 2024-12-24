import { generateGameHighlightsMetadata } from "./generateHighlights.js";
import { processGameHighlightsVideo } from "./processHighlightsVideo.js";
import {
  processGamesScheduler,
  processGameHighlightsVideoScheduler,
} from "./scheduler.js";

export const inngestFunctions = [
  processGamesScheduler,
  processGameHighlightsVideoScheduler,
  processGameHighlightsVideo,
  generateGameHighlightsMetadata,
];

export { inngestClient } from "../config/inngest.js";
