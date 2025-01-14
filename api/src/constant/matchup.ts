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
} as const;

export const PLAYER_ENGAGEMENT_QUESTIONS = {
  // Pitcher (P)
  P: [
    {
      question: "Who’s the strikeout king?",
      stats: ["strikeOuts"],
    },
    {
      question: "Which pitcher is the hardest to score on?",
      stats: ["era"],
    },
    {
      question: "Who’s the most reliable arm on the mound?",
      stats: ["wins", "inningsPitched"],
    },
  ],
  // Catcher (C)
  C: [
    {
      question: "Who’s the best at stopping runners?",
      stats: ["caughtStealingPercentage"],
    },
    {
      question: "Which catcher hits the most home runs?",
      stats: ["homeRuns"],
    },
    {
      question: "Who’s the safest pair of hands behind the plate?",
      stats: ["fieldingPercentage"],
    },
  ],
  // First Base (1B)
  "1B": [
    {
      question: "Who’s the home run leader at first?",
      stats: ["homeRuns"],
    },
    {
      question: "Which first baseman gets the most hits?",
      stats: ["avg"],
    },
    {
      question: "Who’s the best at catching throws to first?",
      stats: ["fieldingPercentage"],
    },
  ],
  // Second Base (2B)
  "2B": [
    {
      question: "Who’s the best at turning double plays?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Which second baseman drives in the most runs?",
      stats: ["rbi"],
    },
    {
      question: "Who’s the fastest runner at second?",
      stats: ["stolenBases"],
    },
  ],
  // Third Base (3B)
  "3B": [
    {
      question: "Who’s the home run hitter at third?",
      stats: ["homeRuns"],
    },
    {
      question: "Which third baseman makes the fewest errors?",
      stats: ["fieldingPercentage"],
    },
    {
      question: "Who’s the best at making tough plays at third?",
      stats: ["fieldingPercentage", "assists"],
    },
  ],
  // Shortstop (SS)
  SS: [
    {
      question: "Who’s the best fielder at shortstop?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Which shortstop hits the most home runs?",
      stats: ["homeRuns"],
    },
    {
      question: "Who’s the most reliable arm at shortstop?",
      stats: ["fieldingPercentage", "assists"],
    },
  ],
  // Left Field (LF)
  LF: [
    {
      question: "Who’s the home run hitter in left field?",
      stats: ["homeRuns"],
    },
    {
      question: "Which left fielder gets the most hits?",
      stats: ["avg"],
    },
    {
      question: "Who’s the best at catching fly balls in left?",
      stats: ["fieldingPercentage"],
    },
  ],
  // Center Field (CF)
  CF: [
    {
      question: "Who’s the fastest runner in center field?",
      stats: ["stolenBases"],
    },
    {
      question: "Which center fielder hits the most home runs?",
      stats: ["homeRuns"],
    },
    {
      question: "Who’s the best at tracking down fly balls?",
      stats: ["fieldingPercentage"],
    },
  ],
  // Right Field (RF)
  RF: [
    {
      question: "Who’s the home run hitter in right field?",
      stats: ["homeRuns"],
    },
    {
      question: "Which right fielder has the strongest arm?",
      stats: ["fieldingPercentage", "assists"],
    },
    {
      question: "Who’s the best at driving in runs from right field?",
      stats: ["rbi"],
    },
  ],
} as const;
