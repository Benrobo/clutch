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
      points: 10,
    },
    planetary: {
      count: planetary.length,
      challenges: planetary,
      points: 20,
    },
    stellar: {
      count: stellar.length,
      challenges: stellar,
      points: 30,
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
