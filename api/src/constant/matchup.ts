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
    "caughtStealing",
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
    "caughtStealing",
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
      question: "Who's better at controlling the running game?",
      stats: ["stolenBases", "caughtStealing"],
    },
    {
      question:
        "Which catcher is more likely to hit a home run in their next game?",
      stats: ["homeRuns", "ops"],
    },
    {
      question: "Who's more likely to drive in the winning run?",
      stats: ["rbi", "avg"],
    },
  ],
  // First Base (1B)
  "1B": [
    {
      question: "Who's more likely to get an extra-base hit?",
      stats: ["doubles", "homeRuns"],
    },
    {
      question: "Who's the better overall hitter?",
      stats: ["avg", "ops"],
    },
    {
      question: "Who's more likely to drive in runs?",
      stats: ["rbi", "hits"],
    },
  ],
  // Second Base (2B)
  "2B": [
    {
      question: "Who's more likely to get on base?",
      stats: ["obp", "hits"],
    },
    {
      question: "Who's the better run scorer?",
      stats: ["runs", "stolenBases"],
    },
    {
      question: "Who's more likely to spark the offense?",
      stats: ["avg", "ops"],
    },
  ],
  // Third Base (3B)
  "3B": [
    {
      question: "Who's more likely to hit for power?",
      stats: ["homeRuns", "doubles"],
    },
    {
      question: "Who's the more consistent hitter?",
      stats: ["avg", "hits"],
    },
    {
      question: "Who's more likely to produce runs?",
      stats: ["rbi", "ops"],
    },
  ],
  // Shortstop (SS)
  SS: [
    {
      question: "Who's more likely to make things happen on offense?",
      stats: ["hits", "stolenBases"],
    },
    {
      question: "Who's the better all-around hitter?",
      stats: ["avg", "ops"],
    },
    {
      question: "Who's more likely to score runs?",
      stats: ["runs", "obp"],
    },
  ],
  // Left Field (LF)
  LF: [
    {
      question: "Who's the bigger power threat?",
      stats: ["homeRuns", "slg"],
    },
    {
      question: "Who's more likely to drive in runs?",
      stats: ["rbi", "ops"],
    },
    {
      question: "Who's the more consistent hitter?",
      stats: ["avg", "hits"],
    },
  ],
  // Center Field (CF)
  CF: [
    {
      question: "Who's more likely to create havoc on the bases?",
      stats: ["stolenBases", "runs"],
    },
    {
      question: "Who's the better overall offensive player?",
      stats: ["ops", "hits"],
    },
    {
      question: "Who's more likely to get on base?",
      stats: ["obp", "avg"],
    },
  ],
  // Right Field (RF)
  RF: [
    {
      question: "Who's the bigger power threat?",
      stats: ["homeRuns", "slg"],
    },
    {
      question: "Who's more likely to drive in runs?",
      stats: ["rbi", "ops"],
    },
    {
      question: "Who's the more complete hitter?",
      stats: ["avg", "obp"],
    },
  ],
} as Record<string, { question: string; stats: string[] }[]>;
