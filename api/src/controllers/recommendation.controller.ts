import { Context } from "hono";
import RecommendationService, {
  FeedType,
  HighlightItem,
} from "../services/recommendation.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";

export default class RecommendationController {
  private recommendationService: RecommendationService;

  constructor() {
    this.recommendationService = new RecommendationService();
  }

  // First request
  // GET /api/recommendations/feed?type=ForYou&limit=10
  // Returns items 1-10 with nextCursor = "item10_id"

  // When user scrolls near end, frontend requests:
  // GET /api/recommendations/feed?type=ForYou&limit=10&cursor=item10_id
  // Returns items 11-20 with nextCursor = "item20_id"

  async getFeed(c: Context) {
    try {
      const user = c.get("user");
      const { type = "foryou", cursor, limit = 10 } = c.req.query();

      if (!["foryou", "explore"].includes(type.toLowerCase())) {
        throw new HttpException("Invalid feed type", 400);
      }

      // Validate limit
      const parsedLimit = Math.min(Number(limit), 20); // Cap at 20 items per request
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new HttpException("Invalid limit parameter", 400);
      }

      const recommendationService = new RecommendationService();
      let highlights: HighlightItem[] = [];

      if (type === "foryou") {
        highlights = await recommendationService.getForYouFeed(user, {
          // cursor,
          limit: parsedLimit,
        });
      } else {
        highlights = await recommendationService.getExploreFeed(user.id, {
          // cursor,
          limit: parsedLimit,
        });
      }

      // Get the next cursor from the last item
      // const nextCursor =
      //   highlights.length > 0 ? highlights[highlights.length - 1].id : null;

      // Check if we got a full page of results
      const hasMore = highlights.length >= parsedLimit;

      return sendResponse.success(c, null, 200, {
        items: highlights,
        // nextCursor,
        hasMore,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException("Failed to fetch feed", 500);
    }
  }

  async markVideoAsSeen(c: Context) {
    const user = c.get("user");
    const { playbackId } = c.req.query();

    if (!playbackId) {
      throw new HttpException("Playback ID is required", 400);
    }

    const recommendationService = new RecommendationService();
    await recommendationService.markHighlightViewed(user.id, playbackId);

    return sendResponse.success(c, "Playback highlight marked as seen", 200);
  }
}
