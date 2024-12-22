import { SupportedTranslations } from "types/game.types";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface TranscriptResult {
  segments: TranscriptSegment[];
  fullTranscript: string;
}

export type TranslatedTranscriptResult = {
  [key in SupportedTranslations]: {
    lang: SupportedTranslations;
    translations: {
      lang: SupportedTranslations;
      translated_text: string;
      start: number;
      end: number;
      text: string;
    }[];
    fullTranscript: string;
  };
};

export interface ProcessVideoResult {
  jobId: string;
  outputs: {
    audio: string;
    transcript: string;
    subtitles: string;
    vertical: string;
  };
  summary: string;
}

export interface ProcessingOptions {
  outputDir?: string;
  format?: "vertical" | "horizontal";
  quality?: "high" | "medium" | "low";
}
