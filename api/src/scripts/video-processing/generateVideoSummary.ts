import MediaService from "../../services/media.service.js";
import Gemini from "../../helpers/gemini.helper.js";
import retry from "async-retry";
import logger from "../../lib/logger.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  FileMetadataResponse,
  GoogleAIFileManager,
} from "@google/generative-ai/server";
import env from "../../config/env.js";
import * as path from "path";

export interface PlaySummary {
  score: string;
  inning: string;
  count: string;
  summary: string;
  highlight: string;
  stats: {
    pitchSpeed?: string;
    exitVelocity?: string;
    distance?: string;
    time?: string;
  };
}

/**
 * Generates a detailed summary of a baseball play from a video
 */
export default async function generateVideoSummary(
  videoPath: string
): Promise<PlaySummary> {
  try {
    logger.info("Uploading video for summary generation...");

    // Initialize Gemini with shared API key
    const apiKey = env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Get filename for display
    const filename = path.basename(videoPath);

    // Check if file already exists
    let file: FileMetadataResponse | null = null;
    try {
      const files = await fileManager.listFiles();
      const existingFile = files.files?.find((f) => f.displayName === filename);
      if (existingFile && existingFile.state === "ACTIVE") {
        logger.info(`Found existing file: ${existingFile.name}`);
        file = existingFile;
      }
    } catch (error) {
      logger.warn("Error checking existing files:", error);
    }

    // Upload file if not found
    if (!file) {
      const uploadResult = await fileManager.uploadFile(videoPath, {
        mimeType: "video/mp4",
        displayName: filename,
      });
      file = uploadResult.file;
      logger.info(`Uploaded file ${file.displayName} as: ${file.name}`);

      // Wait for file to be active
      let currentFile = await fileManager.getFile(file.name);
      while (currentFile.state === "PROCESSING") {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        currentFile = await fileManager.getFile(file.name);
      }

      if (currentFile.state !== "ACTIVE") {
        throw new Error(`File ${file.name} failed to process`);
      }
    }

    logger.info("File ready for analysis");

    const result = await retry(
      async () => {
        const prompt = `You are a professional baseball analyst providing detailed play-by-play commentary.

Analyze this baseball play and return a JSON response with exactly these keys. Follow these formatting rules:
- score: Format as "Team A X, Team B Y" (always show both teams)
- inning: Include top/bottom and inning number, e.g., "Top of the 3rd"
- count: Format as "X-Y" for balls-strikes, or "No count" if not visible
- summary: Detailed play description including player names, positions, and specific actions
- highlight: Extended description including game context, situation, and significance
- stats: Include all available metrics, use null for unavailable stats
  - pitchSpeed: Format as "XX MPH" or null
  - exitVelocity: Format as "XX MPH" or null
  - distance: Format as "XXX ft" or null
  - time: Format as "X.XX sec" or null

Example format:
{
  "score": "Yankees 3, Red Sox 2",
  "inning": "Top of the 7th",
  "count": "2-2",
  "summary": "Judge crushes a fastball deep to left field, hitting his 40th home run of the season.",
  "highlight": "In a crucial at-bat with the go-ahead run at the plate, Judge continues his historic season with another mammoth blast.",
  "stats": {
    "pitchSpeed": "97 MPH",
    "exitVelocity": "108 MPH",
    "distance": "452 ft",
    "time": null
  }
}`;

        const chat = model.startChat();
        const result = await chat.sendMessage([
          {
            fileData: {
              mimeType: "video/mp4",
              fileUri: file?.uri!,
            },
          },
          {
            text: prompt,
          },
        ]);

        const responseText = result.response.text();
        if (!responseText) {
          throw new Error("No response received from Gemini");
        }

        // Clean up response text - remove markdown formatting if present
        const cleanJson = responseText
          .replace(/```json\n?/g, "") // Remove ```json
          .replace(/```\n?/g, "") // Remove closing ```
          .trim(); // Remove extra whitespace

        try {
          const analysis = JSON.parse(cleanJson);
          return analysis as PlaySummary;
        } catch (error) {
          logger.error("Failed to parse response:", cleanJson);
          throw new Error("Invalid JSON response from Gemini");
        }
      },
      {
        retries: 3,
        minTimeout: 2000,
        onRetry: (error, retryCount) => {
          logger.warn(
            `Error generating analysis (attempt ${retryCount}):`,
            error
          );
        },
      }
    );

    return result;
  } catch (error) {
    logger.error("Error generating video summary:", error);
    throw error;
  }
}
