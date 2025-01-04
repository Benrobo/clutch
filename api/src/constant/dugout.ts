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
    apprentice: apprentice.length,
    planetary: planetary.length,
    stellar: stellar.length,
  },
} satisfies GameProgressionChallenges;

export const GAME_LEVELS = [
  "apprentice",
  "planetary",
  "stellar",
  "universe",
  "domain_master",
] as const;
