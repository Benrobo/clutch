// generate a thumbnail 9:16 ratio for highlights
// thumbnail should be 5-7sec into the video (this should be based on the timestamps)
// upload thumbnail to firebase using media service present.

import ffmpeg from "fluent-ffmpeg";
import path from "path";
import MediaService from "../../services/media.service.js";

interface ThumbnailOutput {
  thumbnailPath: string;
  thumbnailUrl: string | null;
}

export default async function generateThumbnail(
  videoPath: string,
  outputDir: string,
  playbackId: string
): Promise<ThumbnailOutput> {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(outputDir, `${playbackId}-thumbnail.jpg`);

    ffmpeg(videoPath)
      .seekInput(5)
      .outputOptions([
        // First detect the most interesting region
        "-vf cropdetect=24:16:0,scale=-1:1920,crop=1080:1920:(in_w-1080)/2:0",
      ])
      .frames(1)
      .output(thumbnailPath)
      .on("end", async () => {
        try {
          // Upload to Firebase
          const mediaService = new MediaService();
          const gcsUri = await mediaService.uploadFile(
            thumbnailPath,
            "thumbnails",
            "image/jpeg"
          );

          // Get the download URL
          const downloadUrl = await mediaService.getDownloadUrl(gcsUri);

          resolve({
            thumbnailPath,
            thumbnailUrl: downloadUrl,
          });
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (err) => {
        reject(err);
      })
      .run(); // Execute the command immediately
  });
}
