import prisma from "../prisma/index.js";
import { ChatRole } from "@prisma/client";

class BaseballInsightService {
  async createChat(userId: string, title: string, ref?: string) {
    return await prisma.chat.create({
      data: {
        user_id: userId,
        title,
        ref,
      },
      include: {
        messages: true,
      },
    });
  }

  async getChats(userId: string) {
    return await prisma.chat.findMany({
      where: {
        user_id: userId,
      },
      include: {
        messages: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }

  async getChatById(userId: string, chatId: string) {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        user_id: userId,
      },
      include: {
        messages: {
          orderBy: {
            created_at: "asc",
          },
        },
      },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    return chat;
  }

  private async generateAIResponse(
    query: string,
    highlightRef?: string
  ): Promise<{ content: string; sources?: any }> {
    // TODO: Implement Gemini integration here
    // This should:
    // 1. If highlightRef exists, fetch highlight context
    // 2. Generate response using Gemini
    // 3. Return response with optional sources

    return {
      content: "AI response placeholder",
      sources: [],
    };
  }
}

export default BaseballInsightService;
