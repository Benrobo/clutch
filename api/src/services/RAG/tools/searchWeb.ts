import ExaAiService from "../../exa-ai.service.js";
import retry from "async-retry";
import redis from "../../../config/redis.js";

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

export default async function searchWeb(query: string) {
  const exaService = new ExaAiService();
  try {
    return await retry(
      async () => {
        console.log(`Searching web for [${query}]...`);

        const result = await getCachedResults(query);

        if (result) return result;

        const results = await exaService.searchWeb(query, {
          category: "news",
          includeText: ["baseball"],
          excludeText: ["basketball basket ball football"],
          extras: {
            imageLinks: 4,
            links: 5,
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
    return null;
  }
}
