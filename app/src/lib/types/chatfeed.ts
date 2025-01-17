
export type ConversationResponse = {
    id: string;
    ref: string;
    refType: "highlight_playback" | string;
    title: string;
}

export type ChatFeedSources = {
    url: string;
    title: string;
    domain: string;
    favicon: string;
    ogImage?: string;
}

export type ChatFeedData = {
    id: string;
    content: string;
    role: "ai" | "human";
    sources?: ChatFeedSources[];
}

export type ChatMessagesResponse = {
    id: string;
    chat_id: string;
    role: "USER" | "AI";
    content: string;
    sources: ChatFeedSources[] | null;
    error: string | null;
    created_at: string;
}

export type ProcessLastMessageResponse = {
    ai: {
        pbId: string;
        message: string;
        role: "AI" | "HUMAN";
        sources: ChatFeedSources[] | null;
        error: string | null;
        created_at: string;
    }
}