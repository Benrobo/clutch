import ffmpeg from "fluent-ffmpeg";
import { promises as fs } from "fs";

/**
 * Crops and scales video to vertical 9:16 format
 */
export default async function cropVideoToVertical(
  inputPath: string,
  outputPath: string
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
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

  // Verify the file was created
  await fs.access(outputPath);
}
