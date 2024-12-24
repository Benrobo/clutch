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
] as SupportedTranslations[];

const MAX_TRANSLATION = 4;

const RATE_LIMIT_DELAY = 2000;
const RATE_LIMIT_BACKOFF = 5000;

interface TranslationSegment {
  id: number;
  text: string;
}

interface TranslatedSegment {
  id: number;
  translation: string;
}

interface FormattedTranslation {
  lang: SupportedTranslations;
  translated_text: string;
  start: number;
  end: number;
  text: string;
}

interface GeminiFunctionResponse {
  name: string;
  args: {
    output: string;
  };
}

export interface TranslationResult {
  lang: SupportedTranslations;
  translations: FormattedTranslation[];
  fullTranscript: string;
}

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

        if (!transcript.segments?.length || !transcript.fullTranscript) {
          throw new Error("Invalid transcript content");
        }

        const segmentsForTranslation: TranslationSegment[] =
          transcript.segments.map((segment) => ({
            id: segment.start,
            text: segment.text,
          }));

        const result = await generateTranslation(
          JSON.stringify(segmentsForTranslation),
          lang
        );

        if (!result?.output) {
          throw new Error("Translation failed");
        }

        const translatedSegments = JSON.parse(
          result.output
        ) as TranslatedSegment[];

        if (!Array.isArray(translatedSegments)) {
          throw new Error("Invalid translation format - expected array");
        }

        const formattedTranslations: FormattedTranslation[] =
          transcript.segments.map((segment, index) => ({
            lang,
            translated_text: translatedSegments[index]?.translation || "",
            start: segment.start,
            end: segment.end,
            text: segment.text,
          }));

        const translationResult: TranslationResult = {
          lang,
          translations: formattedTranslations,
          fullTranscript: transcript.fullTranscript,
        };

        return translationResult;
      },
      {
        retries: 3,
        minTimeout: RATE_LIMIT_BACKOFF,
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
  translatedTranscripts: TranslationResult[]
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
        }, {} as Record<SupportedTranslations, TranslationResult>),
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
            `You are a highly skilled translator tasked with translating text from English to ${lang}. Your task is to translate each segment while preserving its meaning and tone.`
          )
          .addPlainText("Here are the text segments to translate:")
          .addCustomBlock("source_text", input)
          .addCustomBlock("target_language", lang)
          .addCustomBlock(
            "translation_instruction",
            `1. Translate the text into the target language, maintaining the original meaning, tone, and style exactly as they appear in the source text.
2. Preserve all natural pauses and breaks from the original text, including punctuation and paragraph structure. Adapt these to the conventions of the target language if necessary.
3. Translate idiomatic expressions, cultural references, and specialized language as directly as possible without attempting to explain or simplify them.
4. Ensure that the final translation sounds natural in the target language while still maintaining the exact style and tone of the original.
5. Translate ONLY the "text" field into ${lang}
6. Return a JSON array of objects with format: { "id": number, "translation": "translated text" }
7. Maintain the exact same order as input array
8. Return ONLY the JSON array, no other text
`
          )
          .addRule(
            "IMPORTANT: You must translate the text to ${lang}. Do not return the original English text."
          )
          .compose();

        const response = await new Gemini().functionCall({
          prompt,
          tools: [
            {
              func_name: "translate",
              description: "Translate text segments",
              parameters: {
                type: "object",
                properties: {
                  // @ts-expect-error
                  output: {
                    type: "string",
                    description:
                      "JSON array of translated segments - each must have id and translation fields",
                  },
                },
                required: ["output"],
              },
            },
          ],
        });

        if (!response.data) {
          throw new Error("Translation failed - no response data");
        }

        const functionResult = response.data.find(
          (item): item is GeminiFunctionResponse => item.name === "translate"
        );

        if (!functionResult?.args?.output) {
          throw new Error(
            "Translation failed - invalid function response format"
          );
        }

        // First unescape the JSON string if it contains escaped quotes
        const unescapedJson = functionResult.args.output.replace(/\\"/g, '"');

        let parsedOutput: TranslatedSegment[];
        try {
          // Parse and validate the response
          const parsed = JSON.parse(unescapedJson);

          // Validate array structure
          if (!Array.isArray(parsed)) {
            throw new Error("Response is not an array");
          }

          // Validate each segment has required fields
          parsedOutput = parsed.map((segment: any, index) => {
            if (typeof segment.id !== "number") {
              throw new Error(`Invalid id at index ${index}`);
            }
            if (typeof segment.translation !== "string") {
              throw new Error(`Missing translation at index ${index}`);
            }
            return {
              id: segment.id,
              translation: segment.translation,
            };
          });

          return {
            output: JSON.stringify(parsedOutput),
            lang,
          };
        } catch (e: any) {
          console.error(
            "Invalid translation response:",
            functionResult.args.output,
            "\nError:",
            e
          );
          throw new Error(`Translation validation failed: ${e.message}`);
        }
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
  } catch (e: any) {
    console.error("Translation error:", e);
    throw e;
  }
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
