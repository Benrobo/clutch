// A new implementation focusing on transcript generation, video cropping, and subtitle embedding

import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";
import env from "../config/env";
import fetch from "node-fetch";
import MediaService from "../services/media.service.js";
import retry from "async-retry";
import shortUUID from "short-uuid";

const mediaService = new MediaService();

interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
  confidence: number;
  words?: {
    word: string;
    start: number;
    end: number;
  }[];
}

interface TranscriptResult {
  segments: TranscriptSegment[];
  fullTranscript: string;
}

interface ProcessVideoResult {
  jobId: string;
  outputs: {
    audio: string;
    transcript: string;
    subtitles: string;
    vertical: string;
  };
  summary: string;
}

async function extractAudio(
  videoPath: string,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, "audio.mp3");

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat("mp3")
      .audioCodec("libmp3lame")
      .outputOptions(["-q:a", "2", "-ar", "16000", "-ac", "1"])
      .output(outputPath)
      .on("end", () => {
        resolve(null);
      })
      .on("error", (err) => reject(err))
      .run();
  });

  // Verify file exists before returning
  await fs.access(outputPath);
  return outputPath;
}

async function transcribeAudio(audioPath: string): Promise<TranscriptResult> {
  let audioUrl = "";
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
                confidence: alternative.confidence || 0,
                words: segment.words.map((word) => ({
                  word: word.word,
                  start: parseFloat(word.startTime.replace("s", "")),
                  end: parseFloat(word.endTime.replace("s", "")),
                })),
              });
            }
          });
        }
      }
    }

    if (!fullTranscript) {
      throw new Error("No transcript was generated");
    }

    return {
      segments,
      fullTranscript: fullTranscript.trim(),
    };
  } catch (error) {
    console.error("Transcription failed:", error);
    throw error;
  } finally {
    if (audioUrl) {
      try {
        console.log("Cleaning up remote audio file...");
        await mediaService.deleteFile(audioUrl);
        console.log("Remote audio file deleted successfully");
      } catch (cleanupError) {
        console.warn(
          `Failed to delete remote audio file ${audioUrl}:`,
          cleanupError
        );
      }
    }
  }
}

async function generateSRT(
  segments: TranscriptSegment[],
  outputPath: string
): Promise<void> {
  const srtContent = segments
    .map((segment, index) => {
      const startTime = formatSRTTime(segment.start);
      const endTime = formatSRTTime(segment.end);
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
    })
    .join("\n");

  await fs.writeFile(outputPath, srtContent, "utf-8");
}

async function saveTranscript(
  result: TranscriptResult,
  outputPath: string
): Promise<void> {
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2), "utf-8");
}

async function cropToVertical(
  inputPath: string,
  outputPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v",
        "libx264", // Use standard H.264 codec
        "-preset",
        "veryfast",
        "-crf",
        "23", // Balance quality and size
        "-movflags",
        "+faststart",
        "-r",
        "30",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
      ])
      .videoFilters([
        "crop=ih*9/16:ih",
        "scale=1080:1920:force_original_aspect_ratio=decrease",
        "pad=1080:1920:(ow-iw)/2:(oh-ih)/2",
      ])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log("Started ffmpeg with command:", cmd);
      })
      .on("progress", (progress) => {
        // console.log(`Processing: ${Math.round(progress?.percent as any)}% done`);
      })
      .on("end", () => {
        console.log("Finished processing video");
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        console.error("Error:", err);
        console.error("ffmpeg stderr:", stderr);
        reject(new Error(`FFmpeg failed: ${err.message}`));
      })
      .run();
  });
}

async function createJobFolder(inputPath: string): Promise<string> {
  const jobId = shortUUID.generate();
  const videoName = path.basename(inputPath, path.extname(inputPath));

  // Create job directory in the src/processed folder
  const baseDir = path.join(process.cwd(), "public", "processed");
  const jobDir = path.join(baseDir, `${videoName}_${jobId}`);
  await fs.mkdir(jobDir, { recursive: true });

  return jobDir;
}

export async function processVideo(
  inputPath: string
): Promise<ProcessVideoResult> {
  try {
    await fs.access(inputPath);

    const jobDir = await createJobFolder(inputPath);
    console.log("Processing in:", jobDir);

    const audioPath = await extractAudio(inputPath, jobDir);
    console.log("Audio extracted to:", audioPath);

    const transcriptResult = await transcribeAudio(audioPath);

    const transcriptPath = path.join(jobDir, "transcript.json");
    const srtPath = path.join(jobDir, "subtitles.srt");

    await Promise.all([
      saveTranscript(transcriptResult, transcriptPath),
      generateSRT(transcriptResult.segments, srtPath),
    ]);

    console.log("Transcripts saved to:", transcriptPath);

    // Step 3: Crop video to vertical
    console.log("Cropping video to vertical format...");
    const verticalPath = path.join(jobDir, "vertical.mp4");
    await cropToVertical(inputPath, verticalPath);

    // Verify vertical video was created successfully
    await fs.access(verticalPath);
    console.log("Vertical video saved to:", verticalPath);

    return {
      jobId: path.basename(jobDir),
      outputs: {
        audio: audioPath,
        transcript: transcriptPath,
        subtitles: srtPath,
        vertical: verticalPath,
      },
      summary: `Processed ${path.basename(inputPath)} successfully`,
    };
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

export default processVideo;

// Main execution
async function main() {
  try {
    const videoPath = path.join(
      process.cwd(),
      "public",
      "video-samples",
      "2.mp4"
    );

    console.log("Starting video processing...");
    await processVideo(videoPath);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main();

function formatSRTTime(seconds: number): string {
  const pad = (num: number, size: number = 2): string =>
    num.toString().padStart(size, "0");

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds * 1000) % 1000);

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(milliseconds, 3)}`;
}
