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
          });

          if (!hint?.data) {
            throw new Error("Failed to get hint");
          }

          const strippedHint = hint.data.replace(/^```json\s*\n|\n```$/g, "");
          const parsedHint = JSON.parse(strippedHint);

          if (!parsedHint?.suggested_letters?.length || !parsedHint?.tip) {
            throw new Error("Invalid hint format");
          }

          return parsedHint;
        },
        {
          retries: 3,
          minTimeout: 1000,
          maxTimeout: 10000,
          onRetry(e, attempt) {
            console.error(`Failed to get hint: ${e} - attempt: ${attempt}`);
          },
        }
      );
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }
}
