
export type ConversationResponse = {
    id: string;
    ref: string;
    refType: "highlight_playback" | string;
    title: string;
}

export type ChatFeedSources = {
    title: string;
    url: string;
    description?: string;
    seo: {
        favicon: string;
        site_name: string;
    },
    image: string;
}

export type ChatFeedData = {
    id: string;
    content: string;
    role: "ai" | "human";
    sources?: ChatFeedSources[];
}