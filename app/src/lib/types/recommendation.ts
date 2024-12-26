
export type RecommendationResponse = {
    items: RecommendationData[]
    // nextCursor?: null | string;
    hasMore: boolean;
}

export type RecommendationData = {
    id: string,
    gameId: number,
    createdAt: string,
    likes: number,
    views: number,
    youLiked: boolean,
    thumbnail: {
        main: null | string,
        fallback: string
    },
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
    }
}
