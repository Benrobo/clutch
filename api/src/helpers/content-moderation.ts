import Gemini from "./gemini.helper.js";
import retry from "async-retry";
import logger from "../lib/logger.js";
import { contentModeratorPrompt } from "../data/prompts/llm-prompts.js";

export type SafetyCheckResult = {
  isValid: boolean;
  reason: string;
  type?: SafetyViolationType;
  suggestion?: string;
  followUp?: string;
};

export type SafetyViolationType =
  | "DANGEROUS"
  | "INAPPROPRIATE"
  | "IRRELEVANT" // For questions unrelated to baseball
  | "IMPOSSIBLE"
  | "ILLEGAL"
  | "UNETHICAL"
  | "INVALID_FORMAT" // For random characters, invalid symbols
  | "NONSENSICAL" // For text that makes no sense
  | "TOO_VAGUE" // For overly generic or unclear questions
  | "SPAM" // For repetitive or spam-like content
  | "GIBBERISH"; // For completely random or meaningless text

export const SafetyErrorMessages: Record<SafetyViolationType, string> = {
  DANGEROUS:
    "Safety Concern: This question may encourage unsafe or harmful behavior. Please revise to ensure safety.",
  INAPPROPRIATE:
    "Content Warning: This question contains inappropriate elements. Please revise to align with community standards.",
  IRRELEVANT:
    "Relevance Issue: This question doesn’t seem related to baseball. Please ensure it aligns with baseball topics.",
  IMPOSSIBLE:
    "Feasibility Issue: This question assumes something that isn’t possible within the context of baseball or current understanding.",
  ILLEGAL:
    "Legal Concern: This question may suggest something illegal. Please ensure it aligns with legal guidelines.",
  UNETHICAL:
    "Ethical Concern: This question raises ethical considerations. Please revise to ensure it respects ethical standards.",
  INVALID_FORMAT:
    "Format Error: Your question contains invalid characters or symbols. Please use standard text format.",
  NONSENSICAL:
    "Clarity Issue: Your question doesn’t form a coherent idea. Please revise to make it clearer.",
  TOO_VAGUE:
    "Too Generic: Your question needs more specific details to be evaluated effectively.",
  SPAM: "Duplicate Content: This appears to be repetitive or spam-like content. Please provide a unique question.",
  GIBBERISH:
    "Invalid Text: Your submission appears to be random or meaningless text. Please provide a real question.",
};

export default class ContentModeration {
  private gemini: Gemini;

  constructor() {
    this.gemini = new Gemini();
  }

  private async handleSafetyCheck(content: string): Promise<SafetyCheckResult> {
    const prompt = contentModeratorPrompt({
      query: content,
    });

    const resp = await this.gemini.functionCall({
      prompt,
      tools: [
        {
          func_name: "safety_check",
          description:
            "Validate if the given text represents a safe, legal, and ethical idea",
          parameters: {
            type: "object",
            properties: {
              // @ts-expect-error
              isValid: {
                type: "boolean",
                description:
                  "Whether the content is safe and appropriate (true) or problematic (false)",
              },
              // @ts-expect-error
              reason: {
                type: "string",
                description:
                  "A clear, short straight to the point explanation of why the content is invalid.",
              },
              // @ts-expect-error
              type: {
                type: "string",
                description: ` The primary category of the violation, it must be from the following list: ${Object.keys(
                  SafetyErrorMessages
                ).join(
                  ", "
                )}. Make sure this isn't empty and contains one of the provided categories, otherwise set to SAFE.`,
              },

              // @ts-expect-error
              followUp: {
                type: "string",
                description: `Provide a polite and concise follow-up response. 
    - If the input is a casual greeting, respond warmly and guide the conversation toward baseball-related topics. 
    - If it's unrelated to baseball or unclear, respond politely without explicitly stating the issue, keeping the tone neutral and friendly.`,
              },
            },
          },
          required: ["isValid", "reason", "type", "followUp"],
        },
      ],
    });

    if (!resp.data || !Array.isArray(resp.data) || resp.data.length !== 1) {
      logger.error("[ContentModeration] Invalid AI response");
      throw new Error("Invalid response from AI");
    }

    const result = resp.data[0].args as SafetyCheckResult;

    // Ensure we always have a suggestion if the content is invalid
    if (!result.isValid && !result.suggestion) {
      //   result.suggestion =
      //     "Please provide a more specific and relevant question that aligns with the context of baseball.";
    }

    return result;
  }

  async safetyCheck(content: string): Promise<SafetyCheckResult> {
    return retry(
      async () => {
        const result = await this.handleSafetyCheck(content);

        const safetyTypes = Object.keys(SafetyErrorMessages);
        if (safetyTypes.includes(result.type as string) && result.isValid) {
          result.isValid = false;
        }
        return result;
      },
      {
        retries: 5,
      }
    );
  }
}
