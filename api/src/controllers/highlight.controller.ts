import { Context } from "hono";
import HighlightService from "../services/highlight.service.js";
import sendResponse from "../lib/send-response.js";
import { HttpException } from "../lib/exception.js";
import ChatService from "../services/chat.service.js";
import shortUUID from "short-uuid";
import { sleep } from "../lib/utils.js";
import HighlightAIEngine from "../services/RAG/highlight-ai.engine.js";
import { DBGameDecision } from "../types/game.types.js";
import ContentModeration from "../helpers/content-moderation.js";
import { SEARCH_WEB_RESPONSE } from "../types/rag.types.js";
import retry from "async-retry";
import WebCrawler from "../helpers/web-crawler.js";
import { ExaSearchResult } from "../config/exa-js-client.js";

export default class HighlightController {
  private highlightService: HighlightService;
  private chatService: ChatService;
  private highlightAIEngine: HighlightAIEngine;
  private contentModeration: ContentModeration;

  constructor() {
    this.highlightService = new HighlightService();
    this.chatService = new ChatService();
    this.highlightAIEngine = new HighlightAIEngine();
    this.contentModeration = new ContentModeration();
  }

  async toggleLike(c: Context) {
    const user = c.get("user");
    const { playbackId } = c.req.param();

    const isLiked = await this.highlightService.toggleLike(
      user?.id,
      playbackId
    );
    return sendResponse.success(
      c,
      `Highlight ${isLiked ? "liked" : "unliked"} successfully`,
      200
    );
  }

  async startConversation(c: Context) {
    const user = c.get("user");
    const { playbackId } = c.req.param();
    const playback = await this.highlightService.getPlayback(playbackId);

    if (!playback) {
      throw new HttpException("Playback not found", 404);
    }

    const chat = await this.chatService.getChatByPlaybackId(
      playback.id,
      user.id,
      "highlight_playback"
    );

    const chatId = shortUUID.generate();
    const _chat = await this.chatService.createOrUpdateChat({
      pbId: playback.id,
      chatId: chat?.id ?? chatId,
      refType: "highlight_playback",
      title: playback.title,
      userId: user.id,
    });

    return sendResponse.success(c, "Chat started successfully", 200, {
      id: _chat?.id,
      ref: _chat?.ref,
      refType: _chat?.ref_type,
      title: _chat?.title,
    });
  }

  async getChatMessages(c: Context) {
    const user = c.get("user");
    const { chatId } = c.req.param();
    const messages = await this.chatService.getMessages(chatId, user?.id);
    return sendResponse.success(
      c,
      "Messages retrieved successfully",
      200,
      messages
    );
  }

  async aiChatConversation(c: Context) {
    const user = c.get("user");
    const { chatId } = c.req.param();
    const payload = (await c.req.json()) as { message: string };

    // check chat exists
    const chat = await this.chatService.getChatById(chatId, user.id);
    if (!chat) {
      throw new HttpException("Chat not found", 404);
    }

    // content moderation
    const safetyCheck = await this.contentModeration.safetyCheck(
      payload.message
    );

    if (!safetyCheck.isValid) {
      const [user, ai] = await Promise.all([
        this.chatService.saveChatMessage({
          chatId: chat.id,
          message: payload.message,
          role: "USER",
        }),
        this.chatService.saveChatMessage({
          chatId: chat.id,
          message: safetyCheck?.followUp!,
          role: "AI",
          error: safetyCheck?.type,
        }),
      ]);

      return sendResponse.success(c, "Message sent successfully", 200, ai);
    }

    const humanMessage = await this.chatService.saveChatMessage({
      chatId: chat.id,
      message: payload.message,
      role: "USER",
    });

    return sendResponse.success(
      c,
      "Message sent successfully",
      200,
      humanMessage
    );
  }

  async processLastMessage(c: Context) {
    const user = c.get("user");
    const { chatId } = c.req.param();
    const message = await this.chatService.getLastMessage(chatId);

    if (message?.role === "AI") {
      return sendResponse.success(c, "Message processed successfully", 200, {});
    }

    const pbId = message?.chat?.ref;
    const playback = await this.highlightService.getPlayback(pbId!);

    if (!playback) {
      await this.chatService.saveChatMessage({
        chatId: message?.chat_id!,
        message: "I'm sorry, I could not find the gameplay highlight.",
        role: "AI",
        error: "Playback not found",
      });
      return sendResponse.success(c, "Playback not found", 200, message);
    }

    const pbSummary = playback?.summary;
    const gameDecision = playback?.highlight?.game
      ?.decisions as DBGameDecision | null;
    const finalGameDecision = gameDecision
      ? JSON.stringify(
          {
            winner: gameDecision?.winner?.fullName,
            loser: gameDecision?.loser?.fullName,
          },
          null,
          2
        )
      : "N/A";
    const context = "N/A";

    try {
      const aiResponse = await this.highlightAIEngine.generateAIResponse({
        query: message?.content!,
        finalGameDecision,
        highlightSummary: JSON.stringify(pbSummary, null, 2),
        context,
      });

      const parsedSources = await this.parseSources(aiResponse?.sources!);

      const savedResp = await this.chatService.saveChatMessage({
        chatId: message?.chat_id!,
        message: aiResponse?.response!,
        role: "AI",
        sources: parsedSources,
      });
      return sendResponse.success(
        c,
        "Message processed successfully",
        200,
        savedResp
      );
    } catch (err: any) {
      const savedResp = await this.chatService.saveChatMessage({
        chatId: message?.chat_id!,
        message: `I'm sorry, something went wrong.`,
        role: "AI",
        error: err?.message,
        sources: [],
      });

      return sendResponse.success(
        c,
        "Message processed successfully",
        200,
        savedResp
      );
    }
  }

  private async parseSources(sources: ExaSearchResult[]) {
    if (sources?.length === 0) return [];

    const webCrawler = new WebCrawler();
    const parsedSources = await retry(
      async () => {
        const parsedSources: {
          url: string;
          favicon: string;
          title: string;
          domain: string;
          ogImage?: string;
        }[] = [];

        await Promise.all(
          sources.map(async (src) => {
            const metadata = await webCrawler.getWebsiteMetadata(src.url);
            if (metadata) {
              if (metadata?.favicon || (metadata?.favicon ?? "")?.length > 0) {
                parsedSources.push({
                  url: src.url,
                  favicon: metadata.favicon,
                  title: metadata.title,
                  domain: metadata.domain,
                  ogImage: metadata.ogImage,
                });
              }
            }
          })
        );

        return parsedSources;
      },
      {
        retries: 3,
        onRetry: (e, attempt) => {
          console.log(`Failed parsing sources, retrying attempt ${attempt}`);
        },
      }
    );
    return parsedSources;
  }
}
