import type { SchemaType } from "@google/generative-ai";

export interface IFunctionCall {
  prompt: string;
  tools: {
    func_name: string;
    description: string;
    parameters: {
      type: string;
      properties: {
        [key: string]: SchemaType;
      };
    };
    required: string[];
  }[];
}

export interface ICallAIProps {
  instruction?: string;
  user_prompt: string;
  enable_call_history?: boolean;
  history?: {
    role: "user" | "system";
    parts: {
      text: string;
    }[];
  }[];
  model?: "gemini-2.0-flash-exp" | "gemini-1.5-flash";
}

export type VectorSimilaritySearchProp = {};
