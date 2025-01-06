export type DugoutGameLevels = 'apprentice' | 'planetary' | 'stellar';

export type DugoutGameProgress = {
  id: string;
  user_id: string;
  dugout_game_id: string;
  level: string;
  total_challenges: number;
  completed_challenges: {
    stellar: number[];
    planetary: number[];
    apprentice: number[];
  };
  points: number;
  created_at: string;
};


export type DugoutUserStats = {
  highest_level: DugoutGameLevels | null;
  stats: Array<{
    points: number;
    dugout_game_id: string;
    level: DugoutGameLevels;
  }>;
};

export type JoinGameResponse = {
    id: string;
    user_id: string;
    dugout_game_id: string;
    level: string;
    total_challenges: number;
    completed_challenges: {
        stellar: number[];
        planetary: number[];
        apprentice: number[];
    };
    points: number;
    created_at: string;
}


export type FourPicOneWordChallenge = {
    completed: boolean;
    id: number;
    secret: {
        word: string;
        display: string;
    };
    definition: string;
    media: {
        type: string;
        url: string;
        description: string;
    }[]
};

export type FourPicOneWordGameLevelChallenges = {
    stellar: FourPicOneWordChallenge[];
    planetary: FourPicOneWordChallenge[];
    apprentice: FourPicOneWordChallenge[];
};


export type FourPicOneWordGameSession = {
  challenges: FourPicOneWordChallenge[];
  hint_points: number;
  current_challenge: FourPicOneWordChallenge | null;
  level: string;
};
