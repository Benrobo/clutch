import path from "path";
import { promises as fs } from "fs";
import shortUUID from "short-uuid";

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
