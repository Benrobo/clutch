import { Context } from "hono";
import RecommendationService, {
  FeedType,
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
      const { type = "ForYou", cursor, limit = 10 } = c.req.query();

      if (!["ForYou", "Explore"].includes(type)) {
        throw new HttpException("Invalid feed type", 400);
      }

      const feedParams = {
        cursor,
        limit: Math.min(Number(limit), 20), // Cap at 20 items per request
      };

      const highlights =
        type === "ForYou"
          ? await this.recommendationService.getForYouFeed(user, feedParams)
          : await this.recommendationService.getExploreFeed(
              user.id,
              feedParams
            );

      const nextCursor =
        highlights.length === feedParams.limit
          ? highlights[highlights.length - 1].id
          : undefined;

      return sendResponse.success(c, null, 200, {
        items: highlights,
        nextCursor,
        hasMore: !!nextCursor,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException("Failed to fetch feed", 500);
    }
  }
}
