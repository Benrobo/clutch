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
import MLBAPIHelper from "../helpers/mlb/mlb-api.helper.js";

export default class HighlightController {
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

    if (!user) {
      throw new Error(`Unauthorized.`);
    }

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
    const sortedMessages = messages.reverse();

    return sendResponse.success(
      c,
      "Messages retrieved successfully",
      200,
      sortedMessages
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

    const humanMessage = await this.chatService.saveChatMessage({
      chatId: chat.id,
      message: payload.message,
      role: "USER",
    });

    return sendResponse.success(c, "Message sent successfully", 200, {
      user: humanMessage,
    });
  }

  // TEAM/PLAYER INFO FOR LLM CONTEXT
  public async getTeamInfo(
    teams: (string | number)[],
    type: "md" | "object" = "object"
  ) {
    try {
      const _teamInfo: {
        teamName: string;
        location: string;
        playerInfo: {
          playerName: string;
          playerPosition: string;
        }[];
      }[] = [];
      let markdownTeamFormat = "";
      await Promise.all(
        teams.map(async (team) => {
          const teamInfo = await this.mlbApi.getTeam(Number(team));
          const roster = await this.mlbApi.getTeamRoster(Number(team));
          roster.forEach((player) => {
            if (!_teamInfo.find((t) => t.teamName === teamInfo?.name)) {
              _teamInfo.push({
                teamName: teamInfo?.name,
                location: teamInfo?.locationName ?? "N/A",
                playerInfo: [
                  {
                    playerName: player?.person?.fullName,
                    playerPosition: player?.position?.abbreviation,
                  },
                ],
              });
            } else {
              _teamInfo
                .find((t) => t.teamName === teamInfo?.name)
                ?.playerInfo.push({
                  playerName: player?.person?.fullName,
                  playerPosition: player?.position?.abbreviation,
                });
            }
          });
        })
      );

      if (type === "md") {
        _teamInfo.forEach((team) => {
          markdownTeamFormat += `## ${team.teamName}\n`;
          markdownTeamFormat += `- [Team Location]: ${team.location}\n`;
          markdownTeamFormat += `- [Players | Roasters]:\n`;
          team.playerInfo.forEach((player, index) => {
            markdownTeamFormat += `${index + 1}. ${player.playerName} (${
              player.playerPosition
            })\n`;
          });
          markdownTeamFormat += "\n\n";
        });

        return markdownTeamFormat;
      }

      return _teamInfo.flat();
    } catch (e: any) {
      console.error(e);
      if (type === "md") {
        return "N/A";
      }
      return [];
    }
  }

  // CURRENTLY, CONTENT MODERATION IS BEEN CHECK ON MESSAGE SENT
  // NOW, IT SHOULD BE DONE WITHIN THE PROCESS METHOD BELOW

  async processLastMessage(c: Context) {
    const user = c.get("user");
    const { chatId } = c.req.param();
    const lastMessage = await this.chatService.getLastMessage(chatId);

    if (lastMessage?.role === "AI") {
      return sendResponse.success(c, "Message processed successfully", 200, {
        ai: {
          ...lastMessage,
          chat: undefined,
        },
      });
    }

    const pbId = lastMessage?.chat?.ref;
    const playback = await this.highlightService.getPlayback(pbId!);

    // Increase the speed of delivery, I'll have to comment the safety check mechanism.
    // content moderation
    // const safetyCheck = await this.contentModeration.safetyCheck(
    //   lastMessage?.content!
    // );

    // if (!safetyCheck.isValid) {
    //   const savedResp = await this.chatService.saveChatMessage({
    //     chatId: lastMessage?.chat_id!,
    //     message: safetyCheck?.followUp!,
    //     role: "AI",
    //     error: safetyCheck?.type,
    //   });
    //   return sendResponse.success(c, "Message sent successfully", 200, {
    //     ai: {
    //       ...savedResp,
    //       chat: undefined,
    //     },
    //   });
    // }

    if (!playback) {
      const savedResp = await this.chatService.saveChatMessage({
        chatId: lastMessage?.chat_id!,
        message: "I'm sorry, I could not find the gameplay highlight.",
        role: "AI",
        error: "Playback not found",
      });
      return sendResponse.success(c, "Playback not found", 200, savedResp);
    }

    const pbSummary = playback?.summary;
    const homeTeam = playback?.highlight?.game?.home_team_id;
    const awayTeam = playback?.highlight?.game?.away_team_id;
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
    const teamInfoMd = await this.getTeamInfo([homeTeam, awayTeam], "md");
    const context = `
    # Team Information:
    ${teamInfoMd}

    # Game Decision:
    ${finalGameDecision}

    # Video Summary:
    ${JSON.stringify(pbSummary, null, 2)}
    `;

    try {
      const aiResponse = await this.highlightAIEngine.generateAIResponse({
        query: lastMessage?.content!,
        context: context as string,
      });

      const parsedSources = await this.parseSources(aiResponse?.sources!);

      const savedResp = await this.chatService.saveChatMessage({
        chatId: lastMessage?.chat_id!,
        message: aiResponse?.response!,
        role: "AI",
        sources: parsedSources,
      });
      return sendResponse.success(c, "Message processed successfully", 200, {
        ai: savedResp,
      });
    } catch (err: any) {
      const savedResp = await this.chatService.saveChatMessage({
        chatId: lastMessage?.chat_id!,
        message: `I'm sorry, something went wrong.`,
        role: "AI",
        error: err?.message,
        sources: [],
      });

      return sendResponse.success(c, "Message processed successfully", 200, {
        ai: savedResp,
      });
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
