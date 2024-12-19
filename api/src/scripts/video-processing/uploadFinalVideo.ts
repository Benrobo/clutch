import MediaService from "../../services/media.service.js";
import { promises as fs } from "fs";

interface UploadResult {
  gcsUri: string;
  downloadUrl: string;
}

// REMEMBER TO STORE THE FILE NAME AS {GAME_ID}-{PLAYER_ID}-{RANDOM_UUID}

/**
 * Upload final generated vertical video to firebase and return GCS URI & download URL
 * @param finalVideoPath Path to the video file to upload
 * @returns Promise containing the GCS URI and download URL
 */
export default async function uploadFinalVideo(
  finalVideoPath: string
): Promise<UploadResult> {
  const fileExist = await checkVideoExists(finalVideoPath);
  if (!fileExist) {
    throw new Error("Video file does not exist");
  }

  try {
    const mediaService = new MediaService();
    // Upload the video file
    const gcsUri = await mediaService.uploadFile(
      finalVideoPath,
      "highlights-videos",
      "video/mp4"
    );

    // Get the download URL
    const downloadUrl = await mediaService.getDownloadUrl(gcsUri);

    return {
      gcsUri,
      downloadUrl,
    };
  } catch (error) {
    console.error("Error uploading video:", error);
    throw error;
  }
}

const checkVideoExists = async (videoPath: string): Promise<boolean> => {
  try {
    await fs.access(videoPath);
    return true;
  } catch (error) {
    return false;
  }
};
