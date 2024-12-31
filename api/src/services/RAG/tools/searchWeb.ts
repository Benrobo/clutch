import retry from "async-retry";
import redis from "../../../config/redis.js";
import exa from "../../../config/exa-ai.js";
import { ExaSearchResult } from "../../../config/exa-js-client.js";

const CACHE_EXPIRY = 60 * 60; // 1hr

const cacheWebResult = async (query: string, data: any) => {
  const cacheKey = `web-search:${query}`;
  const pipeline = redis.pipeline();
  pipeline.sadd(cacheKey, JSON.stringify(data));
  pipeline.expire(cacheKey, CACHE_EXPIRY);
  await pipeline.exec();
};

const extendCacheTime = async (query: string) => {
  const cacheKey = `web-search:${query}`;
  const pipeline = redis.pipeline();
  pipeline.expire(cacheKey, CACHE_EXPIRY);
  await pipeline.exec();
  console.log(`Extended cache time for ${query}`);
};

const getCachedResults = async (query: string) => {
  const cacheKey = `web-search:${query}`;
  const cachedResults = await redis.smembers(cacheKey);
  if (cachedResults.length > 0) {
    console.log(`Using cached results for query: ${query}`);
    await extendCacheTime(query);
    return JSON.parse(cachedResults[0]);
  }
  return null;
};

export default async function searchWeb(
  query: string,
  niche?: string
): Promise<ExaSearchResult[]> {
  try {
    return await retry(
      async () => {
        let formattedQuery = `${query}`;
        if (niche) {
          formattedQuery = `${formattedQuery}. "${niche}"`;
        }

        console.log(`Searching web for [${formattedQuery}]...`);

        const result = await getCachedResults(query);

        if (result) return result;

        const { results } = await exa.searchAndContents({
          query: formattedQuery,
          category: "news",
          type: "auto",
          includeText: "baseball, MLB",
          excludeText: "basketball, basket ball, football",
          includeDomains: [
            "https://www.mlb.com/",
            "https://www.espn.com/",
            "https://www.cbssports.com/",
            "https://www.fangraphs.com",
            "https://d1baseball.com/",
            "https://sabr.org/",
            "https://www.baseballamerica.com/",
            "https://www.mlbtraderumors.com",
          ],
          contents: {
            extras: {
              imageLinks: 4,
              links: 5,
            },
            summary: {},
          },
        });

        if (!results || results.length === 0) {
          throw new Error("No results found");
        }

        // cache result
        await cacheWebResult(query, results);

        return results;
      },
      {
        retries: 3,
        onRetry: (error, attempt) => {
          console.log(`Error searching web (attempt ${attempt}):`, error);
        },
      }
    );
  } catch (e: any) {
    console.log(`Error searching web:`, e);
    return [];
  }
}

export async function searchWebWithKeywords(
  query: string,
  niche?: string,
  options?: {
    includeText?: string;
    excludeText?: string;
    includeDomains?: string[];
    category?: "news" | "general" | "company";
  }
): Promise<ExaSearchResult[]> {
  try {
    return await retry(
      async () => {
        let formattedQuery = `${query}`;
        if (niche) {
          formattedQuery = `${formattedQuery}. "${niche}"`;
        }

        console.log(`Searching web for [${formattedQuery}]...`);

        const result = await getCachedResults(query);

        if (result) return result;

        const { results } = await exa.searchAndContents({
          query: formattedQuery,
          type: "keyword",
          ...options,
        });

        if (!results || results.length === 0) {
          throw new Error("No results found");
        }

        // cache result
        await cacheWebResult(query, results);

        return results;
      },
      {
        retries: 3,
        onRetry: (error, attempt) => {
          console.log(`Error searching web (attempt ${attempt}):`, error);
        },
      }
    );
  } catch (e: any) {
    console.log(`Error searching web:`, e);
    return [];
  }
}
