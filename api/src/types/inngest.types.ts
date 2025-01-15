import { EventSchemas } from "inngest";
import type { JobType } from "./jobs.types.js";

type BaseEvent = {
  data?: {};
};

type GenerateGameHighlightsMetadata = BaseEvent & {};

type ProcessHighlightsVideoEvent = BaseEvent & {};

type ComparePlayersStatsEvent = BaseEvent & {
  data: {
    matchupId: string;
    jobId: string;
  };
};

type Events = {
  "generate-game-highlights-metadata": GenerateGameHighlightsMetadata;
  "process-highlights-video": ProcessHighlightsVideoEvent;
  "compare-players-stats": ComparePlayersStatsEvent;
};

export const schemas = new EventSchemas().fromRecord<Events>();
