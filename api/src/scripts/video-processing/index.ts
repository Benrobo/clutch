import path from "path";
import { ProcessVideoResult, ProcessingOptions } from "./types.js";
import extractAudio from "./extractAudio.js";
import generateTranscript from "./generateTranscript.js";
import cropVideoToVertical from "./cropVideoToVertical.js";
import { createJobFolder, validateVideoInput } from "./utils.js";

export * from "./types.js";

/**
 * Main video processing function that coordinates the entire workflow
 */
export async function processVideo(
  inputPath: string,
  options: ProcessingOptions = {}
): Promise<ProcessVideoResult> {
  try {
    // Validate input
    await validateVideoInput(inputPath);

    // Create job directory
    console.log("Creating job folder...");
    const jobDir = await createJobFolder(inputPath);
    console.log("Job directory:", jobDir);

    // Step 1: Extract audio
    console.log("Extracting audio...");
    const audioPath = path.join(jobDir, "audio.mp3");
    await extractAudio(inputPath, audioPath);
    console.log("Audio extracted to:", audioPath);

    // Step 2: Generate transcript
    console.log("Generating transcript...");
    const { transcriptPath, srtPath } = await generateTranscript(
      audioPath,
      jobDir
    );
    console.log("Transcripts saved to:", transcriptPath);

    // Step 3: Crop video to vertical
    console.log("Cropping video to vertical format...");
    const verticalPath = path.join(jobDir, "vertical.mp4");
    await cropVideoToVertical(inputPath, verticalPath);
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

// Export all functions for individual use
export { generateSRT } from "./generateSRT.js";
export { createJobFolder, validateVideoInput } from "./utils.js";
