import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";
import { createReadStream } from "fs";
import readline from "readline";

/**
 * Represents a detected scene in the video with its metadata
 * @interface SceneInfo
 * @property {number} frameNumber - The sequential number of the frame in the video
 * @property {number} timestamp - Time in seconds from the start of the video
 * @property {string} timecode - SMPTE timecode format (HH:MM:SS:FF)
 * @property {number[]} mean - Average RGB values [red, green, blue] for the frame
 * @property {number[]} stddev - Standard deviation of RGB values, indicating color variation
 * @property {string} type - Frame type ('I' for keyframe, 'P' for predicted frame)
 */
interface SceneInfo {
  frameNumber: number;
  timestamp: number;
  timecode: string;
  mean: number[];
  stddev: number[];
  type: string;
}

/**
 * Ensures the logs directory exists, creating it if necessary
 * @returns {Promise<string>} Path to the logs directory
 */
async function ensureLogsDirectory() {
  const logsDir = path.join(process.cwd(), "src", "scripts", "logs");
  try {
    await fs.access(logsDir);
  } catch {
    await fs.mkdir(logsDir, { recursive: true });
  }
  return logsDir;
}

/**
 * Parses the FFmpeg scene detection output to extract frame information
 * The parser looks for lines containing "[Parsed_showinfo_1" which contain frame metadata
 *
 * @param {string} logPath - Path to the FFmpeg output log file
 * @returns {Promise<SceneInfo[]>} Array of detected scenes with their metadata
 *
 * Example FFmpeg output line:
 * [Parsed_showinfo_1 @ 0x7f8b9f40bc00] n:   5 pts:   17600917 pts_time:17.600917 type:I mean:[137 116 129] stdev:[47.8 12.1 10.9]
 * [Parsed_showinfo_1 @ 0x7f8b9f40bc00] timecode - 00:00:17:34
 */
async function parseSceneOutput(logPath: string): Promise<SceneInfo[]> {
  const scenes: SceneInfo[] = [];
  let currentScene: Partial<SceneInfo> = {};

  const fileStream = createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.includes("[Parsed_showinfo_1")) {
      // Extract frame information using regex patterns
      if (line.includes("n:")) {
        const frameMatch = line.match(/n:\s+(\d+)/); // Frame number
        const ptsMatch = line.match(/pts_time:(\d+\.\d+)/); // Timestamp
        const typeMatch = line.match(/type:([IP])/); // Frame type
        const meanMatch = line.match(/mean:\[(\d+)\s+(\d+)\s+(\d+)\]/); // RGB means
        const stdMatch = line.match(
          /stdev:\[([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\]/
        ); // RGB standard deviations

        if (frameMatch && ptsMatch && typeMatch && meanMatch && stdMatch) {
          currentScene = {
            frameNumber: parseInt(frameMatch[1]),
            timestamp: parseFloat(ptsMatch[1]),
            type: typeMatch[1],
            mean: [
              parseInt(meanMatch[1]), // Red mean
              parseInt(meanMatch[2]), // Green mean
              parseInt(meanMatch[3]), // Blue mean
            ],
            stddev: [
              parseFloat(stdMatch[1]), // Red standard deviation
              parseFloat(stdMatch[2]), // Green standard deviation
              parseFloat(stdMatch[3]), // Blue standard deviation
            ],
          };
        }
      }
      // Extract SMPTE timecode if present
      if (line.includes("timecode") && currentScene) {
        const timecodeMatch = line.match(/timecode - ([\d:]+)/);
        if (timecodeMatch) {
          currentScene.timecode = timecodeMatch[1];
          // Only save I-frames as scene changes since they represent key frames
          if (currentScene.type === "I") {
            scenes.push(currentScene as SceneInfo);
          }
          currentScene = {};
        }
      }
    }
  }

  return scenes;
}

