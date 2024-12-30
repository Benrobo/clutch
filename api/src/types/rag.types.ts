import { ExaSearchResult } from "../config/exa-js-client";

export type ValidRAGToolToolName = "search_web";

export interface RAGTool {
  name: ValidRAGToolToolName;
  parameters: string[];
  required_parameters: string[];
  description: string;
}

export type SEARCH_WEB_RESPONSE = {
  id: string;
  url: string;
  title: string;
  author: string;
  score: number;
  summary: string;
};

export type CallToolResponse<T extends ValidRAGToolToolName> = {
  search_web: ExaSearchResult[];
}[T];
