import logger from "../../lib/logger.js";
import Gemini from "../../helpers/gemini.helper.js";
import ToolOrchestrator from "./orchestrator.js";
import searchWeb from "./tools/searchWeb.js";
import { AVAILABLE_TOOLS, getToolByName } from "./tools/index.js";
import { lowerCase } from "../../lib/utils.js";
import {
  CallToolResponse,
  ValidRAGToolToolName,
} from "../../types/rag.types.js";
import { baseballAssistantPrompt } from "../../data/prompts/llm-prompts.js";

export default class HighlightAIEngine {
  private gemini: Gemini;
  private toolOrchestrator: ToolOrchestrator;
  constructor() {
    this.gemini = new Gemini();
    this.toolOrchestrator = new ToolOrchestrator();
  }

  private async doINeedToolHelp(query: string) {
    const response = await this.toolOrchestrator.queryRoute(query, "baseball");

    if (!response) {
      logger.info(`No tool needed for query: [${query}]`);
      return null;
    }

    if ((!response?.tool && !response?.input_parameters) || !response?.tool) {
      logger.info(`No tool needed for query: [${query}]`);
      return null;
    }

    if (response?.tool && !response?.input_parameters) {
      return {
        tool: response.tool,
        input_parameters: `query=${query}`,
      };
    }

    // check if the tool is available
    const toolExist = getToolByName(lowerCase(response?.tool));
    if (!toolExist) {
      logger.info(`No tool found for query: [${query}]`);
      return null;
    }

    return response;
  }

  private async callTool<T extends ValidRAGToolToolName>(
    parameters: string,
    tool_name: ValidRAGToolToolName,
    niche?: string
  ): Promise<CallToolResponse<T> | null> {
    if (tool_name === "search_web") {
      const [_, value] = (parameters ?? "").split("=");
      const sanitizedParameters = (value ?? "")
        ?.replace(/["]/g, "")
        .replace(/[']/g, "")
        .replace(/\\/g, "");

      const result = await searchWeb(sanitizedParameters, niche);
      return result as any;
    }
    return null;
  }

  private async getSources(query: string, niche?: string) {
    const sources = await searchWeb(query, niche);
    return sources;
  }

  private formatToolResponseToMarkdown<T extends ValidRAGToolToolName>(
    toolName: ValidRAGToolToolName,
    toolResponse: CallToolResponse<T>
  ) {
    let markdown = "";
    if (toolName === "search_web") {
      (toolResponse ?? [])?.slice(0, 5)?.forEach((t) => {
        markdown += `[${t.url}]\n\n"""\n${t.summary}"""\n\n`;
      });
      return markdown;
    }
    return markdown;
  }

  async generateAIResponseV1(props: {
    query: string;
    finalGameDecision: string;
    highlightSummary: string;
    context?: string;
  }) {
    // check if tool is needed
    const toolDecision = await this.doINeedToolHelp(props.query);
    console.log({ toolDecision });
    let toolResponse: CallToolResponse<"search_web"> | null = null;
    let sources: CallToolResponse<"search_web"> | [] = [];
    if (toolDecision) {
      const [_toolResponse, _sources] = await Promise.all([
        this.callTool(
          toolDecision?.input_parameters!,
          toolDecision?.tool as any,
          "baseball"
        ),
        this.getSources(props.query),
      ]);

      toolResponse = _toolResponse;
      sources = _sources;
    }

    const formattedToolResponse = this.formatToolResponseToMarkdown(
      toolDecision?.tool as any,
      toolResponse as any
    );

    const prompt = baseballAssistantPrompt({
      query: props.query,
      finalGameDecision: props.finalGameDecision,
      highlightSummary: props.highlightSummary,
      webResults: formattedToolResponse,
      context: props.context ?? "N/A",
    });

    const response = await this.gemini.functionCall({
      prompt: prompt as any,
      tools: [
        {
          func_name: "baseball_assistant",
          description: "Provide a response to a baseball question",
          parameters: {
            type: "object",
            properties: {
              // @ts-expect-error
              response: {
                type: "string",
              },
            },
          },
          required: ["response"],
        },
      ],
    });

    const aiResponse = response?.data?.[0]?.args as { response: string };

    return {
      response: aiResponse?.response,
      sources,
    };
  }

  async generateAIResponse(props: {
    query: string;
    finalGameDecision: string;
    highlightSummary: string;
    context?: string;
  }) {
    // check if tool is needed
    const toolDecision = await this.doINeedToolHelp(props.query);
    let toolResponse: CallToolResponse<"search_web"> | null = null;
    let sources: CallToolResponse<"search_web"> | [] = [];
    if (toolDecision) {
      const [_toolResponse, _sources] = await Promise.all([
        this.callTool(
          toolDecision?.input_parameters!,
          toolDecision?.tool as any,
          "baseball"
        ),
        this.getSources(props.query, "baseball"),
      ]);

      toolResponse = _toolResponse;
      sources = _sources;
    }

    const formattedToolResponse = this.formatToolResponseToMarkdown(
      toolDecision?.tool as any,
      toolResponse as any
    );

    const prompt = baseballAssistantPrompt({
      query: props.query,
      finalGameDecision: props.finalGameDecision,
      highlightSummary: props.highlightSummary,
      webResults: formattedToolResponse,
      context: props.context ?? "N/A",
    });

    const response = await this.gemini.callAI({
      user_prompt: prompt as any,
    });

    return {
      response: response?.data,
      sources,
    };
  }
}
