// ISSUE: Couldn't resolve the overlap within each video
// moving on with another approach.
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";
import { readFileSync } from "fs";
import env from "../config/env";
import fetch from "node-fetch";
import MediaService from "../services/media.service.js";
import { BASEBALL_KEYWORDS } from "../constant/mlb.js";
import retry from "async-retry";

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

interface SceneInfo {
  timestamp: number;
  duration: number;
  text: string;
  confidence: number;
}

/**
 * Extracts audio from video file
 * @param videoPath Path to input video file
 * @param outputDir Directory to save the extracted audio
 * @returns Path to extracted audio file
 */
async function extractAudio(
  videoPath: string,
  outputDir: string
): Promise<string> {
  const outputPath = path.join(
    outputDir,
    path.basename(videoPath).replace(/\.[^/.]+$/, "") + ".mp3"
  );

  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat("mp3")
      .audioCodec("libmp3lame")
      .outputOptions(["-q:a", "2", "-ar", "16000", "-ac", "1"])
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  return outputPath;
}

/**
 * Transcribes audio using Google Cloud Speech-to-Text REST API
 * @param audioPath Path to audio file
 * @returns Array of transcript segments with timestamps
 */
async function transcribeAudio(
  audioPath: string
): Promise<TranscriptSegment[]> {
  try {
    console.log("Uploading audio file...");
    const audioUrl = await mediaService.uploadAudioChunk(audioPath);
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

    // Start the long-running operation
    console.log("Starting transcription...");
    const operationResponse = await retry(
      async (bail) => {
        const response = await fetch(
          `https://speech.googleapis.com/v1/speech:longrunningrecognize?key=${env.GOOGLE_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          // If it's a 4xx error, don't retry
          if (response.status >= 400 && response.status < 500) {
            bail(new Error(`Failed to start transcription: ${error}`));
            return;
          }
          throw new Error(`Failed to start transcription: ${error}`);
        }

        return response.json();
      },
      {
        retries: 3,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 10000,
        onRetry: (error, attempt) => {
          console.log(`Retrying operation start (attempt ${attempt}/3)...`);
        },
      }
    );

    const { name: operationName } = operationResponse;
    console.log(`Operation started: ${operationName}`);

    // Poll for completion with retries
    const data = await retry(
      async (bail) => {
        console.log("Checking transcription status...");
        const checkResponse = await fetch(
          `https://speech.googleapis.com/v1/operations/${operationName}?key=${env.GOOGLE_API_KEY}`
        );

        if (!checkResponse.ok) {
          const error = await checkResponse.text();
          // If it's a 4xx error, don't retry
          if (checkResponse.status >= 400 && checkResponse.status < 500) {
            bail(new Error(`Failed to check operation status: ${error}`));
            return;
          }
          throw new Error(`Failed to check operation status: ${error}`);
        }

        const operationStatus = await checkResponse.json();
        if (operationStatus.done) {
          return operationStatus.response;
        }

        throw new Error("Operation not complete");
      },
      {
        retries: 10,
        factor: 1.5,
        minTimeout: 5000,
        maxTimeout: 30000,
        onRetry: (error, attempt) => {
          console.log(
            `Waiting for operation to complete (attempt ${attempt}/10)...`
          );
        },
      }
    );

    console.log("Transcription complete!");
    const allSegments: TranscriptSegment[] = [];

    // Process transcription results
    if (data.results) {
      for (const result of data.results) {
        if (result.alternatives && result.alternatives[0]) {
          const alternative = result.alternatives[0];
          const words = alternative.words || [];

          // Group words into natural segments based on pauses and punctuation
          let currentSegment: {
            words: any[];
            text: string[];
          } = {
            words: [],
            text: [],
          };
          let segments: (typeof currentSegment)[] = [];

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
              segments.push(currentSegment);
              currentSegment = {
                words: [],
                text: [],
              };
            }
          }

          // Convert segments to final format
          segments.forEach((segment) => {
            if (segment.words.length > 0) {
              allSegments.push({
                text: segment.text.join(" "),
                start: parseFloat(segment.words[0].startTime.replace("s", "")),
                end: parseFloat(
                  segment.words[segment.words.length - 1].endTime.replace(
                    "s",
                    ""
                  )
                ),
                confidence: alternative.confidence || 0,
                words: segment.words.map((word: any) => ({
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

    // Clean up uploaded file
    try {
      await mediaService.deleteFile(audioUrl);
    } catch (error) {
      console.warn(`Failed to delete file ${audioUrl}:`, error);
    }

    return allSegments;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Detects important moments based on transcript keywords and word-level timing
 */
function detectImportantMoments(segments: TranscriptSegment[]): SceneInfo[] {
  const scenes: SceneInfo[] = [];

  for (const segment of segments) {
    const text = segment.text.toLowerCase();

    // Check if segment contains any baseball keywords
    const hasKeyword = BASEBALL_KEYWORDS.some((keyword) => {
      const keywordLower = keyword.toLowerCase();
      // If we have word-level timestamps, use them for more precise timing
      if (segment.words) {
        const wordMatch = segment.words.find((w) =>
          w.word.toLowerCase().includes(keywordLower)
        );
        if (wordMatch) {
          scenes.push({
            timestamp: wordMatch.start,
            duration: wordMatch.end - wordMatch.start,
            text: segment.text,
            confidence: segment.confidence,
          });
          return true;
        }
      }
      return text.includes(keywordLower);
    });

    // Check for excitement indicators
    const hasExcitement = /!|wow|incredible|amazing|unbelievable/i.test(text);

    if ((hasKeyword || hasExcitement) && !segment.words) {
      // Only add if we haven't already added from word-level matching
      scenes.push({
        timestamp: segment.start,
        duration: segment.end - segment.start,
        text: segment.text,
        confidence: segment.confidence,
      });
    }
  }

  return scenes;
}

/**
 * Concatenates multiple video clips into a single file
 * @param clipPaths Array of clip file paths
 * @param outputPath Path for the concatenated output file
 */
async function concatenateClips(
  clipPaths: string[],
  outputPath: string
): Promise<string> {
  // Create a temporary file list for ffmpeg
  const fileList = clipPaths.map((path) => `file '${path}'`).join("\n");
  const listPath = outputPath.replace(".mp4", "-list.txt");
  await fs.writeFile(listPath, fileList);

  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(listPath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions("-c copy")
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });

  // Clean up the temporary file list
  await fs.unlink(listPath);
  return outputPath;
}

/**
 * Extracts video clips for detected scenes
 * @param inputPath Path to input video file
 * @param scenes Array of scene information
 * @param outputDir Directory to save the clips
 * @returns Array of clip file paths
 */
async function extractScenes(
  inputPath: string,
  scenes: SceneInfo[],
  outputDir: string
): Promise<string[]> {
  const outputPaths: string[] = [];
  const videoName = path.basename(inputPath, path.extname(inputPath));

  // TikTok dimensions
  const OUTPUT_WIDTH = 1080;
  const OUTPUT_HEIGHT = 1920;

  // Sort scenes by timestamp
  const sortedScenes = [...scenes].sort((a, b) => a.timestamp - b.timestamp);

  for (let i = 0; i < sortedScenes.length; i++) {
    const scene = sortedScenes[i];
    const nextScene = sortedScenes[i + 1];
    const outputFile = `scene${String(i).padStart(3, "0")}.mp4`;
    const outputPath = path.join(outputDir, outputFile);

    // Fixed buffer times
    const PRE_BUFFER = 3; // 3 seconds before
    const POST_BUFFER = 7; // 7 seconds after
    const MIN_CLIP_DURATION = 10; // Minimum 10 seconds per clip

    // Calculate clip boundaries
    const startTime = Math.max(0, scene.timestamp - PRE_BUFFER);
    let endTime = scene.timestamp + scene.duration + POST_BUFFER;

    // Ensure minimum clip duration
    if (endTime - startTime < MIN_CLIP_DURATION) {
      endTime = startTime + MIN_CLIP_DURATION;
    }

    // Adjust for next scene to avoid overlap
    if (nextScene) {
      endTime = Math.min(endTime, nextScene.timestamp);
    }

    const duration = endTime - startTime;

    console.log(`Processing scene ${i}:`, {
      startTime,
      endTime,
      duration,
      sceneStart: scene.timestamp,
      sceneEnd: scene.timestamp + scene.duration,
      text: scene.text,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        const command = ffmpeg(inputPath)
          .outputOptions([
            "-ss",
            startTime.toString(),
            "-t",
            duration.toString(),
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-vf",
            `scale=-2:${OUTPUT_HEIGHT},crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(iw-${OUTPUT_WIDTH})/2:0`,
            "-movflags",
            "+faststart",
          ])
          .output(outputPath);

        command.on("start", (commandLine) => {
          console.log("Spawned FFmpeg with command:", commandLine);
        });

        command.on("progress", (progress) => {
          console.log("Processing: ", progress.percent, "% done");
        });

        command.on("end", () => {
          console.log(`Successfully processed scene ${i}`);
          resolve();
        });

        command.on("error", (err, stdout, stderr) => {
          console.error("FFmpeg error:", err);
          console.error("FFmpeg stderr:", stderr);
          reject(new Error(`FFmpeg error: ${err.message}\nStderr: ${stderr}`));
        });

        command.run();
      });

      outputPaths.push(outputPath);
    } catch (error) {
      console.error(`Error processing scene ${i}:`, error);
      throw error;
    }
  }

  // Save metadata
  const metadataPath = path.join(outputDir, "scenes_metadata.json");
  const metadata = sortedScenes.map((scene, index) => ({
    sceneFile: `scene${index.toString().padStart(3, "0")}.mp4`,
    start: scene.timestamp,
    end: scene.timestamp + scene.duration,
    confidence: scene.confidence,
    text: scene.text,
  }));

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  if (outputPaths.length === 0) {
    console.log("No scenes were processed successfully");
    return [];
  }

  try {
    // Concatenate all clips into a single file
    console.log("Starting clip concatenation...");
    const finalOutputPath = path.join(outputDir, `${videoName}_combined.mp4`);

    const fileList = outputPaths.map((p) => `file '${p}'`).join("\n");
    const listPath = path.join(outputDir, "concat-list.txt");
    await fs.writeFile(listPath, fileList);

    console.log("Created concat list:", fileList);

    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg()
        .input(listPath)
        .inputOptions(["-f", "concat", "-safe", "0"])
        .outputOptions([
          "-c",
          "copy", // Use stream copy instead of re-encoding
          "-movflags",
          "+faststart",
        ])
        .output(finalOutputPath);

      command.on("start", (commandLine) => {
        console.log("Spawned FFmpeg concat with command:", commandLine);
      });

      command.on("progress", (progress) => {
        console.log("Concatenating: ", progress.percent, "% done");
      });

      command.on("end", () => {
        console.log("Successfully concatenated clips");
        resolve();
      });

      command.on("error", (err, stdout, stderr) => {
        console.error("FFmpeg concat error:", err);
        console.error("FFmpeg concat stderr:", stderr);
        reject(
          new Error(`FFmpeg concat error: ${err.message}\nStderr: ${stderr}`)
        );
      });

      command.run();
    });

    await fs.unlink(listPath);
    outputPaths.push(finalOutputPath);

    return outputPaths;
  } catch (error) {
    console.error("Error during concatenation:", error);
    return outputPaths;
  }
}

/**
 * Main processing function
 */
async function processVideo(inputPath: string) {
  // Create unique job ID using timestamp and random string
  const jobId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

  // Create job-specific directories
  const baseDir = path.join(process.cwd(), "public", "processed", jobId);
  const audioDir = path.join(baseDir, "audio");
  const clipsDir = path.join(baseDir, "clips");
  const transcriptDir = path.join(baseDir, "transcript");

  await Promise.all([
    fs.mkdir(audioDir, { recursive: true }),
    fs.mkdir(clipsDir, { recursive: true }),
    fs.mkdir(transcriptDir, { recursive: true }),
  ]);

  try {
    console.log("Processing video:", inputPath);
    console.log("Job ID:", jobId);

    // Extract audio to job-specific audio directory
    const audioPath = await extractAudio(inputPath, audioDir);
    console.log("Audio extracted to:", audioPath);

    // Get transcript
    const transcript = await transcribeAudio(audioPath);

    // Save transcript
    const transcriptPath = path.join(transcriptDir, "transcript.json");
    await fs.writeFile(transcriptPath, JSON.stringify(transcript, null, 2));
    console.log("Transcript saved to:", transcriptPath);

    // Detect and extract important moments
    const scenes = detectImportantMoments(transcript);
    const clipPaths = await extractScenes(inputPath, scenes, clipsDir);

    return {
      jobId,
      audioPath,
      transcriptPath,
      clipPaths,
      transcript,
      scenes,
    };
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

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
    const result = await processVideo(videoPath);

    console.log("Processing complete!");
    console.log(`Generated ${result.clipPaths.length} clips:`);
    result.clipPaths.forEach((path, i) =>
      console.log(`Clip ${i + 1}: ${path}`)
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main();
