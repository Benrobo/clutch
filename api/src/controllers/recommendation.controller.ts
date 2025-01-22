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

  async getFeedV2(c: Context) {
    const userId = c.get("userId");
    const feed = c.req.query("feed") as "foryou" | "explore";
    const cursor = c.req.query("cursor") as string | undefined;
    const limit = parseInt((c.req.query("limit") as string) || "10");

    // Validate limit
    const parsedLimit = Math.min(Math.max(1, limit), 50);

    // Get highlights based on feed type
    const highlights =
      feed === "foryou"
        ? await this.recommendationService.getForYouFeedV2(
            userId,
            cursor,
            parsedLimit
          )
        : await this.recommendationService.getExploreFeedV2(
            userId,
            cursor,
            parsedLimit
          );

    // Get the next cursor from the last item
    const nextCursor =
      highlights.length > 0 ? highlights[highlights.length - 1].id : null;

    // Check if we got a full page of results
    const hasMore = highlights.length >= parsedLimit;

    return sendResponse.success(c, null, 200, {
      items: highlights,
      nextCursor,
      hasMore,
    });
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
