import axios from "axios";
import retry from "async-retry";
import env from "../config/env.js";
import logger from "../lib/logger.js";
import redis from "../config/redis.js";
import { extractAxiosResponseData, extractCleanDomain } from "../lib/utils.js";

export type JinaReaderResult = {
  url: string;
  domain: string;
  content: string;
};

export type JinaResponse = {
  data: {
    code: number;
    status: number;
    title: string;
    description: string;
    url: string;
    content: string;
    usage: {
      token: number;
    };
  };
};

export default class JinaReader {
  private baseUrl: string;
  private maxRetries: number;
  private defaultCacheExpiry: number;
  private useApiKey: boolean;

  constructor(config?: { maxRetries?: number; cacheExpiry?: number }) {
    this.baseUrl = "https://r.jina.ai";
    this.maxRetries = config?.maxRetries || 3;
    this.defaultCacheExpiry = config?.cacheExpiry || 60 * 60 * 2; // 2 hours
    this.useApiKey = false; // Start with free version
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.useApiKey) {
      headers.Authorization = `Bearer ${env.JINA_API_KEY}`;
    } else {
      logger.info("Using free tier of Jina Reader");
    }

    return headers;
  }

  /**
   * Crawls a single URL and returns its content
   */
  public async crawlUrl(url: string) {
    const cacheKey = `jina:${url}`;

    // Check cache first
    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    const result = await retry(
      async (bail) => {
        try {
          const encodedUrl = encodeURIComponent(url);
          const response = await axios.get(`${this.baseUrl}/${encodedUrl}`, {
            headers: this.getHeaders(),
          });

          const jinaResp = extractAxiosResponseData<JinaResponse>(
            response?.data,
            "success"
          )?.data;

          const result: JinaReaderResult = {
            url,
            domain: extractCleanDomain(url),
            content: jinaResp?.content,
          };

          // Cache the result
          await redis.set(
            cacheKey,
            JSON.stringify(result),
            "EX",
            this.defaultCacheExpiry
          );

          return result;
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            // If rate limited (429) and not using API key yet, switch to API key
            if (error.response.status === 429 && !this.useApiKey) {
              logger.info("Rate limited on free tier, switching to API key");
              this.useApiKey = true;
              throw error; // Retry with API key
            }

            // If it's any other 4xx error or we're already using API key, don't retry
            if (error.response.status < 500) {
              bail(error);
              return;
            }
          }
          throw error;
        }
      },
      {
        retries: this.maxRetries,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 60000,
        onRetry: (error, attempt) => {
          logger.error(
            `Error crawling ${url} with Jina Reader (attempt ${attempt}, using API key: ${this.useApiKey}):`,
            error
          );
        },
      }
    );

    return result;
  }

  /**
   * Crawls multiple URLs and returns their content
   */
  public async crawlUrls(props: {
    urls: string[];
  }): Promise<JinaReaderResult[]> {
    const results: JinaReaderResult[] = [];

    for (const url of props.urls) {
      try {
        const result = await this.crawlUrl(url);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to crawl ${url}:`, error);
        // Add a minimal result for failed URLs
        results.push({
          url,
          domain: extractCleanDomain(url),
          content: "",
        });
      }
    }

    return results;
  }
}
