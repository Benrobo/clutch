import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs/promises";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const videoPathSamppleDir = path.join(PUBLIC_DIR, "video-samples");
const processedPath = path.join(PUBLIC_DIR, "processed");
const gridPath = path.join(processedPath, "grids");
const verticalPath = path.join(processedPath, "vertical");

const getAllVideoFiles = async () => {
  return [
    `${videoPathSamppleDir}/2.mp4`,
    // `${videoPathSamppleDir}/1.mp4`,
  ];
};

async function generateGrid(inputPath: string): Promise<string> {
  await fs.mkdir(gridPath, { recursive: true });

  const metadata: ffmpeg.FfprobeData = await new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata);
    });
  });

  const duration = Math.floor(metadata.format.duration!);
  const fps = 2;
  const totalFrames = duration * fps;
  const gridWidth = Math.floor(Math.sqrt(totalFrames));
  const gridHeight = Math.ceil(totalFrames / gridWidth);

  console.log(`Video duration: ${duration}s`);
  console.log(`Total frames at ${fps}fps: ${totalFrames}`);
  console.log(`Grid dimensions: ${gridWidth}x${gridHeight}`);

  const outputPath = path.join(gridPath, `${Date.now()}_montage.jpg`);

  // Generate grid
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .addOptions(["-thread_queue_size 512", "-max_muxing_queue_size 9999"])
      .videoFilter([
        `fps=${fps}`,
        `scale=658:370`,
        `drawtext=text='%{pts\\:hms}':fontsize=24:fontcolor=white:box=1:boxcolor=black@0.5:x=(w-text_w)/2:y=h-30`,
        `tile=${gridWidth}x${gridHeight}:padding=8:margin=16:color=black`,
      ])
      .outputOptions([
        "-frames:v 1",
        "-update 1",
        "-q:v 1",
        "-qmin 1",
        "-qmax 1",
        "-compression_level 0",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

async function convertTo916(inputPath: string): Promise<string> {
  await fs.mkdir(verticalPath, { recursive: true });
  const outputPath = path.join(verticalPath, `${Date.now()}_vertical.mp4`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .addOptions([
        "-thread_queue_size 512",
        "-max_muxing_queue_size 9999",
        "-threads 0", // Use all available CPU threads
      ])
      .videoFilters([
        // Optimize filters
        "crop=ih*0.5625:ih:iw/2-ih*0.5625/2:0",
        "scale=1080:1920:flags=fast_bilinear", // Faster scaling algorithm
      ])
      .outputOptions([
        "-c:v libx264",
        "-preset ultrafast", // Fastest encoding
        "-crf 23", // Slightly lower quality for speed
        "-tune fastdecode", // Optimize for fast decoding
        "-profile:v baseline", // Simpler profile, faster encoding
        "-level 3.0", // Compatible level
        "-pix_fmt yuv420p",
        "-movflags +faststart",
        "-af aresample=async=1000",
        "-strict experimental",
        "-g 1", // Reduce keyframe interval
        "-bf 0", // Disable B-frames for speed
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}

async function processVideo(
  inputPath: string
): Promise<{ gridPath: string; verticalPath: string }> {
  try {
    console.log("Generating grid...");
    const generatedGridPath = await generateGrid(inputPath);

    console.log("Converting to 9:16...");
    const generated916Path = await convertTo916(inputPath);

    console.log("Processing complete!");
    return {
      gridPath: generatedGridPath,
      verticalPath: generated916Path,
    };
  } catch (error) {
    console.error("Error processing video:", error);
    throw error;
  }
}

// Run the processor
(async () => {
  try {
    const files = await getAllVideoFiles();
    for (const file of files) {
      console.log(`Processing ${file}...`);
      const { gridPath: outputGridPath, verticalPath: outputVerticalPath } =
        await processVideo(file);
      console.log(`Finished processing ${file}`);
      console.log(`Grid output: ${outputGridPath}`);
      console.log(`Vertical video output: ${outputVerticalPath}`);
    }
  } catch (error) {
    console.error("Error processing videos:", error);
    process.exit(1);
  }
})();
