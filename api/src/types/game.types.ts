export interface DBLeague {
  id: number;
  name: string;
  abbreviation: string;
}

export interface DBGameDecision {
  winner: {
    id: number;
    fullName: string;
  };
  loser: {
    id: number;
    fullName: string;
  };
}

export interface CreateGameInput {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  status: string;
  season: number;
  game_type: string;
  decisions: DBGameDecision;
}

export interface CreateTeamInput {
  id: number;
  name: string;
  abbreviation: string;
  league: DBLeague;
  logo_url: string;
}

interface DBPlayerStats {
  batSide: {
    code: string;
    description: string;
  };
  pitchHand: {
    code: string;
    description: string;
  };
}

export interface CreatePlayersInput {
  id: number;
  team_id: number;
  fullname: string;
  age: number;
  height: string;
  gender: string;
  verified: boolean;
  position: string;
  profile_pic: string;
  stats: DBPlayerStats;
}
