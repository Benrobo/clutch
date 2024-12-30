import prisma from "../prisma/index.js";
import { HttpException } from "../lib/exception.js";
import { $Enums } from "@prisma/client";

export default class ChatService {
  async getChatByPlaybackId(
    pbId: string,
    userId: string,
    refType: $Enums.RefType
  ) {
    return await prisma.chat.findFirst({
      where: {
        ref: pbId,
        ref_type: refType,
        user_id: userId,
      },
    });
  }

  async getChatById(chatId: string, userId: string) {
    return await prisma.chat.findFirst({
      where: {
        id: chatId,
        user_id: userId,
      },
    });
  }

  async createOrUpdateChat(props: {
    pbId: string;
    chatId: string;
    refType: $Enums.RefType;
    title: string;
    userId: string;
  }) {
    return await prisma.chat.upsert({
      where: {
        id: props.chatId,
        user_id: props.userId,
      },
      update: {
        ref: props.pbId,
        ref_type: props.refType,
      },
      create: {
        id: props.chatId,
        ref: props.pbId,
        ref_type: props.refType,
        title: props.title,
        user_id: props.userId,
      },
    });
  }

  async saveChatMessage(props: {
    chatId: string;
    message: string;
    role: $Enums.ChatRole;
    sources?: any;
    error?: string;
  }) {
    return await prisma.chat_messages.create({
      data: {
        chat_id: props?.chatId,
        content: props?.message,
        role: props?.role,
        sources: props?.sources,
        error: props?.error,
      },
    });
  }

  async getMessage(msgId: string) {
    return await prisma.chat_messages.findFirst({
      where: {
        id: msgId,
      },
      include: {
        chat: true,
      },
    });
  }

  async getLastMessage(chatId: string) {
    return await prisma.chat_messages.findFirst({
      where: {
        chat_id: chatId,
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        chat: true,
      },
    });
  }

  async getMessages(chatId: string, userId: string) {
    return await prisma.chat_messages.findMany({
      where: {
        chat_id: chatId,
        chat: {
          user_id: userId,
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
}
