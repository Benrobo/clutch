import { storage } from "../config/firebase.js";
import env from "../config/env.js";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "crypto";
import * as path from "path";

export default class MediaService {
  /**
   * Uploads a file to Firebase Storage and makes it publicly accessible
   * @param filePath Local path to the file
   * @param directory Directory in storage (e.g., 'audio-chunks', 'videos')
   * @param contentType MIME type of the file
   * @returns GCS URI of the uploaded file
   */
  private async checkFileExists(fileName: string): Promise<string | null> {
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: fileName,
      });

      const existingFile = files.find((file) => file.name.includes(fileName));
      if (existingFile) {
        await existingFile.makePublic();
        return `gs://${env.FIREBASE.STORAGE_BUCKET}/${existingFile.name}`;
      }

      return null;
    } catch (error) {
      console.error("Error checking file existence:", error);
      return null;
    }
  }

  async uploadFile(
    filePath: string,
    directory: string,
    contentType: string
  ): Promise<string> {
    const baseFileName = path.basename(filePath);

    // Check if file already exists
    const existingFileUrl = await this.checkFileExists(baseFileName);
    if (existingFileUrl) {
      console.log(`File ${baseFileName} already exists, skipping upload`);
      return existingFileUrl;
    }

    const fileHash = createHash("md5").update(filePath).digest("hex");
    const fileName = `${directory}/${baseFileName}`;
    const bucket = storage.bucket();
    const file = bucket.file(fileName);

    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: fileHash,
      },
      contentType: contentType,
      cacheControl: "public, max-age=31536000",
    };

    // Upload the file
    await bucket.upload(filePath, {
      destination: fileName,
      metadata: metadata,
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Return GCS URI format for Google Cloud Speech-to-Text
    return `gs://${env.FIREBASE.STORAGE_BUCKET}/${fileName}`;
  }

  /**
   * Gets the download URL for a file
   * @param gcsUri GCS URI of the file
   * @returns Public download URL
   */
  async getDownloadUrl(gcsUri: string): Promise<string> {
    const fileName = gcsUri.replace(`gs://${env.FIREBASE.STORAGE_BUCKET}/`, "");
    const file = storage.bucket().file(fileName);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    });
    return url;
  }

  /**
   * Uploads an audio chunk for transcription
   * @param chunkPath Path to audio chunk
   * @returns GCS URI of uploaded audio chunk
   */
  async uploadAudioChunk(chunkPath: string): Promise<string> {
    return this.uploadFile(chunkPath, "audio-chunks", "audio/mp3");
  }

  /**
   * Deletes a file from storage
   * @param gcsUri GCS URI of the file to delete
   */
  async deleteFile(gcsUri: string): Promise<void> {
    const fileName = gcsUri.replace(`gs://${env.FIREBASE.STORAGE_BUCKET}/`, "");
    const file = storage.bucket().file(fileName);
    await file.delete();
  }
}
