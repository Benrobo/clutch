
export type RecommendationResponse = {
    items: RecommendationData[]
    nextCursor?: null | string;
    hasMore: boolean;
}

export type RecommendationData = {
    id: string,
    higlightId: string,
    gameId: number,
    createdAt: string,
    likes: number,
    views: number,
    youLiked: boolean,
    thumbnail: {
        main: null | string,
        fallback: string
    },
    summary: {
        count: string,
        score: string,
        stats: {
            time: null | string,
            distance: null | number,
            pitchSpeed: string,
            exitVelocity: null | number,
        },
        inning: string,
        summary: string,
        highlight: string,
    }
    playback: {
        id: string,
        title: string,
        description: string,
        mlbVideoUrl: string,
        mlbVideoDuration: string,
        processedVideoUrl: null | string,
        processedVideoDuration: null | string,
        orientation: "HORIZONTAL" | "VERTICAL"
    },
    game: {
        home_team: {
            id: number,
            name: string,
            logo_url: string
        },
        away_team: {
            id: number,
            name: string,
            logo_url: string
        },
        date: string,
        status: "Final" | "Live" | "Upcoming"
    },
    transcript: Transcript
}

export type SupportedTranslations = "en" | "es" | "ja" | "ko";

export type Transcript = {
    original: {
        segments: Array<{
            end: number;
            text: string;
            start: number;
            confidence: number;
        }>
        fullTranscript: string;
    } | null;
    translated: {
        [key in SupportedTranslations]: {
            lang: key;
            translations: Array<{
                end: number;
                start: number;
                text: string;
                translated_text: string;
            }>
            fullTranscript: string;
        }
    } | null;
}