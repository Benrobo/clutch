import { Context } from "hono";
import HighlightService from "../services/highlight.service.js";
import sendResponse from "../lib/send-response.js";

export default class HighlightController {
  private highlightService: HighlightService;

  constructor() {
    this.highlightService = new HighlightService();
  }

  async toggleLike(c: Context) {
    const user = c.get("user");
    const { playbackId } = c.req.param();

    const isLiked = await this.highlightService.toggleLike(user.id, playbackId);
    return sendResponse.success(
      c,
      `Highlight ${isLiked ? "liked" : "unliked"} successfully`,
      200
    );
  }
}