/**
 * Detects scenes in a video using FFmpeg's scene detection filter
 * Uses the following FFmpeg configuration:
 * - select=gt(scene\\,0.4): Detects scene changes with threshold 0.3 (0-1 scale)
 * - showinfo: Outputs detailed frame information including RGB values
 *
 * @param {string} inputPath - Path to the input video file
 * @returns {Promise<SceneInfo[]>} Array of detected scenes with their metadata
 */
async function detectScenes(inputPath: string): Promise<SceneInfo[]> {
  const logsDir = await ensureLogsDirectory();
  const timestamp = Date.now();
  const videoName = path.basename(inputPath, path.extname(inputPath));
  const ThreshHold = 0.05;

  return new Promise((resolve, reject) => {
    const scenes: SceneInfo[] = [];
    let currentScene: Partial<SceneInfo> = {};

    // First, get the intro scene (first 5 seconds)
    ffmpeg(inputPath)
      .addOptions([
        "-ss",
        "0", // Start from beginning
        "-t",
        "0.1", // Get first frame
        "-vf",
        "showinfo",
        "-f",
        "null",
      ])
      .on("stderr", (stderrLine) => {
        if (stderrLine.includes("[Parsed_showinfo_0")) {
          if (stderrLine.includes("n:")) {
            const frameMatch = stderrLine.match(/n:\s+(\d+)/);
            const ptsMatch = stderrLine.match(/pts_time:(\d+\.\d+)/);
            const meanMatch = stderrLine.match(
              /mean:\[(\d+)\s+(\d+)\s+(\d+)\]/
            );
            const stdMatch = stderrLine.match(
              /stdev:\[([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\]/
            );

            if (frameMatch && meanMatch && stdMatch) {
              scenes.push({
                frameNumber: parseInt(frameMatch[1]),
                timestamp: 0,
                timecode: "00:00:00:00",
                type: "I",
                mean: [
                  parseInt(meanMatch[1]),
                  parseInt(meanMatch[2]),
                  parseInt(meanMatch[3]),
                ],
                stddev: [
                  parseFloat(stdMatch[1]),
                  parseFloat(stdMatch[2]),
                  parseFloat(stdMatch[3]),
                ],
              } as SceneInfo);
            }
          }
        }
      })
      .on("end", () => {
        // Now detect the rest of the scenes
        ffmpeg(inputPath)
          .addOptions([
            "-vf",
            `select=gt(scene\\,${ThreshHold}),showinfo`,
            "-f",
            "null",
          ])
          .on("stderr", (stderrLine) => {
            if (stderrLine.includes("[Parsed_showinfo_1")) {
              if (stderrLine.includes("n:")) {
                const frameMatch = stderrLine.match(/n:\s+(\d+)/);
                const ptsMatch = stderrLine.match(/pts_time:(\d+\.\d+)/);
                const typeMatch = stderrLine.match(/type:([IP])/);
                const meanMatch = stderrLine.match(
                  /mean:\[(\d+)\s+(\d+)\s+(\d+)\]/
                );
                const stdMatch = stderrLine.match(
                  /stdev:\[([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\]/
                );

                if (
                  frameMatch &&
                  ptsMatch &&
                  typeMatch &&
                  meanMatch &&
                  stdMatch
                ) {
                  currentScene = {
                    frameNumber: parseInt(frameMatch[1]),
                    timestamp: parseFloat(ptsMatch[1]),
                    type: typeMatch[1],
                    mean: [
                      parseInt(meanMatch[1]),
                      parseInt(meanMatch[2]),
                      parseInt(meanMatch[3]),
                    ],
                    stddev: [
                      parseFloat(stdMatch[1]),
                      parseFloat(stdMatch[2]),
                      parseFloat(stdMatch[3]),
                    ],
                  };
                }
              }
              if (stderrLine.includes("timecode") && currentScene) {
                const timecodeMatch = stderrLine.match(/timecode - ([\d:]+)/);
                if (timecodeMatch) {
                  currentScene.timecode = timecodeMatch[1];
                  if (
                    currentScene.type === "I" &&
                    // @ts-expect-error
                    currentScene?.timestamp > 0.1
                  ) {
                    scenes.push(currentScene as SceneInfo);
                  }
                  currentScene = {};
                }
              }
            }
          })
          .on("error", (err) => {
            console.error("FFmpeg Error:", err.message);
            reject(err);
          })
          .on("end", () => {
            console.log(
              `Scene detection complete. Found ${scenes.length} scenes.`
            );
            resolve(scenes);
          })
          .save("pipe:1");
      })
      .on("error", (err) => {
        console.error("FFmpeg Error:", err.message);
        reject(err);
      })
      .save("pipe:1");
  });
}

/**
 * Configuration for video scene extraction
 * @interface SceneExtractionConfig
 * @property {number} preBufferSeconds - Seconds to include before the scene
 * @property {number} postBufferSeconds - Seconds to include after the scene
 * @property {string} outputDir - Directory to save extracted scenes
 */
interface SceneExtractionConfig {
  preBufferSeconds: number;
  postBufferSeconds: number;
  outputDir: string;
}

/**
 * Converts seconds to SMPTE timecode (HH:MM:SS:FF)
 * @param {number} seconds - Time in seconds
 * @returns {string} SMPTE timecode
 */
function secondsToTimecode(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30); // Assuming 30fps

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Extracts video clips for each detected scene with configurable buffers
 * @param {string} inputPath - Path to the input video
 * @param {SceneInfo[]} scenes - Detected scenes
 * @param {SceneExtractionConfig} config - Configuration for extraction
 * @returns {Promise<string[]>} Paths to extracted video clips
 */
async function extractScenes(
  inputPath: string,
  scenes: SceneInfo[],
  config: SceneExtractionConfig
): Promise<string[]> {
  const outputPaths: string[] = [];
  const videoName = path.basename(inputPath, path.extname(inputPath));
  const timestamp = Date.now();

  // Create a unique folder for this processing run
  const processingDir = path.join(
    config.outputDir,
    `${videoName}_${timestamp}`
  );
  await fs.mkdir(processingDir, { recursive: true });

  // TikTok dimensions
  const OUTPUT_WIDTH = 1080;
  const OUTPUT_HEIGHT = 1920;

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const nextScene = scenes[i + 1];
    const outputFile = `scene${String(i).padStart(3, "0")}.mp4`;
    const outputPath = path.join(processingDir, outputFile);

    // Calculate scene duration
    const startTime = Math.max(0, scene.timestamp - config.preBufferSeconds);
    const endTime = nextScene
      ? Math.min(
          nextScene.timestamp + config.postBufferSeconds,
          scene.timestamp + config.postBufferSeconds + 10
        )
      : scene.timestamp + config.postBufferSeconds + 10;

    const duration = endTime - startTime;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-ss",
          startTime.toString(),
          "-t",
          duration.toString(),
          "-c:v",
          "libx264",
          "-preset",
          "ultrafast", // Fastest encoding
          "-tune",
          "fastdecode", // Optimize for fast decoding
          "-crf",
          "28", // Slightly lower quality for faster encoding
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-threads",
          "0", // Use all available CPU threads
          "-vf",
          `scale=-2:${OUTPUT_HEIGHT},crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(iw-${OUTPUT_WIDTH})/2:0`,
          "-movflags",
          "+faststart",
        ])
        .on("end", () => {
          console.log(`Extracted scene ${i} to ${outputPath}`);
          outputPaths.push(outputPath);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error extracting scene ${i}:`, err);
          reject(err);
        })
        .save(outputPath);
    });
  }

  // Save metadata
  const metadataPath = path.join(processingDir, "scenes_metadata.json");
  const metadata = scenes.map((scene, index) => ({
    sceneFile: `scene${index.toString().padStart(3, "0")}.mp4`,
    timestamp: scene.timestamp,
    timecode: scene.timecode,
    duration: 10,
  }));

  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Scene metadata saved to ${metadataPath}`);

  return outputPaths;
}

/**
 * Calculate scene importance score based on visual characteristics
 */
function calculateSceneScore(scene: SceneInfo): number {
  const stddevScore = Math.max(...scene.stddev);
  const brightnessScore = (scene.mean[0] + scene.mean[1] + scene.mean[2]) / 3;
  return stddevScore * brightnessScore;
}

/**
 * Merges scenes that are too close together to avoid overlapping clips
 * @param {SceneInfo[]} scenes - Original detected scenes
 * @param {number} minSceneGap - Minimum seconds between scenes
 * @returns {SceneInfo[]} Merged scenes
 */
function mergeCloseScenes(
  scenes: SceneInfo[],
  minSceneGap: number
): SceneInfo[] {
  if (scenes.length <= 1) return scenes;

  const mergedScenes: SceneInfo[] = [];
  let currentScene = scenes[0];

  for (let i = 1; i < scenes.length; i++) {
    const nextScene = scenes[i];
    const isEarlyScene = currentScene.timestamp < 10; // First 10 seconds

    // Use a smaller gap for early scenes to preserve intro
    const effectiveGap = isEarlyScene ? minSceneGap * 0.5 : minSceneGap;

    // If gap is too small, keep the more significant scene
    if (nextScene.timestamp - currentScene.timestamp < effectiveGap) {
      const currentScore = calculateSceneScore(currentScene);
      const nextScore = calculateSceneScore(nextScene);

      if (nextScore > currentScore) {
        currentScene = nextScene;
      }
    } else {
      mergedScenes.push(currentScene);
      currentScene = nextScene;
    }
  }

  mergedScenes.push(currentScene);
  return mergedScenes;
}

/**
 * Joins video clips with fade transitions into a single video
 * @param {string[]} clipPaths - Array of paths to video clips
 * @param {string} outputDir - Directory to save the final video
 * @returns {Promise<string>} Path to the final video
 */
async function joinClipsWithTransitions(
  clipPaths: string[],
  outputDir: string
): Promise<string> {
  const outputPath = path.join(outputDir, "final_tiktok.mp4");

  // If there's only one clip, just copy it
  if (clipPaths.length === 1) {
    return new Promise<string>((resolve, reject) => {
      ffmpeg(clipPaths[0])
        .outputOptions(["-c", "copy", "-movflags", "+faststart"])
        .on("end", () => {
          console.log(`Final video created at ${outputPath}`);
          resolve(outputPath);
        })
        .on("error", (err) => {
          console.error("Error creating final video:", err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }

  // Create a temporary file listing all inputs
  const concatFilePath = path.join(outputDir, "concat_list.txt");
  const concatContent = clipPaths.map((p) => `file '${p}'`).join("\n");

  await fs.writeFile(concatFilePath, concatContent);

  return new Promise<string>((resolve, reject) => {
    const command = ffmpeg();

    // command
    //   .input(concatFilePath)
    //   .inputOptions(["-f", "concat", "-safe", "0"])
    //   .outputOptions([
    //     "-map",
    //     "[outv]",
    //     "-map",
    //     "[outa]",
    //     "-c:v",
    //     "copy", // Use stream copy instead of re-encoding
    //     "-c:a",
    //     "copy", // Use stream copy for audio too
    //     "-movflags",
    //     "+faststart",
    //   ])
    command
      .input(concatFilePath)
      .inputOptions(["-f", "concat", "-safe", "0"])
      .outputOptions([
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-tune",
        "fastdecode",
        "-crf",
        "28",
        "-threads",
        "0",
        "-movflags",
        "+faststart",
      ])
      .on("start", (commandLine) => {
        console.log("FFmpeg command:", commandLine);
      })
      .on("progress", (progress) => {
        console.log(
          `Processing: ${Math.floor(progress?.percent as any)}% done`
        );
      })
      .on("end", async () => {
        // Clean up concat file
        try {
          await fs.unlink(concatFilePath);
        } catch (err) {
          console.warn("Failed to delete concat file:", err);
        }
        console.log(`Final video created at ${outputPath}`);
        resolve(outputPath);
      })
      .on("error", async (err) => {
        // Clean up concat file on error too
        try {
          await fs.unlink(concatFilePath);
        } catch (unlinkErr) {
          console.warn("Failed to delete concat file:", unlinkErr);
        }
        console.error("Error creating final video:", err.message);
        reject(err);
      })
      .save(outputPath);
  });
}

/**
 * Process video to detect and extract scenes
 * @param {string} inputPath - Path to input video
 * @param {SceneExtractionConfig} config - Configuration for scene extraction
 */
async function processVideo(inputPath: string, config: SceneExtractionConfig) {
  try {
    // Detect scenes directly without saving to file
    const scenes = await detectScenes(inputPath);

    // Merge scenes that are too close together
    const minSceneGap = config.preBufferSeconds + config.postBufferSeconds + 5;
    const mergedScenes = mergeCloseScenes(scenes, minSceneGap);

    console.log(
      `Found ${scenes.length} scenes, merged into ${mergedScenes.length} distinct scenes`
    );

    // Extract video clips for each merged scene
    const clipPaths = await extractScenes(inputPath, mergedScenes, config);

    console.log("Video processing complete!");
    console.log(`Extracted ${clipPaths.length} scenes:`);
    clipPaths.forEach((path, i) => {
      console.log(`Scene ${i + 1}: ${path}`);
    });

    // Join all clips with transitions
    console.log("Creating final video with transitions...");
    const finalVideoPath = await joinClipsWithTransitions(
      clipPaths,
      path.dirname(clipPaths[0]) // Use the same directory as the clips
    );
    console.log(`Final video created at: ${finalVideoPath}`);

    // Save merged scenes for reference
    const mergedScenesPath = path.join(
      config.outputDir,
      `${path.basename(inputPath, path.extname(inputPath))}_merged_scenes.json`
    );
    await fs.writeFile(mergedScenesPath, JSON.stringify(mergedScenes, null, 2));
    console.log(`Merged scenes saved to ${mergedScenesPath}`);
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // const existingClipsDir = "1_1734488507770";
    const existingClipsDir = null;

    if (existingClipsDir) {
      // Process existing clips from the specified directory
      const clipsDir = path.join(
        process.cwd(),
        "src",
        "scripts",
        "clips",
        existingClipsDir
      );

      // Get all MP4 files in the directory
      const files = await fs.readdir(clipsDir);
      console.log("All files in directory:", files);

      const sceneFiles = files
        .filter((file) => file.endsWith(".mp4") && file !== "final_tiktok.mp4")
        .sort() // Sort to ensure consistent order
        .map((file) => path.join(clipsDir, file));

      console.log("Processing existing clips from:", clipsDir);
      console.log("Found scenes:", sceneFiles);

      // Verify all files exist
      for (const file of sceneFiles) {
        try {
          await fs.access(file);
          const stats = await fs.stat(file);
          console.log(`File ${file} exists with size ${stats.size} bytes`);
        } catch (err) {
          console.error(`Error accessing file ${file}:`, err);
        }
      }

      if (sceneFiles.length === 0) {
        throw new Error(
          "No valid scene files found in the specified directory"
        );
      }

      // Join the clips with transitions
      const finalPath = await joinClipsWithTransitions(sceneFiles, clipsDir);
      console.log("Final video created at:", finalPath);
    } else {
      // Process new video
      const videoPath = path.join(
        process.cwd(),
        "public",
        "video-samples",
        "2.mp4"
      );
      console.log("Video path:", videoPath);

      // Check if video exists
      await fs.access(videoPath);
      console.log("Video file exists, proceeding with detection");

      const config: SceneExtractionConfig = {
        preBufferSeconds: 3,
        postBufferSeconds: 7,
        outputDir: path.join(process.cwd(), "src", "scripts", "clips"),
      };

      await processVideo(videoPath, config);
    }
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

// Run the main function
main();
