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
  downloadPlaybackVideo,
  getProcessedDir,
} from "../scripts/video-processing/utils.js";
import { Prisma } from "@prisma/client";
import { DBPlaybackOutput } from "../types/game.types.js";

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

    await processPlaybackVideo(playback!);
  }, 100);
}

async function processPlaybackVideo(playback: DBPlaybackOutput) {
  try {
    const title = playback.title.replace(/\s/g, "-").toLowerCase();
    const videoName = `${title}_${playback.id}`;

    console.log(
      `🔃 Processing video for [${playback?.title}]: ${playback?.mlb_video_duration}\n`
    );

    const downloadedVideoPath = await downloadPlaybackVideo(
      playback?.mlb_video_url,
      videoName
    );

    console.log(`✅ Video ready at: ${downloadedVideoPath}`);
    console.log(`🔃 Starting video processing for [${playback?.title}]`);
  } catch (e: any) {
    console.error(`❌ Error processing video for [${playback?.title}]:`, e);
    throw e;
  }
}

async function checkVideoProcessingStatus() {
  const cachedProcessingVideo = await redis.get(
    HIGHLIGHTS_VIDEO_PROCESSING_KEY
  );
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
      await redis.set(HIGHLIGHTS_VIDEO_PROCESSING_KEY, InitialPlayback.id);
      return InitialPlayback;
    }
  } else {
    const nextPlayback = highlightsPlaybacks.find(
      (playback) => playback.id !== processingVideo
    );
    if (nextPlayback) {
      // store current processing highlight in cache
      await redis.set(HIGHLIGHTS_VIDEO_PROCESSING_KEY, nextPlayback.id);
      return nextPlayback;
    }
  }
}
