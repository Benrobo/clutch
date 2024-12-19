import { EventSchemas } from "inngest";
import type { JobType } from "./jobs.types.js";

type BaseEvent = {
  data?: {};
};

type GenerateGameHighlightsMetadata = BaseEvent & {};

type ProcessHighlightsVideoEvent = BaseEvent & {
  data: {};
};

type Events = {
  "generate-game-highlights-metadata": GenerateGameHighlightsMetadata;
  "process-highlights-video": ProcessHighlightsVideoEvent;
};

export const schemas = new EventSchemas().fromRecord<Events>();
