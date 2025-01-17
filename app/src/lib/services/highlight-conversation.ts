import { db, type Chat, type ChatMessage } from "./db";

export default class HighlightConversationService {
  constructor() {}

  async createChat(chat: Omit<Chat, 'id' | 'created_at'>) {
    // check if chat already exists
    const existingChat = await db.chats.where('ref').equals(chat.ref).first();
    if (existingChat) {
      return existingChat;
    }
    await db.chats.add({
      ...chat,
      id: Date.now(),
      created_at: new Date(),
    });

    return await db.chats.where('ref').equals(chat.ref).first();
  }

  async getChat(ref: string) {
    return await db.chats.where('ref').equals(ref).first();
  }

  async getChatMessages(chatId: number) {
    return await db.chat_messages.where("chat_id").equals(chatId).toArray();
  }

  async addChatMessage(message: Omit<ChatMessage, 'id' | 'created_at'>) {
    return await db.chat_messages.add({
      ...message,
      id: Date.now(),
      created_at: new Date(),
    });
  }
}
