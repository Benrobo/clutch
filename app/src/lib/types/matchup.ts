export type Player = {
    teamId: number;
    id: number;
    fullName: string;
    verified: boolean;
    active: boolean;
    position: string;
    jerseyNumber: string;
    profilePicture: string;
    height: string;
    weight: number;
    currentAge: number;
}

export type PlayerStats = {
    stats: Array<{ key: string; value: string }>;
    visualization: {
        percentage: number;
        trend: string;
    };
};

export type ComparisonHighlightSlide = {
    title: string;
    players: Record<string, PlayerStats>;
    insight: string;
};

export type ComparisonHighlights = {
    title: string;
    subtitle: string;
    slides: ComparisonHighlightSlide[];
};


export type MatchupPlayer = {
    id: number;
    fullName: string;
    profilePicture: string;
    jerseyNumber: string;
    position: string;
    team: string;
}

export type MatchupList = {
    id: number;
    challenger: MatchupPlayer;
    opponent: MatchupPlayer;
}