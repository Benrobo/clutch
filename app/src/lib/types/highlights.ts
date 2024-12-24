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
    homeTeamId: number;
    awayTeamId: number;
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