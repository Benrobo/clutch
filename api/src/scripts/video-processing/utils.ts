import path from "path";
import { promises as fs } from "fs";
import shortUUID from "short-uuid";
import download from "download";

export const getProcessedDir = () => {
  const cwd = process.cwd();
  const dir = path.join(cwd, "public", "processed");
  return dir;
};

export const getDownloadedDir = () => {
  const cwd = process.cwd();
  const dir = path.join(cwd, "public", "downloaded-playback-videos");
  return dir;
};

export const checkVideoExists = async (
  videoName: string
): Promise<string | null> => {
  const dir = getDownloadedDir();
  const videoPath = path.join(dir, videoName);

  try {
    await fs.access(videoPath);
    return videoPath;
  } catch {
    return null;
  }
};

export const downloadPlaybackVideo = async (url: string, videoName: string) => {
  // Check if video already exists
  const existingVideoPath = await checkVideoExists(videoName);
  if (existingVideoPath) {
    console.log("Video already exists, skipping download");
    return existingVideoPath;
  }

  // https://mlb-cuts-diamond.mlb.com/FORGE/2024/2024-03/20/38ccdc46-1c5e1b20-f1855590-csvm-diamondx64-asset_1280x720_59_4000K.mp4
  const dir = getDownloadedDir();
  const videoPath = path.join(dir, videoName);
  const downloadedFile = await download(url, videoPath);

  await fs.writeFile(videoPath, downloadedFile);

  return videoPath;
};

/**
 * Creates a unique job directory for processing outputs
 */
export async function createJobFolder(inputPath: string): Promise<string> {
  const jobId = shortUUID.generate();
  const videoName = path.basename(inputPath, path.extname(inputPath));
  const jobDir = path.join(
    process.cwd(),
    "public",
    "processed",
    `${videoName}_${jobId}`
  );
  await fs.mkdir(jobDir, { recursive: true });
  return jobDir;
}

/**
 * Validates input file exists and has video extension
 */
export async function validateVideoInput(inputPath: string): Promise<void> {
  const validExtensions = [".mp4", ".mov", ".avi", ".mkv"];
  const ext = path.extname(inputPath).toLowerCase();

  if (!validExtensions.includes(ext)) {
    throw new Error(
      `Invalid video format: ${ext}. Supported formats: ${validExtensions.join(
        ", "
      )}`
    );
  }

  try {
    await fs.access(inputPath);
  } catch (error) {
    throw new Error(`Input file not found: ${inputPath}`);
  }
}

/**
 * Formats a timestamp in seconds to SRT format (HH:MM:SS,mmm)
 */
export function formatTimestampSRT(seconds: number): string {
  const date = new Date(seconds * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  const secs = date.getUTCSeconds().toString().padStart(2, "0");
  const ms = date.getUTCMilliseconds().toString().padStart(3, "0");
  return `${hours}:${minutes}:${secs},${ms}`;
}
