// import googleTranslate from "../../config/google-translate.js";
import { SupportedTranslations } from "../../types/game.types.js";
import retry from "async-retry";
import fs from "fs/promises";
import LLMPromptBuilder from "../../helpers/prompt-builder.helper.js";
import Gemini from "../../helpers/gemini.helper.js";
import { TranscriptResult, TranslatedTranscriptResult } from "./types.js";
import { sleep } from "../../lib/utils.js";
import path from "path";

export const SupportedLanguages = [
  "es", // Spanish
  "ja", // Japanese
  "ko", // Korean
  "zh", // Chinese (Simplified)
  "fr", // French
  "pt", // Portuguese
] as SupportedTranslations[];

const MAX_TRANSLATION = 4;

const RATE_LIMIT_DELAY = 2000;
const RATE_LIMIT_BACKOFF = 5000;

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

        // check if translated transcript exists and it not empty
        const transcriptDir = path.dirname(transcriptPath);
        const translatedTranscriptPath = path.join(
          transcriptDir,
          "translated-transcript.json"
        );
        const translatedTranscriptExists =
          await checkTranslatedTranscriptExists(translatedTranscriptPath);
        if (translatedTranscriptExists) {
          console.log(
            `Translated transcript already exists: ${translatedTranscriptPath}`
          );
          const translatedTranscriptContent = await fs.readFile(
            translatedTranscriptPath,
            "utf-8"
          );
          const translatedTranscript = JSON.parse(
            translatedTranscriptContent
          ) as TranslatedTranscriptResult;
          return translatedTranscript[lang];
        }

        const transcriptContent = await fs.readFile(transcriptPath, "utf-8");
        const transcript = JSON.parse(transcriptContent) as TranscriptResult;

        // Check if transcript has required content
        if (!transcript.segments?.length || !transcript.fullTranscript) {
          throw new Error("Invalid transcript content");
        }

        // Translate each segment sequentially with rate limiting
        const translatedSegments = [];
        for (const segment of transcript.segments) {
          try {
            // Add delay before each translation to avoid rate limits
            await sleep(RATE_LIMIT_DELAY);

            const result = (await generateTranslation(segment.text, lang)) as {
              output: string;
              lang: string;
            };
            translatedSegments.push({
              lang,
              translated_text: result.output,
              start: segment.start,
              end: segment.end,
              text: segment.text, // original text
            });
          } catch (error: any) {
            // If we hit rate limit, wait longer before retrying
            if (
              error?.message?.includes("429") ||
              error?.response?.status === 429
            ) {
              console.log(
                `Rate limit hit, waiting ${RATE_LIMIT_BACKOFF}ms before retrying...`
              );
              await sleep(RATE_LIMIT_BACKOFF);
              // Retry this segment
              const result = await generateTranslation(segment.text, lang);
              translatedSegments.push({
                lang,
                translated_text: result?.output,
                start: segment.start,
                end: segment.end,
                text: segment.text,
              });
            } else {
              console.error(
                `Translation failed for segment in language ${lang}:`,
                error
              );
            }
          }
        }

        // Create the translation result for this language
        const translationResult = {
          lang,
          translations: translatedSegments,
          fullTranscript: transcript.fullTranscript,
        };

        return translationResult;
      },
      {
        retries: 3,
        minTimeout: RATE_LIMIT_BACKOFF, // Use the backoff time as minimum retry delay
        onRetry: (e, retryCount) => {
          console.log(
            `❌ Error translating transcript for [${pb_id}] in language [${lang}]:`,
            e
          );
          console.log(
            `🔄 Retrying translation for [${pb_id}] in language [${lang}] (attempt ${retryCount})`
          );
        },
      }
    );
  } catch (e: any) {
    console.error(`Error in translation process for language ${lang}:`, e);
    throw e;
  }
}

export async function saveTranslatedTranscript(
  transcriptPath: string,
  translatedTranscripts: {
    lang: SupportedTranslations;
    translations: {
      lang: SupportedTranslations;
      translated_text: string;
      start: number;
      end: number;
      text: string;
    }[];
    fullTranscript: string;
  }[]
) {
  try {
    const transcriptDir = path.dirname(transcriptPath);
    const translatedTranscriptPath = path.join(
      transcriptDir,
      "translated-transcript.json"
    );

    await fs.writeFile(
      translatedTranscriptPath,
      JSON.stringify(
        translatedTranscripts.reduce((acc, trans) => {
          acc[trans.lang] = trans;
          return acc;
        }, {} as Record<SupportedTranslations, (typeof translatedTranscripts)[0]>),
        null,
        2
      )
    );

    console.log(`✅ Translations saved to: ${translatedTranscriptPath}`);
  } catch (e: any) {
    console.log(`Error occured saving translated transcript: `, e);
  }
}

async function generateTranslation(input: string, lang: SupportedTranslations) {
  try {
    return await retry(
      async () => {
        const prompt = new LLMPromptBuilder()
          .addCustomBlock(
            "role",
            "You are a highly skilled translator tasked with translating a given text while preserving its exact tone, style, and nuances. Your goal is to produce a translation that reads as if it were originally written in the target language while staying 100% true to the content, style, and tone of the source text."
          )
          .addPlainText("Here is the text you need to translate:")
          .addCustomBlock("source_text", input)
          .addCustomBlock("target_language", lang)
          .addCustomBlock(
            "translation_instruction",
            `1. Translate the text into the target language, maintaining the original meaning, tone, and style exactly as they appear in the source text.
2. Preserve all natural pauses and breaks from the original text, including punctuation and paragraph structure. Adapt these to the conventions of the target language if necessary.
3. Translate idiomatic expressions, cultural references, and specialized language as directly as possible without attempting to explain or simplify them.
4. Ensure that the final translation sounds natural in the target language while still maintaining the exact style and tone of the original.`
          )
          .addRule(
            "Please provide your translation directly, without any additional explanations or markup. Your output should consist solely of the translated text."
          )
          .compose();

        const response = await new Gemini().functionCall({
          prompt,
          tools: [
            {
              func_name: "translate",
              description: "Translate text",
              parameters: {
                type: "object",
                properties: {
                  // @ts-expect-error
                  output: {
                    type: "string",
                    description: "The translated text",
                  },
                },
                required: ["output"],
              },
            },
          ],
        });

        if (!response.data) {
          throw new Error("Translation failed");
        }

        return {
          output: (
            response.data.find((item: any) => item.name === "translate")
              ?.args as any
          )?.output,
          lang,
        } as { output: string; lang: SupportedTranslations };
      },
      {
        retries: 3,
        minTimeout: 1000,
        onRetry: (e, retryCount) => {
          console.log(`Error translating text:`, e);
          console.log(`Retrying to translate text (attempt ${retryCount})`);
        },
      }
    );
  } catch (e: any) {}
}

async function checkTranslatedTranscriptExists(transcriptPath: string) {
  try {
    await fs.access(transcriptPath);

    const transcriptContent = await fs.readFile(transcriptPath, "utf-8");
    const translatedTranscript = JSON.parse(
      transcriptContent
    ) as TranslatedTranscriptResult;

    if (Object.entries(translatedTranscript).length === 0) {
      return false;
    }

    return true;
  } catch (e: any) {
    return false;
  }
}
