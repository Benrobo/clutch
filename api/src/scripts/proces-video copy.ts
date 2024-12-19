import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const videoPathSamppleDir = path.join(PUBLIC_DIR, "video-samples");
const processedPath = path.join(PUBLIC_DIR, "processed", "frames");

const getAllVideoFiles = async () => {
  return [
    // `${videoPathSamppleDir}/2.mp4`,
    `${videoPathSamppleDir}/1.mp4`,
  ];
};

async function processVideo(inputPath: string) {
  await fs.mkdir(processedPath, { recursive: true });

  // Get video metadata using ffprobe
  const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });

  // Calculate grid dimensions
  const duration = Math.floor(metadata.format.duration!);
  const fps = 2; // Reduced from 5 to 2 frames per second for longer videos
  const totalFrames = duration * fps;
  // Make grid as square as possible: sqrt(100) = 10x10 grid for 100 frames
  const gridWidth = Math.floor(Math.sqrt(totalFrames));
  const gridHeight = Math.ceil(totalFrames / gridWidth);

  console.log(`Video duration: ${duration}s`);
  console.log(`Total frames at ${fps}fps: ${totalFrames}`);
  console.log(`Grid dimensions: ${gridWidth}x${gridHeight}`);

  const outputPath = path.join(processedPath, `${Date.now()}_montage.jpg`);

  // Process video
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .addOptions([
        // Add memory-related options
        "-thread_queue_size 512",
        "-max_muxing_queue_size 9999",
      ])
      .videoFilter([
        // Step 1: Frame Extraction
        `fps=${fps}`, // Extract frames at 2fps (1 frame every 500ms)

        // Step 2: Frame Sizing
        // Scale each frame to 658x370 (16:9 ratio)
        // Larger size helps preserve details and text in the video
        `scale=658:370`,

        // Step 3: Timestamp Overlay
        // Add timestamp to each frame with these properties:
        // - text='%{pts\\:hms}' : Show time in HH:MM:SS.mmm format
        // - fontsize=24        : Large enough to be readable
        // - fontcolor=white    : White text for visibility
        // - box=1              : Add background box behind text
        // - boxcolor=black@0.5 : Semi-transparent black background
        // - x=(w-text_w)/2     : Center text horizontally
        // - y=h-30            : Position 30 pixels from bottom
        `drawtext=text='%{pts\\:hms}':fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=h-30`,

        // Step 4: Grid Creation
        // Arrange all frames in a grid with these properties:
        // - ${gridWidth}x${gridHeight} : Grid dimensions
        // - padding=8    : 8px space between frames
        // - margin=16   : 16px space around entire grid
        // - color=black : Black background
        `tile=${gridWidth}x${gridHeight}:padding=8:margin=16:color=black`,
      ])
      .outputOptions([
        // Output Control
        "-frames:v 1", // Generate single output image
        "-update 1", // Allow overwriting output file

        // Quality Settings
        "-q:v 1", // Highest quality (1 is best, 31 is worst)
        "-qmin 1", // Force minimum quality to highest
        "-qmax 1", // Force maximum quality to highest
        "-compression_level 0", // Minimal compression for best quality
      ])
      .output(outputPath)
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

// Run the processor
(async () => {
  try {
    const files = await getAllVideoFiles();
    for (const file of files) {
      console.log(`Processing ${file}...`);
      await processVideo(file);
      console.log(`Finished processing ${file}`);
    }
  } catch (error) {
    console.error("Error processing videos:", error);
    process.exit(1);
  }
})();
