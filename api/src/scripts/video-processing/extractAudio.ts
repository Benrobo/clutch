import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";

/**
 * Extracts audio from a video file
 * @param inputPath Path to input video file
 * @param outputPath Path where audio file should be saved
 * @returns Promise that resolves when audio extraction is complete
 */
export default async function extractAudio(
  inputPath: string,
  outputPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat("mp3")
      .outputOptions(["-ac", "2", "-ar", "44100", "-b:a", "192k"])
      .on("start", (cmd) => {
        console.log("Started ffmpeg with command:", cmd);
      })
      .on("end", () => {
        console.log("Audio extraction completed");
        resolve();
      })
      .on("error", (err) => {
        console.error("Error extracting audio:", err);
        reject(err);
      })
      .save(outputPath);
  });

  // Verify the file was created
  await fs.access(outputPath);
}
