import { fourPicOneWordHintPrompt } from "../../data/prompts/llm-prompts.js";
import Gemini from "../../helpers/gemini.helper.js";
import retry from "async-retry";

export default class DugoutAIEngine {
  private gemini: Gemini;
  constructor() {
    this.gemini = new Gemini();
  }

  public async getFourPicOneWordHint(payload: {
    selectedLetters: string[];
    secretWord: string;
  }) {
    try {
      return await retry(
        async () => {
          const { selectedLetters, secretWord } = payload;
          const prompt = fourPicOneWordHintPrompt({
            selectedLetters,
            secretWord,
          });
          const hint = await this.gemini.callAI({
            user_prompt: prompt,
            enable_call_history: false,
            log: true,
          });

          if (!hint?.data) {
            throw new Error("Failed to get hint");
          }

          // Remove the leading and trailing backticks and any extra whitespace
          const strippedHint = hint.data
            .replace(/^```json\s*\n|\n```$|```$/g, "")
            .replace(/\\/g, "")
            .replace(/\n\s*/g, "")
            .replace(/\s+/g, " ")
            .replace(/\\n/g, " ")
            .trim();

          // Remove any trailing backticks that might still be present
          const cleanedHint = strippedHint.replace(/```/g, "").trim();

          try {
            const parsedHint = JSON.parse(cleanedHint);
            if (!parsedHint?.suggested_letters?.length || !parsedHint?.tip) {
              throw new Error("Invalid hint format");
            }
            return parsedHint;
          } catch (parseError: any) {
            console.error("Cleaned string:", cleanedHint);
            throw parseError;
          }
        },
        {
          retries: 5,
          factor: 2,
          minTimeout: 1000,
          maxTimeout: 15000,
          randomize: true,
          onRetry(e: any, attempt) {
            console.error(
              `Failed to get hint (attempt ${attempt}/5): ${e.message}`
            );
          },
        }
      );
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }
}
