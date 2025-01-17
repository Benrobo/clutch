// TODO: Implement LOCAL FIRST technique for ai messaging feature.
import type { ChatMessagesResponse } from '@/types/chatfeed';
import Dexie, { type EntityTable } from 'dexie';

interface Chat {
  id: number;
  ref: string;
  ref_type: string;
  title: string;
  created_at: Date;
}

interface ChatMessage {
  id: number;
  chat_id: number;
  role: string;
  content: string;
  sources?: ChatMessagesResponse["sources"];
  created_at: Date;
}

const db = new Dexie('ClutchDatabase') as Dexie & {
  chats: EntityTable<
    Chat,
    'id' // primary key "id" (for the typings only)
  >;
  chat_messages: EntityTable<
    ChatMessage,
    'id' // primary key "id" (for the typings only)
  >;
};

// Schema declaration:
db.version(1).stores({
  chats: '++id, ref, ref_type, title, created_at', // primary key "id" (for the runtime!)
  chat_messages: '++id, chat_id, role, content, sources, created_at', // primary key "id" (for the runtime!)
});

export type { Chat, ChatMessage };
export { db };
