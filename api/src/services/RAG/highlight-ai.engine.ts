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
    tool_name: ValidRAGToolToolName
  ): Promise<CallToolResponse<T> | null> {
    if (tool_name === "search_web") {
      const [_, value] = (parameters ?? "").split("=");
      const sanitizedParameters = value
        .replace(/["]/g, "")
        .replace(/[']/g, "")
        .replace(/\\/g, "");

      const result = await searchWeb(sanitizedParameters);
      return result;
    }
    return null;
  }

  private async getSources(query: string) {
    const sources = await searchWeb(query);
    return sources;
  }

  async generateAIResponse(query: string) {
    // check if tool is needed
    const toolDecision = await this.doINeedToolHelp(query);
    let toolResponse: any = null;
    if (toolDecision) {
      toolResponse = await this.callTool(
        toolDecision?.input_parameters!,
        toolDecision?.tool as any
      );
    }

    console.log(toolResponse);
  }
}
