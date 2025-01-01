
export type SpotlightsResponse = {
    id: string
    title: string
    headline: string
    photo: string;
    readingTime: {
        "min": 3,
        "sec": 237
    }
}


export type SpotlightContentResponse = {
    publishedDate: string | null;
    readingTime: {
        "min": 3,
        "sec": 237
    }
    id: string;
    title: string;
    headline: string;
    body: string;
    photo: string;
    highlight:{
        id: string;
        game_id: number;
    }
    sources: {
        id: string;
        index: number;
        sources: Array<{
            url: string;
            title: string | null;
            favicon: string;
        }>
    }
}