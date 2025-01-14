import {
  MLBBaseStats,
  MLBPitcherStats,
  MLBPositionStats,
} from "../types/mlb.types.js";

export const BASE_PLAYER_STATS = ["gamesPlayed"];

export const PLAYER_POSITION_STATS_MAP = {
  // pitcher
  P: [
    ...BASE_PLAYER_STATS,
    "era",
    "strikeOuts",
    "whip",
    "inningsPitched",
    "saves",
    "wins",
    "strikeoutsPer9Inn",
  ],
  // catcher
  C: [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
    "ops",
    "fieldingPercentage",
    "caughtStealingPercentage",
  ],
  // first base
  "1B": [
    ...BASE_PLAYER_STATS,
    "avg",
    "ops",
    "homeRuns",
    "fieldingPercentage",
    "putOuts",
  ],
  // second base
  "2B": [
    ...BASE_PLAYER_STATS,
    "avg",
    "ops",
    "fieldingPercentage",
    "caughtStealingPercentage",
  ],
  // third base
  "3B": [...BASE_PLAYER_STATS, "avg", "ops", "fieldingPercentage", "putOuts"],
  // shortstop
  SS: [
    ...BASE_PLAYER_STATS,
    "rbi",
    "avg",
    "ops",
    "fieldingPercentage",
    "assists",
    "homeRuns",
  ],
  // left field
  LF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "ops",
    "homeRuns",
    "rbi",
    "fieldingPercentage",
    "putOuts",
  ],
  // center field
  CF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "ops",
    "homeRuns",
    "fieldingPercentage",
    "putOuts",
  ],
  // right field
  RF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "ops",
    "homeRuns",
    "rbi",
    "fieldingPercentage",
    "putOuts",
  ],
} as Record<string, (keyof MLBPositionStats)[]>;

export const PLAYER_ENGAGEMENT_QUESTIONS = {
  // Pitcher (P)
  P: [
    {
      question:
        "Who’s more likely to strike out 10 batters in their next game?",
      stats: ["strikeOuts", "strikeoutsPer9Inn"],
    },
    {
      question: "Which pitcher is more likely to throw a shutout?",
      stats: ["era", "wins"],
    },
    {
      question: "Who’s more likely to close out the game with no runs allowed?",
      stats: ["saves", "whip"],
    },
  ],
  // Catcher (C)
  C: [
    {
      question: "Who’s more likely to throw out a runner stealing a base?",
      stats: ["caughtStealingPercentage"],
    },
    {
      question:
        "Which catcher is more likely to hit a home run in their next game?",
      stats: ["homeRuns", "ops"],
    },
    {
      question: "Who’s more likely to drive in the winning run?",
      stats: ["rbi", "avg"],
    },
  ],
  // First Base (1B)
  "1B": [
    {
      question: "Who’s more likely to hit a home run in their next at-bat?",
      stats: ["homeRuns", "ops"],
    },
    {
      question:
        "Which first baseman is more likely to get 3 hits in their next game?",
      stats: ["avg", "hits"],
    },
    {
      question: "Who’s more likely to make a game-saving catch at first?",
      stats: ["fieldingPercentage", "putOuts"],
    },
  ],
  // Second Base (2B)
  "2B": [
    {
      question: "Who’s more likely to turn a double play in their next game?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Which second baseman is more likely to steal a base?",
      stats: ["stolenBases", "caughtStealingPercentage"],
    },
    {
      question: "Who’s more likely to drive in the go-ahead run?",
      stats: ["rbi", "ops"],
    },
  ],
  // Third Base (3B)
  "3B": [
    {
      question: "Who’s more likely to hit a clutch home run?",
      stats: ["homeRuns", "ops"],
    },
    {
      question: "Which third baseman is more likely to make a diving stop?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Who’s more likely to drive in 3 runs in their next game?",
      stats: ["rbi", "avg"],
    },
  ],
  // Shortstop (SS)
  SS: [
    {
      question: "Who’s more likely to make a highlight-reel play at short?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Which shortstop is more likely to hit a walk-off home run?",
      stats: ["homeRuns", "ops"],
    },
    {
      question: "Who’s more likely to turn a game-changing double play?",
      stats: ["fieldingPercentage", "assists"],
    },
  ],
  // Left Field (LF)
  LF: [
    {
      question: "Who’s more likely to hit a home run in their next game?",
      stats: ["homeRuns", "ops"],
    },
    {
      question:
        "Which left fielder is more likely to make a game-saving catch?",
      stats: ["fieldingPercentage", "putOuts"],
    },
    {
      question: "Who’s more likely to drive in the winning run?",
      stats: ["rbi", "avg"],
    },
  ],
  // Center Field (CF)
  CF: [
    {
      question: "Who’s more likely to make an incredible diving catch?",
      stats: ["fieldingPercentage", "putOuts"],
    },
    {
      question: "Which center fielder is more likely to hit a clutch home run?",
      stats: ["homeRuns", "ops"],
    },
    {
      question: "Who’s more likely to steal a base in their next game?",
      stats: ["stolenBases", "caughtStealingPercentage"],
    },
  ],
  // Right Field (RF)
  RF: [
    {
      question: "Who’s more likely to hit a home run in their next at-bat?",
      stats: ["homeRuns", "ops"],
    },
    {
      question:
        "Which right fielder is more likely to throw out a runner at home?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Who’s more likely to drive in the go-ahead run?",
      stats: ["rbi", "avg"],
    },
  ],
} as Record<string, { question: string; stats: string[] }[]>;
