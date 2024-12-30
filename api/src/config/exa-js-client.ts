import axios, { AxiosInstance } from "axios";
import { extractAxiosResponseData } from "../lib/utils.js";

// Types for the API request and response
interface ExaSearchParams {
  query: string;
  type?: "auto" | "keyword" | "semantic" | "neural";
  category?: "news" | "general" | "company";
  includeText?: string;
  excludeText?: string;
  includeDomains?: string[];
  useAutoprompt?: boolean;
  numResults?: number;
  contents?: {
    summary?: Record<string, never> | { query: string };
    extras?: {
      links?: number;
      imageLinks?: number;
    };
  };
}

interface ExaSearchResult {
  id: string;
  url: string;
  title: string;
  author?: string;
  publishedDate?: string;
  summary: string;
  extras: {
    links: any[];
  };
}

interface ExaSearchResponse {
  requestId: string;
  autoDate: string;
  resolvedSearchType: string;
  results: ExaSearchResult[];
}

export class ExaClient {
  private readonly client: AxiosInstance;
  private static readonly BASE_URL = "https://api.exa.ai";

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: ExaClient.BASE_URL,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
    });
  }

  async searchAndContents(params: ExaSearchParams): Promise<ExaSearchResponse> {
    try {
      if (!params.query) {
        throw new Error("Query parameter is required");
      }

      const requestBody = {
        query: params.query,
        type: params.type,
        category: params.category,
        includeText: params.includeText ? [params.includeText] : undefined,
        excludeText: params.excludeText ? [params.excludeText] : undefined,
        includeDomains: params.includeDomains,
        contents: params.contents,
      };

      const response = await this.client.post<ExaSearchResponse>(
        "/search",
        requestBody
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(extractAxiosResponseData(error, "error"));
        throw new Error(
          `Exa API Error: ${error.response?.data?.error || error.message}`
        );
      }
      throw error;
    }
  }
}

// Export a factory function to create the client
export const createExaClient = (apiKey: string): ExaClient => {
  return new ExaClient(apiKey);
};

export type { ExaSearchParams, ExaSearchResponse, ExaSearchResult };
