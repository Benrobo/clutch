export type VALID_GAME_IDS = "4-pic-1-word" | "quiz";

export type GameLevel = "apprentice" | "planetary" | "stellar";

export type GameProgressionChallenges = {
  [key in VALID_GAME_IDS]?: {
    apprentice: number;
    planetary: number;
    stellar: number;
  };
};

export type CompletedChallenges = {
  apprentice: number[];
  planetary: number[];
  stellar: number[];
};
