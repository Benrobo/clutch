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
} from "../scripts/video-processing/utils.js";
import { Prisma } from "@prisma/client";
import { DBPlaybackOutput } from "../types/game.types.js";
import extractAudio from "../scripts/video-processing/extractAudio.js";
import generateTranscript from "../scripts/video-processing/generateTranscript.js";
import { translateTranscript } from "../scripts/video-processing/translation.js";

const HIGHLIGHTS_VIDEO_PROCESSING_KEY = "highlights-video-processing";
const mlbApi = new MLBAPIHelper({
  season: TRACK_MLB_SEASON,
  sportId: 1,
});
const gameService = new GameService();

export const processGameHighlightsVideo = inngestClient.createFunction(
  { id: "process-highlights-video" },
  { event: "process-highlights-video" },
  async ({ step }) => {
    // processVideo();
  }
);

processVideo();

async function processVideo() {
  setTimeout(async () => {
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

    await processPlaybackVideo(playback!);
  }, 100);
}

async function processPlaybackVideo(playback: DBPlaybackOutput) {
  try {
    // const title = playback?.title.replace(/\s/g, "-").toLowerCase();
    const videoName = `${playback.id}.mp4`;

    console.log(
      `🔃 Processing video for [${playback?.title}]: ${playback?.mlb_video_duration}\n`
    );

    const videoInfo = await downloadPlaybackVideo(
      playback?.mlb_video_url,
      videoName
    );

    console.log(`✅ Video ready at: ${videoInfo.videoPath}`);
    console.log(`📁 File name: ${videoInfo.fileName}\n`);
    console.log(`🔃 Starting video processing for [${playback?.title}]`);

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

    if (!audioPath) {
      console.log(`❌ Failed to extract audio for [${playback?.title}]`);
      return;
    }

    // transcribe audio
    const transcriptOutput = await transcribeAudio(
      audioPath,
      mainProcessPath,
      playback?.id
    );

    // console.log({ transcriptOutput });
    const translation = await translateTranscript(
      transcriptOutput?.transcriptPath,
      "fr",
      playback?.id
    );

    // translate SRT and Transcript file.

    // convert downloaded video to audio
  } catch (e: any) {
    console.error(`❌ Error processing video for [${playback?.title}]:`, e);
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
    (playback) => playback.id === cachedProcessingVideo
  );
}

async function getNextPlaybackToProcess() {
  const highlightsPlaybacks = await gameService.getAllGameHighlightsPlayback();
  const processingVideo = await redis.get(HIGHLIGHTS_VIDEO_PROCESSING_KEY);

  if (!processingVideo) {
    const InitialPlayback = highlightsPlaybacks[0];
    if (InitialPlayback) {
      // store current processing highlight in cache
      // await redis.set(HIGHLIGHTS_VIDEO_PROCESSING_KEY, InitialPlayback.id);
      return InitialPlayback;
    }
  } else {
    const nextPlayback = highlightsPlaybacks.find(
      (playback) => playback.id !== processingVideo
    );
    if (nextPlayback) {
      // store current processing highlight in cache
      // await redis.set(HIGHLIGHTS_VIDEO_PROCESSING_KEY, nextPlayback.id);
      return nextPlayback;
    }
  }
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
