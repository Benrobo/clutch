export type Player = {
    id: number;
    fullName: string;
    currentAge: number;
    height: string;
    weight: number;
    active: boolean;
    position: string;
    gender: string;
    verified: boolean;
    batSide: string;
    profilePicture: string;
    jerseyNumber: string;
}

export type PlayerStats = {
    stats: Array<{ key: string; value: string }>;
    visualization: {
        percentage: number;
        trending: 'up' | 'down';
    };
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
    id: number;
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
    created_at: string;
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    error: string | null;
}