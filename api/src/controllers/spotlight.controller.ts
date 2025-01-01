import { Context } from "hono";
import HighlightService from "../services/highlight.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import ChatService from "../services/chat.service.js";
import shortUUID from "short-uuid";
import { calculateReadingTime, sleep } from "../lib/utils.js";
import HighlightAIEngine from "../services/RAG/highlight-ai.engine.js";
import { DBGameDecision } from "../types/game.types.js";
import ContentModeration from "../helpers/content-moderation.js";
import { SEARCH_WEB_RESPONSE } from "../types/rag.types.js";
import retry from "async-retry";
import WebCrawler from "../helpers/web-crawler.js";
import { ExaSearchResult } from "../config/exa-js-client.js";
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";
import redis from "../config/redis.js";

export default class SpotlightController {
  private highlightService: HighlightService;
  private chatService: ChatService;
  private highlightAIEngine: HighlightAIEngine;
  private contentModeration: ContentModeration;
  private mlbApi: MLBAPIHelper;

  constructor() {
    this.highlightService = new HighlightService();
    this.chatService = new ChatService();
    this.highlightAIEngine = new HighlightAIEngine();
    this.contentModeration = new ContentModeration();
    this.mlbApi = new MLBAPIHelper();
  }

  async getSpotlights(c: Context) {
    const spotlights = await this.highlightService.highlightContents();

    return sendResponse.success(
      c,
      "Spotlights retrieved successfully",
      200,
      spotlights.map((spl) => ({
        ...spl,
        readingTime: calculateReadingTime(spl?.body, 200),
        body: undefined,
      }))
    );
  }

  async getSpotlightContent(c: Context) {
    const { id } = c.req.param();
    const spotlight = await this.highlightService.getHighlightContent(id);

    if (!spotlight) {
      throw new HttpException("Spotlight not found", 404);
    }

    let publishedDate = null;
    try {
      const key = `spotlight-published-date:${spotlight?.highlight?.game_id}`;
      const EXPIRY = 60 * 60 * 24;
      const cachedPublishedDate = await redis.get(key);
      if (cachedPublishedDate) {
        console.log("Retrieving publishedDate from cached");
        publishedDate = JSON.parse(cachedPublishedDate);
      } else {
        const gameContent = await retry(
          async () => {
            return await this.mlbApi.getGameContent(
              spotlight?.highlight?.game_id!
            );
          },
          {
            retries: 2,
            onRetry(e, attempt) {
              console.log(
                `Error getting publishedDate (attempt ${attempt}). Retrying...:`,
                e
              );
            },
          }
        );
        publishedDate = gameContent?.editorial?.recap?.mlb?.date;

        await redis.set(key, JSON.stringify(publishedDate));
        await redis.setex(
          key,
          EXPIRY, // 1 day
          JSON.stringify(publishedDate)
        );
      }
    } catch (err: any) {
      console.log(err?.message);
      console.log(`Failed to retrive publishedDate`);
    }

    return sendResponse.success(c, "Spotlights retrieved successfully", 200, {
      publishedDate,
      readingTime: calculateReadingTime(spotlight?.body, 200),
      ...spotlight,
    });
  }
}
