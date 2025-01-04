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
  apprentice: number[];
  planetary: number[];
  stellar: number[];
};
