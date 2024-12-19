import { TranscriptSegment } from "./types.js";
import { formatTimestampSRT } from "./utils.js";

/**
 * Generates SRT formatted subtitles from transcript segments
 */
export function generateSRT(segments: TranscriptSegment[]): string {
  return segments
    .map((segment, index) => {
      const startTime = formatTimestampSRT(segment.start);
      const endTime = formatTimestampSRT(segment.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    })
    .join("\n");
}
