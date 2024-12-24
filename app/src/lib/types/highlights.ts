export type Orientation = 'HORIZONTAL' | 'VERTICAL';

export type Thumbnail = {
    main: string | null;
    fallback: string;
};

export type Playback = {
    title: string;
    description: string;
    mlbVideoUrl: string;
    mlbVideoDuration: string;
    processedVideoUrl: string | null;
    processedVideoDuration: string | null;
    orientation: Orientation;
};

export type Game = {
    home_team: {
        id: number;
        name: string;
        logo_url: string | null;
    };
    away_team: {
        id: number;
        name: string;
        logo_url: string | null;
    };
    date: string;
    status: string;
};

export type Highlight = {
    id: string;
    gameId: number;
    createdAt: string;
    likes: number;
    thumbnail: Thumbnail;
    playback: Playback;
    game: Game;
};

export type Highlights = Highlight[];