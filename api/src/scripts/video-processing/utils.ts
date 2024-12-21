import path from "path";
import { promises as fs } from "fs";
import shortUUID from "short-uuid";
import download from "download";

interface VideoPathInfo {
  videoPath: string;
  fileName: string;
}

export const getProcessedDir = async () => {
  const cwd = process.cwd();
  const dir = path.join(cwd, "public", "processed");
  try {
    await fs.access(dir);
    return dir;
  } catch (e: any) {
    await fs.mkdir(dir, { recursive: true });
    return dir;
  }
};

const sanitizeFileName = (fileName: string): string => {
  return (
    fileName
      .replace(/['"]/g, "") // Remove quotes
      .replace(/[']/g, "") // Remove apostrophes
      // .replace(/[^a-zA-Z0-9-_]/g, "-") // Replace other special chars with hyphen
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .toLowerCase()
  );
};

export const getDownloadedDir = () => {
  const cwd = process.cwd();
  const dir = path.join(cwd, "public", "downloaded-playback-videos");
  // Ensure directory exists
  fs.mkdir(dir, { recursive: true }).catch(() => {});
  return dir;
};

const findVideoInDirectory = async (
  dirPath: string
): Promise<string | null> => {
  console.log(dirPath);
  try {
    const files = await fs.readdir(dirPath);

    console.log({ files });
    const videoFile = files.find((file) => file.endsWith(".mp4"));
    return videoFile ? path.join(dirPath, videoFile) : null;
  } catch {
    return null;
  }
};

export const checkVideoExists = async (
  videoName: string
): Promise<VideoPathInfo | null> => {
  const dir = getDownloadedDir();
  const basePath = path.join(dir, videoName.replace(".mp4", ""));
  const videoPath = basePath + ".mp4";

  try {
    await fs.access(videoPath);
    return {
      videoPath,
      fileName: path.basename(videoPath),
    };
  } catch (e: any) {
    console.log(`Video not found: ${videoPath}`);
    return null;
  }
};

export const downloadPlaybackVideo = async (
  url: string,
  videoName: string
): Promise<VideoPathInfo> => {
  const fileName = videoName.includes(".mp4") ? videoName : `${videoName}.mp4`;
  const existingVideo = await checkVideoExists(fileName);

  if (existingVideo) {
    console.log("Video already exists, skipping download");
    return existingVideo;
  }

  const dir = getDownloadedDir();
  const videoPath = path.join(dir, fileName);
  await download(url, dir, {
    filename: fileName,
  });

  return {
    videoPath,
    fileName,
  };
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

export async function createProcessingFolder(pathName: string) {
  const processDir = await getProcessedDir();
  const jobDir = path.join(processDir, pathName);
  try {
    await fs.access(jobDir);
    return jobDir;
  } catch {
    await fs.mkdir(jobDir, { recursive: true });
    return jobDir;
  }
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
