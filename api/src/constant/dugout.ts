import {
  GameProgressionChallenges,
  VALID_GAME_IDS as VALID_GAME_IDS_TYPE,
  GameLevel,
} from "../types/dugout.types.js";
import {
  apprentice,
  planetary,
  stellar,
} from "../data/games/4-pic-1-word/index.js";

export const VALID_GAME_IDS: VALID_GAME_IDS_TYPE[] = ["4-pic-1-word", "quiz"];

export const GAME_PROGRESSION_CHALLENGES = {
  "4-pic-1-word": {
    apprentice: {
      count: apprentice.length,
      challenges: apprentice,
      points: 50,
    },
    planetary: {
      count: planetary.length,
      challenges: planetary,
      points: 100,
    },
    stellar: {
      count: stellar.length,
      challenges: stellar,
      points: 200,
    },
  },
} satisfies GameProgressionChallenges;

export const GAME_LEVELS = [
  "apprentice",
  "planetary",
  "stellar",
  "universe",
  "domain_master",
] as const;

export const USER_GAME_LEVELS_MAP_TOTAL_POINTS = {
  apprentice: 10,
  planetary: 20,
  stellar: 40,
};
