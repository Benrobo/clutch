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
