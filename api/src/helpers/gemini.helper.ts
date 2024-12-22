import {
  GoogleGenerativeAI,
  type FunctionCall,
  type FunctionDeclarationSchemaProperty,
  type GenerateContentResult,
  type SchemaType,
  FunctionCallingMode,
} from "@google/generative-ai";
import env from "../config/env.js";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import logger from "../lib/logger.js";
import { HttpException } from "../lib/exception.js";
import type { ICallAIProps, IFunctionCall } from "../types/gemini.types.js";

export default class Gemini {
  private genAI: GoogleGenerativeAI;
  // private cacheManager: GoogleAIC
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateEmbedding(data: string) {
    if (!data) {
      logger.info("No data provided, using default data");
      data = "Hello there.";
    }

    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const chunkText = await this.chunkText(data);
    const result = [] as { embedding: number[]; content: string }[];
    for (const chunk of chunkText) {
      const { embedding } = await model.embedContent(chunk);
      result.push({
        content: chunk,
        embedding: embedding.values,
      });
    }
    return result;
  }

  public async chunkText(data: string) {
    if (!data) {
      throw new Error("Data is required");
    }
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // max characters per chunk
      chunkOverlap: 150, // overlap between chunks
    });
    const tokens = await splitter.splitText(data as any);
    return tokens;
  }

  public async functionCall(props: IFunctionCall) {
    let resp = {
      error: null,
      data: null,
    } as { error: any; data: FunctionCall[] | null };
    try {
      const generativeModel = this.genAI.getGenerativeModel({
        // model: "gemini-1.5-flash",
        model: "gemini-2.0-flash-exp",
        tools: [
          {
            functionDeclarations: props.tools.map((t) => ({
              name: t.func_name,
              description: t.description,
              parameters: {
                type: t.parameters.type as SchemaType,
                properties: t.parameters.properties as unknown as {
                  [k: string]: FunctionDeclarationSchemaProperty;
                },
                required: t.required,
              },
            })),
          },
        ],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingMode.ANY,
          },
        },
      });

      logger.info("Sending prompt to Gemini:", props.prompt);
      const chat = generativeModel.startChat();
      const result = await chat.sendMessage(props.prompt!);
      logger.info("Raw response from Gemini:", result.response);

      // For simplicity, this uses the first function call found.
      const call = result.response.functionCalls();

      logger.info("Function call:");
      logger.info(result.response.usageMetadata);

      resp.data = call ?? null;
      return resp;
    } catch (e: any) {
      logger.error("Error calling AI function", e);
      resp.error = e;
      throw new HttpException("Error calling AI function", 400);
    }
  }

  // Call GEMINI AI to handle user's conversation
  public async callAI(props: ICallAIProps) {
    let resp: { data: string | null; error: string | null } = {
      data: null,
      error: null,
    };
    try {
      const genModel = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: props.instruction,
      });

      let result: GenerateContentResult;

      if (!props?.enable_call_history) {
        result = await genModel.generateContent(props.user_prompt);
      } else {
        const chat = genModel.startChat({
          history: props?.history,
          systemInstruction: props.instruction,
          generationConfig: {
            maxOutputTokens: 1000,
          },
        });

        result = await chat.sendMessage(props.user_prompt);
      }

      resp.data = result.response.text();
      return resp;
    } catch (e: any) {
      console.log(e);
      logger.error("GenAI response error", e);
      resp.error = e;
      return resp;
    }
  }

  public async similaritySearch() {}
}
