import { EventSchemas } from "inngest";
import type { JobType } from "./jobs.types.js";

type BaseEvent = {
  data?: {};
};

type GenerateGameHighlightsMetadata = BaseEvent & {};

type ProcessHighlightsVideoEvent = BaseEvent & {};

type ComparePlayersHighlightEvent = BaseEvent & {
  data: {
    matchupId: string;
  };
};

type Events = {
  "generate-game-highlights-metadata": GenerateGameHighlightsMetadata;
  "process-highlights-video": ProcessHighlightsVideoEvent;
  "compare-players-highlight": ComparePlayersHighlightEvent;
};

export const schemas = new EventSchemas().fromRecord<Events>();
