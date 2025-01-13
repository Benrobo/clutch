import { comparePlayersHighlight } from "./comparePlayersHighlight.js";
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
  comparePlayersHighlight,
];

export { inngestClient } from "../config/inngest.js";
