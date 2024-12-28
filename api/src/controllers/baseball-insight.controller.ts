import { Context } from "hono";
import BaseballInsightService from "../services/baseball-insight.service.js";
import sendResponse from "../lib/send-response.js";

class BaseballInsightController {
  private baseballInsightService: BaseballInsightService;

  constructor() {
    this.baseballInsightService = new BaseballInsightService();
  }

  async createChat(c: Context) {
    const userId = c.get("userId");
    const { ref, question } = await c.req.json();

    const chat = await this.baseballInsightService.createChat(
      userId,
      question,
      ref
    );
    return sendResponse.success(c, "Chat created successfully", 201, chat);
  }

  async getChats(c: Context) {
    const userId = c.get("userId");
    const chats = await this.baseballInsightService.getChats(userId);
    return sendResponse.success(c, null, 200, chats);
  }

  async getChatById(c: Context) {
    const userId = c.get("userId");
    const chatId = c.req.param("chatId");

    const chat = await this.baseballInsightService.getChatById(userId, chatId);
    return sendResponse.success(c, null, 200, chat);
  }
}

export default BaseballInsightController;
