import { inngestClient } from "../config/inngest.js";
import redis from "../config/redis.js";
import dayjs from "dayjs";
import retry from "async-retry";
import shortUUID from "short-uuid";
import GameService from "../services/game.service.js";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import { TRACK_MLB_SEASON } from "../constant/mlb.js";
import path from "path";
import fs from "fs/promises";
import {
  createProcessingFolder,
  downloadPlaybackVideo,
  getProcessedDir,
  hasAudio,
} from "../scripts/video-processing/utils.js";
import { Prisma } from "@prisma/client";
import {
  DBPlaybackOutput,
  SupportedTranslations,
  SupportedTranslationsEnum,
} from "../types/game.types.js";
import extractAudio from "../scripts/video-processing/extractAudio.js";
import generateTranscript from "../scripts/video-processing/generateTranscript.js";
import {
  SupportedLanguages,
  saveTranslatedTranscript,
  translateTranscript,
} from "../scripts/video-processing/translation.js";
import { sleep } from "../lib/utils.js";
import generateVideoSummary from "../scripts/video-processing/generateVideoSummary.js";

const HIGHLIGHTS_VIDEO_PROCESSING_KEY = "highlights-video-processing";
const HIGHLIGHTS_VIDEO_FAILED_KEY = "highlights-video-failed";
const MAX_RETRY_ATTEMPTS = 3;
const FAILED_CACHE_TTL = 60 * 60 * 24; // 24 hours in seconds

const gameService = new GameService();

export const processGameHighlightsVideo = inngestClient.createFunction(
  { id: "process-highlights-video" },
  {
    event: "process-highlights-video",
  },
  async ({ step }) => {
    processVideo();
  }
);

// processVideo();

async function processVideo() {
  setTimeout(async () => {
    await retry(
      async () => {
        console.log("\n🔃 Starting video processing..");
        // get all highlights videos
        const processingStatus = await checkVideoProcessingStatus();
        if (processingStatus) {
          console.log(`🔃 [${processingStatus?.title}] is already in process`);
          return;
        }
        const playback = await getNextPlaybackToProcess();

        if (!playback) {
          console.log("🔃 No more highlights to process");
          return;
        }

        await processPlaybackVideo(playback as any);
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(
            `🔄 Retrying to process playback highlights video (attempt ${retryCount})`
          );
          console.log(`ERROR PROCESSING PLAYBACK HIGHLIGHTS:`, e);
        },
      }
    );
  }, 100);
}

