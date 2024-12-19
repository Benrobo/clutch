import { promises as fs } from "fs";
import path from "path";
import fetch from "node-fetch";
import env from "../../config/env.js";
import MediaService from "../../services/media.service.js";
import { TranscriptResult, TranscriptSegment } from "./types.js";
import retry from "async-retry";
import { generateSRT } from "./generateSRT.js";

/**
 * Generates transcript and SRT files from audio
 */
export default async function generateTranscript(
  audioPath: string,
  outputDir: string
): Promise<{ transcriptPath: string; srtPath: string }> {
  let audioUrl = "";
  const mediaService = new MediaService();

  try {
    console.log("Uploading audio file...");
    audioUrl = await mediaService.uploadAudioChunk(audioPath);
    console.log(`Uploaded audio to: ${audioUrl}`);

    const requestBody = {
      config: {
        encoding: "MP3",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        enableWordTimeOffsets: true,
        model: "video",
        useEnhanced: true,
        enableAutomaticPunctuation: true,
      },
      audio: {
        uri: audioUrl,
      },
    };

    // Start transcription operation
    console.log("Starting transcription...");
    const operationResponse = await retry(
      async (bail) => {
        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:longrunningrecognize?key=${env.GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          if (response.status >= 400 && response.status < 500) {
            bail(new Error(`Failed to start transcription: ${error}`));
            return;
          }
          throw new Error(`Failed to start transcription: ${error}`);
        }

        return await response.json();
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
      }
    );

    const { name: operationName } = operationResponse;
    console.log(`Transcription operation started: ${operationName}`);

    const transcriptionResult = await retry(
      async (bail) => {
        const checkResponse = await fetch(
          `https://speech.googleapis.com/v1/operations/${operationName}?key=${env.GOOGLE_API_KEY}`
        );

        if (!checkResponse.ok) {
          const error = await checkResponse.text();
          if (checkResponse.status >= 400 && checkResponse.status < 500) {
            bail(new Error(`Failed to check operation status: ${error}`));
            return;
          }
          throw new Error(`Failed to check operation status: ${error}`);
        }

        const operationStatus = await checkResponse.json();
        if (!operationStatus.done) {
          throw new Error("Operation not complete");
        }

        if (operationStatus.error) {
          bail(
            new Error(
              `Transcription failed: ${JSON.stringify(operationStatus.error)}`
            )
          );
          return;
        }

        return operationStatus.response;
      },
      {
        retries: 30,
        factor: 1.5,
        minTimeout: 5000,
        maxTimeout: 30000,
        onRetry: (error, attempt) => {
          console.log(
            `Waiting for transcription to complete (attempt ${attempt}/30)...`
          );
        },
      }
    );

    console.log("Transcription complete! Processing results...");
    const segments: TranscriptSegment[] = [];
    let fullTranscript = "";

    if (transcriptionResult.results) {
      for (const result of transcriptionResult.results) {
        if (result.alternatives && result.alternatives[0]) {
          const alternative = result.alternatives[0];
          const words = alternative.words || [];

          // Group words into natural segments based on pauses and punctuation
          let currentSegment: { words: any[]; text: string[] } = {
            words: [],
            text: [],
          };
          let currentSegments: (typeof currentSegment)[] = [];

          for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const nextWord = words[i + 1];

            currentSegment.words.push(word);
            currentSegment.text.push(word.word);

            // Check for natural breaks:
            // 1. Significant pause between words (> 0.7 seconds)
            // 2. End of sentence punctuation
            // 3. Or if it's the last word
            const timeBetweenWords = nextWord
              ? parseFloat(nextWord.startTime.replace("s", "")) -
                parseFloat(word.endTime.replace("s", ""))
              : 0;
            const isPause = timeBetweenWords > 0.7;
            const isPunctuation = word.word.match(/[.!?,]$/);
            const isLastWord = i === words.length - 1;

            if (isPause || isPunctuation || isLastWord) {
              currentSegments.push(currentSegment);
              currentSegment = { words: [], text: [] };
            }
          }

          // Convert segments to final format
          currentSegments.forEach((segment) => {
            if (segment.words.length > 0) {
              const text = segment.text.join(" ");
              fullTranscript += text + " ";

              segments.push({
                text,
                start: parseFloat(segment.words[0].startTime.replace("s", "")),
                end: parseFloat(
                  segment.words[segment.words.length - 1].endTime.replace(
                    "s",
                    ""
                  )
                ),
              });
            }
          });
        }
      }
    }

    // Save transcript JSON
    const transcriptPath = path.join(outputDir, "transcript.json");
    await fs.writeFile(
      transcriptPath,
      JSON.stringify({ segments, fullTranscript }, null, 2)
    );

    // Generate and save SRT
    const srtPath = path.join(outputDir, "subtitles.srt");
    const srtContent = generateSRT(segments);
    await fs.writeFile(srtPath, srtContent);

    // Clean up remote audio file
    await mediaService.deleteFile(audioUrl);

    return { transcriptPath, srtPath };
  } catch (error) {
    // Clean up remote audio file if it exists
    if (audioUrl) {
      try {
        await mediaService.deleteFile(audioUrl);
      } catch (cleanupError) {
        console.warn("Failed to clean up remote audio file:", cleanupError);
      }
    }
    throw error;
  }
}
