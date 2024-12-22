import { generateGameHighlightsMetadata } from "./generateHighlights.js";
import { processGameHighlightsVideo } from "./processHighlightsVideo.js";
import {
  processGamesEvery30Minutes,
  processGameHighlightsVideoEvery30Minutes,
} from "./scheduler.js";

export const inngestFunctions = [
  processGamesEvery30Minutes,
  processGameHighlightsVideoEvery30Minutes,
  processGameHighlightsVideo,
  generateGameHighlightsMetadata,
];

export { inngestClient } from "../config/inngest.js";
