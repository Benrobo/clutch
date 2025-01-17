import { toolOrchestratorPrompt } from "../../data/prompts/llm-prompts.js";
import Gemini from "../../helpers/gemini.helper.js";
import { AVAILABLE_TOOLS } from "./tools/index.js";
import retry from "async-retry";

export default class ToolOrchestrator {
  private gemini: Gemini;
  constructor() {
    this.gemini = new Gemini();
  }

  async queryRoute(query: string, niche: string, context?: string) {
    try {
      return await retry(
        async () => {
          const prompt = toolOrchestratorPrompt({
            query,
            context: context!,
            tools: AVAILABLE_TOOLS,
            niche,
          });

          const response = await this.gemini.functionCall({
            prompt,
            tools: [
              {
                func_name: "tool_decision_maker",
                description:
                  "Determine whether specific tools are needed to answer user queries about baseball. If a tool is necessary, select the most appropriate one and identify its required parameters.",
                parameters: {
                  type: "object",
                  properties: {
                    // @ts-expect-error
                    tool: {
                      type: "string",
                      enum: [...AVAILABLE_TOOLS.map((t) => t.name), "null"],
                    },
                    // @ts-expect-error
                    input_parameters: {
                      type: "string",
                    },
                  },
                  required: ["tool", "input_parameters"],
                },
              },
            ],
          });

          const data = response?.data;

          if (!data) {
            throw new Error("No data returned from function call");
          }

          const result = data[0]?.args as {
            tool: string;
            input_parameters: string;
          };

          if (!result?.tool && !result?.input_parameters) {
            console.log(
              `No tool or input parameters returned from function call`
            );
            throw new Error(
              "No tool or input parameters returned from function call"
            );
          }

          return {
            tool: result.tool === "null" ? null : result?.tool,
            input_parameters:
              result?.input_parameters === "null" || !result?.input_parameters
                ? null
                : result?.input_parameters,
          };
        },
        {
          retries: 2,
          onRetry: (e, attempt) => {
            console.log(`Error querying route (attempt ${attempt}):`, e);
          },
        }
      );
    } catch (e: any) {
      return null;
    }
  }
}
