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

export type MatchupPlayerDetails ={
    name: string;
    team: {
        name: string;
        logo: string;
        id: number;
    };
    active: boolean;
    gender: string;
    height: string;
    weight: number;
    batSide: {
        code: string;
        description: string;
    };
    position: string;
    verified: boolean;
    birthCity: string;
    birthCountry: string;
    profilePicture: string;
    currentAge: number;
}

export type MatchupListResponse = {
    id: number;
    challenger_id: number;
    opponent_id: number;
    challenger_team_id: number;
    opponent_team_id: number;
    position: string;
    season: string;
    highlights: {
        analysis: Array<{
            title: string;
            insight: string;
            players: Record<string, PlayerStats>;
        }>
        playerOfTheDay: {
            id: string;
            score: string;
            insight: string;
            fullName: string;
            position: string;
        }
    };
    player_position_stats: {
        challenger: {
            info: MatchupPlayerDetails
            stats: Array<{
                key: string;
                value: string;
            }>
        }
        opponent: {
            info: MatchupPlayerDetails
            stats: Array<{
                key: string;
                value: string;
            }>
        }
    }
}