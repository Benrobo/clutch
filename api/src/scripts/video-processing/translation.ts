// import googleTranslate from "../../config/google-translate.js";
import { SupportedTranslations } from "../../types/game.types";
import retry from "async-retry";
import fs from "fs/promises";

export async function translateTranscript(
  transcriptPath: string,
  lang: SupportedTranslations,
  pb_id: string
) {
  try {
    return await retry(
      async () => {
        try {
          await fs.access(transcriptPath);
        } catch (e: any) {
          console.log(`Transcript not found: ${transcriptPath}`);
          return null;
        }

        const transcriptContent = await fs.readFile(transcriptPath, "utf-8");
        const transcript = JSON.parse(transcriptContent);

        // Check if transcript has required content
        if (!transcript.segments?.length || !transcript.fullTranscript) {
          throw new Error("Invalid transcript content");
        }

        // test translation

        // return transcript;
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(`❌ Error extracting audio for [${pb_id}]:`, e);
          console.log(
            `🔄 Retrying to extract audio for [${pb_id}] (attempt ${retryCount})`
          );
        },
      }
    );
  } catch (e: any) {
    console.log(e);
  }
}

export async function translateSRT(
  srtPath: string,
  lang: SupportedTranslations,
  pb_id: string
) {}