async function processPlaybackVideo(playback: DBPlaybackOutput) {
  try {
    const videoName = `${playback.id}.mp4`;

    console.log(
      `🔃 Processing video for [${playback?.title}]: ${playback?.mlb_video_duration}\n`
    );

    // Store current processing highlight in cache
    await redis.set(HIGHLIGHTS_VIDEO_PROCESSING_KEY, playback.id);

    const videoInfo = await downloadPlaybackVideo(
      playback?.mlb_video_url,
      videoName
    );

    console.log(`✅ Video ready at: ${videoInfo.videoPath}`);
    console.log(`📁 File name: ${videoInfo.fileName}\n`);
    console.log(`🔃 Starting video processing for [${playback?.title}]`);

    // Check if video has audio before proceeding with audio processing
    const hasAudioTrack = await hasAudio(videoInfo.videoPath);
    let transcript: Prisma.JsonValue | null = null;
    let translatedTranscript: Prisma.JsonValue | null = null;

    if (hasAudioTrack) {
      console.log(`🔊 Video has audio, proceeding with transcription`);

      // create processing dir
      const mainProcessPath = await createProcessingFolder(
        videoInfo?.fileName.replace(".mp4", "")
      );

      // extract audio
      const audioPath = await extractAudioFromVideo(
        videoInfo?.videoPath,
        mainProcessPath,
        playback?.id
      );

      if (audioPath) {
        // transcribe audio
        const transcriptOutput = await transcribeAudio(
          audioPath,
          mainProcessPath,
          playback?.id
        );

        const translatedTranscripts = [];
        for (const lang of SupportedLanguages) {
          try {
            // Add delay between different languages
            if (translatedTranscripts.length > 0) {
              await sleep(3000);
            }

            const translation = await translateTranscript(
              transcriptOutput?.transcriptPath,
              lang,
              playback?.id
            );
            if (translation) {
              translatedTranscripts.push(translation);
            }
          } catch (error) {
            console.error(`Failed to translate to ${lang}:`, error);
            await sleep(5000);
          }
        }

        // Save all translations to a separate file
        if (
          translatedTranscripts.length > 0 &&
          transcriptOutput?.transcriptPath
        ) {
          await saveTranslatedTranscript(
            transcriptOutput?.transcriptPath,
            translatedTranscripts as any
          );
        }

        // save transcript to DB.
        const transcriptPath = transcriptOutput?.transcriptPath;
        const translatedTranscriptPath = path.join(
          path.dirname(transcriptPath),
          "translated-transcript.json"
        );
        transcript = JSON.parse(await fs.readFile(transcriptPath, "utf-8"));
        translatedTranscript = JSON.parse(
          await fs.readFile(translatedTranscriptPath, "utf-8")
        );

        // cleanup processing directory
        await fs.rm(mainProcessPath, { recursive: true, force: true });
      }
    } else {
      console.log(`🔇 Video has no audio, skipping transcription`);
    }

    // generate summary (always do this regardless of audio)
    const summary = await generateVideoSummary(videoInfo?.videoPath);

    // save all processed data to DB
    await retry(
      async () => {
        console.log(`🔃 Saving processed data for [${playback?.title}]`);
        await prisma.$transaction(async (tx) => {
          await tx.highlights_playbacks.update({
            where: {
              highlight_id: playback?.highlight_id,
              id: playback.id,
            },
            data: {
              transcript: transcript as any,
              translated_transcript: translatedTranscript as any,
              summary: summary as any,
              processed: true, // Mark as processed
            },
          });
        });

        console.log(`✅ Saved processed data for [${playback?.title}]`);

        // cleanup video file
        await fs.rm(videoInfo?.videoPath, { force: true });
        console.log(`✅ Cleaned up for [${playback?.title}]`);

        // clear cache
        await redis.del(HIGHLIGHTS_VIDEO_PROCESSING_KEY);

        return true;
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(`❌ Error processing video for [${playback?.title}]:`, e);
          console.log(
            `🔄 Retrying to process video for [${playback?.title}] (attempt ${retryCount})`
          );
        },
      }
    );
  } catch (e: any) {
    console.error(`❌ Error processing video for [${playback?.title}]:`, e);

    // Get current failed processes
    const failedProcesses = JSON.parse(
      (await redis.get(HIGHLIGHTS_VIDEO_FAILED_KEY)) || "[]"
    );

    // Find existing failed process
    const existingFailedIndex = failedProcesses.findIndex(
      (fp: any) => fp.id === playback.id
    );

    if (existingFailedIndex >= 0) {
      // Update existing failed process
      failedProcesses[existingFailedIndex].attempts += 1;
      failedProcesses[existingFailedIndex].lastAttempt =
        new Date().toISOString();
    } else {
      // Add new failed process
      failedProcesses.push({
        id: playback.id,
        attempts: 1,
        lastAttempt: new Date().toISOString(),
      });
    }

    // Store updated failed processes
    await redis.set(
      HIGHLIGHTS_VIDEO_FAILED_KEY,
      JSON.stringify(failedProcesses),
      "EX",
      FAILED_CACHE_TTL
    );

    console.log(
      `❌ Failed process count for [${playback?.title}]: ${
        failedProcesses.find((fp: any) => fp.id === playback.id)?.attempts || 0
      }`
    );

    // Clear processing status
    await redis.del(HIGHLIGHTS_VIDEO_PROCESSING_KEY);
    throw e;
  }
}

async function extractAudioFromVideo(
  videoPath: string,
  mainProcessDir: string,
  pb_id: string
) {
  try {
    return await retry(
      async () => {
        console.log(`🔃 Extracting audio for [${pb_id}]`);
        const audioPath = path.join(mainProcessDir, "audio.mp3");
        await extractAudio(videoPath, audioPath);
        return audioPath;
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(`❌ Error extracting audio for [${pb_id}]:`, e);
          console.log(
            `🔄 Retrying to extract audio for [${pb_id}] (attempt ${retryCount})`
          );
        },
      }
    );
  } catch (e: any) {
    console.error(`❌ Error extracting audio for [${pb_id}]:`, e);
    throw e;
  }
}

