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
  };
};

type GenerateContentSourceEvent = BaseEvent & {};

type Events = {
  "generate-game-highlights-metadata": GenerateGameHighlightsMetadata;
  "process-highlights-video": ProcessHighlightsVideoEvent;
  "compare-players-stats": ComparePlayersStatsEvent;
  "generate-content-source": GenerateContentSourceEvent;
};

export const schemas = new EventSchemas().fromRecord<Events>();
