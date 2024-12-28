import { lowerCase } from "../../../lib/utils.js";
import { RAGTool } from "../../../types/rag.types.js";

export const AVAILABLE_TOOLS = [
  {
    name: "search_web",
    parameters: ["query"],
    required_parameters: ["query"],
    description: "Search the web for information about a topic",
  },
] satisfies RAGTool[];

export function getToolByName(name: string) {
  return AVAILABLE_TOOLS.find((tool) => lowerCase(tool.name) === name);
}