async function transcribeAudio(
  audioPath: string,
  mainProcessDir: string,
  pb_id: string
) {
  try {
    return await retry(
      async () => {
        console.log(`🔃 Transcribing audio for [${pb_id}]`);

        // Check for existing valid transcript files
        const existingFiles = await checkTranscriptFiles(mainProcessDir);
        if (existingFiles) {
          console.log(`✅ Found existing transcript files for [${pb_id}]`);
          return existingFiles;
        }

        const transcriptOutput = await generateTranscript(
          audioPath,
          mainProcessDir
        );

        // Verify the newly generated files
        const newFiles = await checkTranscriptFiles(mainProcessDir);
        if (!newFiles) {
          throw new Error("Generated transcript files are invalid or empty");
        }

        return transcriptOutput;
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(`❌ Error transcribing audio for [${pb_id}]:`, e);
          console.log(
            `🔄 Retrying to transcribe audio for [${pb_id}] (attempt ${retryCount})`
          );
        },
      }
    );
  } catch (e: any) {
    console.error(`❌ Error transcribing audio for [${pb_id}]:`, e);
    throw e;
  }
}

async function checkVideoProcessingStatus() {
  const cachedProcessingVideo = await redis.get(
    HIGHLIGHTS_VIDEO_PROCESSING_KEY
  );

  if (!cachedProcessingVideo) {
    return null;
  }
  const highlightsPlaybacks = await gameService.getAllGameHighlightsPlayback();

  return highlightsPlaybacks.find(
    (playback) => playback.id === cachedProcessingVideo && !playback.processed
  );
}

async function getNextPlaybackToProcess() {
  const highlightsPlaybacks = await gameService.getAllGameHighlightsPlayback();
  const processingVideo = await redis.get(HIGHLIGHTS_VIDEO_PROCESSING_KEY);

  // Get failed processes
  const failedProcesses = JSON.parse(
    (await redis.get(HIGHLIGHTS_VIDEO_FAILED_KEY)) || "[]"
  );

  // Filter out playbacks that:
  // 1. Have failed too many times
  // 2. Have already been processed
  const availablePlaybacks = highlightsPlaybacks.filter((playback) => {
    // Check if failed too many times
    const failedProcess = failedProcesses.find(
      (fp: any) => fp.id === playback.id
    );
    if (failedProcess && failedProcess.attempts >= MAX_RETRY_ATTEMPTS) {
      return false;
    }

    // Skip if already processed
    if (playback.processed === true) {
      return false;
    }

    return true;
  });

  console.log(
    `📊 Found ${availablePlaybacks.length} unprocessed playbacks out of ${highlightsPlaybacks.length} total`
  );

  if (!processingVideo) {
    const initialPlayback = availablePlaybacks[0];
    if (initialPlayback) {
      return initialPlayback;
    }
  } else {
    const nextPlayback = availablePlaybacks.find(
      (playback) => playback.id !== processingVideo
    );
    if (nextPlayback) {
      return nextPlayback;
    }
  }

  return null;
}

async function checkTranscriptFiles(
  mainProcessDir: string
): Promise<{ transcriptPath: string; srtPath: string } | null> {
  const transcriptPath = path.join(mainProcessDir, "transcript.json");
  const srtPath = path.join(mainProcessDir, "subtitles.srt");

  try {
    // Check if both files exist
    await Promise.all([fs.access(transcriptPath), fs.access(srtPath)]);

    // Read and validate transcript.json
    const transcriptContent = await fs.readFile(transcriptPath, "utf-8");
    const transcript = JSON.parse(transcriptContent);

    // Check if transcript has required content
    if (!transcript.segments?.length || !transcript.fullTranscript) {
      throw new Error("Invalid transcript content");
    }

    // Read and validate srt file
    const srtContent = await fs.readFile(srtPath, "utf-8");
    if (!srtContent.trim()) {
      throw new Error("Empty SRT file");
    }

    return { transcriptPath, srtPath };
  } catch (error) {
    return null;
  }
}
