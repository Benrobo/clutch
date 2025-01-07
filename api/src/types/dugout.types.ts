export type VALID_GAME_IDS = "4-pic-1-word" | "quiz";

export type GameLevel = "apprentice" | "planetary" | "stellar";

export type FourPicOneWordChallenges = {
  id: number;
  secret: {
    word: string;
    display: string;
  };
  definition: string;
  media: Array<{
    type: "image" | "video";
    url: string;
    description: string;
  }>;
};

export type GameProgressionChallenges = {
  [key in VALID_GAME_IDS]?: {
    apprentice: {
      count: number;
      challenges: FourPicOneWordChallenges[];
      points: number;
    };
    planetary: {
      count: number;
      challenges: FourPicOneWordChallenges[];
      points: number;
    };
    stellar: {
      count: number;
      challenges: FourPicOneWordChallenges[];
      points: number;
    };
  };
};

export type CompletedChallenges = {
  apprentice: {
    completed: boolean;
    played_challenges: number[];
  };
  planetary: {
    completed: boolean;
    played_challenges: number[];
  };
  stellar: {
    completed: boolean;
    played_challenges: number[];
  };
};

export type DugoutUserStats = {
  points: number;
  dugout_game_id: string;
  level: GameLevel;
};
