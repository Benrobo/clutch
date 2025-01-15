
export const GAME_SEASONS = [
	{
		label: '2024',
		value: '2024'
	},
	{
		label: '2023',
		value: '2023'
	},
	{
		label: '2022',
		value: '2022'
	}
];

export const TEAMS_LOGOS_REQUIRING_WHITE_BACKGROUND = [
	"tigers",
	"athletics",
	"twins",
	"rockies"
]



export const BASE_PLAYER_STATS = ["gamesPlayed"];

export const PLAYER_OF_THE_DAY_POSITION_STATS_MAP = {
  // Pitcher
  P: [
    ...BASE_PLAYER_STATS,
    "era",
    "strikeOuts",
    "whip",
  ],
  // Catcher
  C: [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
  // First Base
  "1B": [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
  // Second Base
  "2B": [
    ...BASE_PLAYER_STATS,
    "avg",
    "rbi",
    "fieldingPercentage",
  ],
  // Third Base
  "3B": [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
  // Shortstop
  SS: [
    ...BASE_PLAYER_STATS,
    "avg",
    "rbi",
    "fieldingPercentage",
  ],
  // Left Field
  LF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
  // Center Field
  CF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
  // Right Field
  RF: [
    ...BASE_PLAYER_STATS,
    "avg",
    "homeRuns",
    "rbi",
  ],
} as Record<string, any[]>;