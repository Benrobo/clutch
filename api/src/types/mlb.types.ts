/** Type of game: Regular season (R), Playoffs (P), Spring training (S), Exhibition (E) */
export type GameType = "R" | "P" | "S" | "E";

/** Current state of the game: Finished (Final), In progress (Live), or Not started (Preview) */
export type AbstractGameState = "Final" | "Live" | "Preview";

/** Whether game is played during day or night */
export type DayNight = "day" | "night";

/** When teams play two games in one day: No (N), Yes (Y), Split doubleheader (S) */
export type DoubleHeader = "N" | "Y" | "S";

/** Player's All-Star status: No (N) or Yes (Y) */
export type AllStarStatus = "N" | "Y";

/** League info (American League or National League) */
export interface MLBLeague {
  id: number;
  name: string;
  link: string;
  abbreviation?: string;
}

/** Division within a league (like AL East or NL West) */
export interface MLBDivision {
  id: number;
  name: string;
  link: string;
}

/** Sport details (always baseball in MLB) */
export interface MLBSport {
  id: number;
  name: string;
  link: string;
}

/** Baseball stadium or ballpark */
export interface MLBVenue {
  id: number;
  name: string;
  link: string;
}

/** Player's position on field (pitcher, catcher, etc.) */
export interface MLBPlayerPosition {
  code: string;
  name: string;
  type: string;
  abbreviation: string;
}

/** Which side a player bats or pitches from */
export interface MLBBatPitchSide {
  code: "L" | "R" | "S";
  description: "Left" | "Right" | "Switch";
}

/** All player details (stats, position, personal info) */
export interface MLBPlayer {
  id: number;
  fullName: string;
  link: string;
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentAge: number;
  birthCity: string;
  birthStateProvince?: string;
  birthCountry: string;
  height: string;
  weight: number;
  active: boolean;
  primaryPosition: MLBPlayerPosition;
  useName: string;
  useLastName: string;
  boxscoreName: string;
  gender: string;
  isPlayer: boolean;
  isVerified: boolean;
  draftYear?: number;
  mlbDebutDate?: string;
  batSide: MLBBatPitchSide;
  pitchHand: MLBBatPitchSide;
  nameFirstLast: string;
  nameSlug: string;
  firstLastName: string;
  lastFirstName: string;
  lastInitName: string;
  initLastName: string;
  fullFMLName: string;
  fullLFMName: string;
  strikeZoneTop: number;
  strikeZoneBottom: number;
  profilePicture: {
    small: string; // 60px width
    medium: string; // 213px width
    large: string; // 426px width
  };
}

/** Timing and event tracking for a game */
export interface MLBGameMetaData {
  wait: number;
  timeStamp: string;
  gameEvents: string[];
  logicalEvents: string[];
}

/** Basic game details like ID and season */
export interface MLBGameInfo {
  pk: number;
  type: string;
  doubleHeader: string;
  id: string;
  gamedayType: string;
  tiebreaker: string;
  gameNumber: number;
  calendarEventID: string;
  season: string;
  seasonDisplay: string;
}

/** When the game starts and schedule info */
export interface MLBGameDateTime {
  dateTime: string;
  originalDate: string;
  officialDate: string;
  dayNight: DayNight;
  time: string;
  ampm: string;
}

/** How well a team is doing (wins/losses) */
export interface MLBTeamRecord {
  gamesPlayed: number;
  wildCardGamesBack: string;
  leagueGamesBack: string;
  springLeagueGamesBack: string;
  sportGamesBack: string;
  divisionGamesBack: string;
  conferenceGamesBack: string;
  leagueRecord: {
    wins: number;
    losses: number;
    ties: number;
    pct: string;
  };
  records: Record<string, unknown>;
  divisionLeader: boolean;
  wins: number;
  losses: number;
  winningPercentage: string;
}

/** Everything about a team (name, league, venue) */
export interface MLBTeamDetail {
  springLeague?: MLBLeague;
  allStarStatus?: AllStarStatus;
  id: number;
  name: string;
  link: string;
  season?: number;
  venue: MLBVenue;
  springVenue?: MLBVenue;
  teamCode?: string;
  fileCode?: string;
  abbreviation?: string;
  teamName?: string;
  locationName?: string;
  firstYearOfPlay?: string;
  league?: MLBLeague;
  division?: MLBDivision;
  sport?: MLBSport;
  shortName?: string;
  record?: MLBTeamRecord;
  franchiseName?: string;
  clubName?: string;
  active?: boolean;
  logo?: string;
}

/** Current game state (in progress, final, etc.) */
export interface MLBGameStatus {
  abstractGameState: AbstractGameState;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
  abstractGameCode?: string;
  reason?: string;
}

/** What happened in a specific play */
export interface MLBLiveGamePlay {
  result: {
    type: string;
    event: string;
    eventType: string;
    description: string;
    rbi: number;
    awayScore: number;
    homeScore: number;
  };
  about: {
    atBatIndex: number;
    halfInning: "top" | "bottom";
    inning: number;
    startTime: string;
    endTime: string;
    isComplete: boolean;
    isScoringPlay: boolean;
  };
  count: {
    balls: number;
    strikes: number;
    outs: number;
  };
  matchup: {
    batter: {
      id: number;
      fullName: string;
      link: string;
    };
    pitcher: {
      id: number;
      fullName: string;
      link: string;
    };
  };
}

/** All live game information (score, plays, stats) */
// Game Linescore Types
interface MLBInningStats {
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

interface MLBInning {
  num: number;
  ordinalNum: string;
  home: MLBInningStats;
  away: MLBInningStats;
}

interface MLBTeamScore {
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

interface MLBDefensePlayer {
  id: number;
  fullName: string;
  link: string;
}

interface MLBDefense {
  pitcher: MLBDefensePlayer;
  catcher: MLBDefensePlayer;
  first: MLBDefensePlayer;
  second: MLBDefensePlayer;
  third: MLBDefensePlayer;
  shortstop: MLBDefensePlayer;
  left: MLBDefensePlayer;
  center: MLBDefensePlayer;
  right: MLBDefensePlayer;
  batter: MLBDefensePlayer;
  onDeck: MLBDefensePlayer;
  inHole: MLBDefensePlayer;
  battingOrder: number;
  team: {
    id: number;
    name: string;
    link: string;
  };
}

interface MLBLinescore {
  currentInning: number;
  currentInningOrdinal: string;
  inningState: string;
  inningHalf: string;
  isTopInning: boolean;
  scheduledInnings: number;
  innings: MLBInning[];
  teams: {
    home: MLBTeamScore;
    away: MLBTeamScore;
  };
  defense: MLBDefense;
  offense: {
    batter: MLBDefensePlayer;
    onDeck: MLBDefensePlayer;
    inHole: MLBDefensePlayer;
    pitcher: MLBDefensePlayer;
    battingOrder: number;
    team: {
      id: number;
      name: string;
      link: string;
    };
  };
  balls: number;
  strikes: number;
  outs: number;
}

// Boxscore Types
interface MLBBattingStats {
  flyOuts: number;
  groundOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  hits: number;
  atBats: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
  stolenBases: number;
  plateAppearances: number;
  totalBases: number;
  rbi: number;
  leftOnBase: number;
  sacBunts: number;
  sacFlies: number;
}

interface MLBPitchingStats {
  inningsPitched: string;
  hits: number;
  runs: number;
  earnedRuns: number;
  baseOnBalls: number;
  strikeOuts: number;
  homeRuns: number;
  pitchesThrown: number;
  strikes: number;
  strikePercentage: string;
  era: string;
  whip: string;
  battersFaced: number;
}

interface MLBBoxscore {
  teams: {
    home: {
      team: {
        id: number;
        name: string;
        link: string;
      };
      teamStats: {
        batting: MLBBattingStats;
        pitching: MLBPitchingStats;
      };
      players: Record<
        string,
        {
          person: {
            id: number;
            fullName: string;
            link: string;
          };
          stats: {
            batting: Partial<MLBBattingStats>;
            pitching: Partial<MLBPitchingStats>;
          };
          position: {
            code: string;
            name: string;
            type: string;
            abbreviation: string;
          };
        }
      >;
    };
    away: {
      team: {
        id: number;
        name: string;
        link: string;
      };
      teamStats: {
        batting: MLBBattingStats;
        pitching: MLBPitchingStats;
      };
      players: Record<
        string,
        {
          person: {
            id: number;
            fullName: string;
            link: string;
          };
          stats: {
            batting: Partial<MLBBattingStats>;
            pitching: Partial<MLBPitchingStats>;
          };
          position: {
            code: string;
            name: string;
            type: string;
            abbreviation: string;
          };
        }
      >;
    };
  };
}

interface MLBDecisions {
  winner: {
    id: number;
    fullName: string;
    link: string;
  };
  loser: {
    id: number;
    fullName: string;
    link: string;
  };
  save: {
    id: number;
    fullName: string;
    link: string;
  };
}

export interface MLBLiveGameData {
  copyright: string;
  gamePk: number;
  link: string;
  metaData: MLBGameMetaData;
  gameData: {
    game: MLBGameInfo;
    datetime: MLBGameDateTime;
    status: MLBGameStatus;
    teams: {
      away: MLBTeamDetail;
      home: MLBTeamDetail;
    };
    players: Record<string, MLBPlayer>;
    venue: MLBVenue;
    weather?: {
      condition: string;
      temp: number;
      wind: string;
    };
  };
  liveData: {
    plays: {
      allPlays: MLBLiveGamePlay[];
      currentPlay?: MLBLiveGamePlay;
      scoringPlays: number[];
      playsByInning: Array<{
        startIndex: number;
        endIndex: number;
        top: number[];
        bottom: number[];
      }>;
    };
    linescore: MLBLinescore;
    boxscore: MLBBoxscore;
    decisions: MLBDecisions;
    leaders: {
      hitDistance: {};
      hitSpeed: {};
      pitchSpeed: {};
    };
  };
}

/** Team info for a specific game */
export interface MLBGameTeam {
  leagueRecord: MLBTeamRecord;
  score: number;
  team: MLBTeamDetail;
  isWinner: boolean;
  splitSquad: boolean;
  seriesNumber?: number;
}

/** All information about a game */
export interface MLBGame {
  gamePk: number;
  gameGuid: string;
  link: string;
  gameType: GameType;
  season: string;
  gameDate: string;
  officialDate: string;
  status: MLBGameStatus;
  teams: {
    away: MLBGameTeam;
    home: MLBGameTeam;
  };
  venue: MLBVenue;
  content: {
    link: string;
  };
  isTie: boolean;
  gameNumber: number;
  publicFacing: boolean;
  doubleHeader: DoubleHeader;
  gamedayType: string;
  tiebreaker: string;
  calendarEventID: string;
  seasonDisplay: string;
  dayNight: DayNight;
  scheduledInnings: number;
  reverseHomeAwayStatus: boolean;
  inningBreakLength: number;
  gamesInSeries: number;
  seriesGameNumber: number;
  seriesDescription: string;
  recordSource: string;
  ifNecessary: string;
  ifNecessaryDescription: string;
}

/** Video clip of game action */
export interface MLBHighlight {
  id: string;
  title: string;
  description: string;
  duration: string;
  mediaPlaybackId: string;
  playbacks: Array<{
    name: string;
    url: string;
    playbackId: string;
  }>;
  keywords: string[];
}

/** Game videos and highlights */
export interface MLBGameContent {
  copyright: string;
  link: string;
  highlights: {
    highlights: {
      items: MLBHighlight[];
    };
  };
  editorial?: {
    preview: Record<string, unknown>;
    articles: null;
    recap?: {
      mlb?: {
        type: string;
        state: string;
        date: string;
        title?: string;
        body: string;
        headline: string;
        seoTitle: string;
        slug: string;
        blurb: string;
        keywordsAll: {
          type?: string;
          value: string;
          displayName: string;
        }[];
        keywords?: string[];
        keywordsDisplay: any[];
        image: {
          title: string;
          altText: string | null;
          templateUrl: string;
          cuts: {
            aspectRatio: string;
            width: number;
            height: number;
            src: string;
            at2x: string;
            at3x: string;
          }[];
        };
        seoKeywords: string;
        url: string;
        contributors?: {
          name: string;
        }[];
        photo?: {
          title: string;
          altText: string | null;
          templateUrl: string;
          cuts: {
            aspectRatio: string;
            width: number;
            height: number;
            src: string;
            at2x: string;
            at3x: string;
          }[];
        };
        media: {
          type: "video" | "image";
          state: string;
          date: string;
          id: string;
          headline: string;
          seoTitle: string;
          slug: string;
          blurb: string;
          keywordsAll: {
            type?: string;
            value: string;
            displayName: string;
          }[];
          keywordsDisplay: any[];
          image: {
            title: string;
            altText: string | null;
            templateUrl: string;
            cuts: {
              aspectRatio: string;
              width: number;
              height: number;
              src: string;
              at2x: string;
              at3x: string;
            }[];
          };
          noIndex: boolean;
          mediaPlaybackId: string;
          title: string;
          description: string;
          duration: string;
          guid: string;
          mediaPlaybackUrl: string;
          playbacks: {
            name: string;
            url: string;
            width: string;
            height: string;
          }[];
        };
      };
    };
  };
  media?: {
    epg: Array<{
      title: string;
      items: Array<{
        id: number;
        mediaState: string;
        mediaPlaybackId: string;
        callLetters: string;
      }>;
    }>;
  };
}

/** Games happening on a specific date */
export interface MLBScheduleDate {
  date: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  games: MLBGame[];
  events: any[];
}

/** List of all scheduled games */
export interface MLBScheduleResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: MLBScheduleDate[];
}

/** Basic team stats (wins/losses) */
export interface MLBTeamRecord {
  wins: number;
  losses: number;
  pct: string;
}

/** List of all teams */
export interface MLBTeamsResponse {
  copyright: string;
  teams: MLBTeamDetail[];
}

/** Settings for MLB API calls */
export interface MLBAPIConfig {
  baseUrl?: string;
  sportId?: number;
  season?: number;
  gameType?: GameType;
}

/** Response containing player information */
export interface MLBPlayerResponse {
  copyright: string;
  people: MLBPlayer[];
}

/** Player information in a team roster */
export interface MLBRosterPlayer {
  person: {
    id: number;
    fullName: string;
    link: string;
  };
  jerseyNumber: string;
  position: MLBPlayerPosition;
  status: {
    code: string;
    description: string;
  };
  parentTeamId: number;
}

/** Response containing team roster information */
export interface MLBRosterResponse {
  copyright: string;
  roster: MLBRosterPlayer[];
  link: string;
  teamId: number;
  rosterType: string;
}

/** Position-specific stat group types */
export type MLBStatGroup =
  | "pitcher"
  | "catching"
  | "infield"
  | "outfield"
  | "hitting";

/** Base stats interface with common fields */
export interface MLBBaseStats {
  gamesPlayed: number;
  avg: string;
  obp: string;
  slg: string;
  ops: string;
}

/** Pitcher-specific stats */
export interface MLBPitcherStats extends MLBBaseStats {
  gamesStarted: number;
  groundOuts: number;
  airOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  atBats: number;
  era: string;
  inningsPitched: string;
  wins: number;
  losses: number;
  saves: number;
  saveOpportunities: number;
  holds: number;
  blownSaves: number;
  whip: string;
  battersFaced: number;
  gamesPitched: number;
  completeGames: number;
  shutouts: number;
  strikes: number;
  strikePercentage: string;
  wildPitches: number;
  pickoffs: number;
}

/** Position player hitting stats */
export interface MLBHitterStats extends MLBBaseStats {
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  baseOnBalls: number;
  strikeOuts: number;
  stolenBases: number;
  caughtStealing: number;
  hitByPitch: number;
  groundIntoDoublePlay: number;
  totalBases: number;
}

/** Catcher-specific stats */
export interface MLBCatcherStats extends MLBHitterStats {
  assists: number;
  putOuts: number;
  errors: number;
  passedBalls: number;
  catcherStolenBases: number;
  catcherCaughtStealing: number;
  throwingErrors: number;
}

/** Infielder-specific stats */
export interface MLBInfielderStats extends MLBHitterStats {
  assists: number;
  putOuts: number;
  errors: number;
  doublePlays: number;
  fieldingPercentage: string;
  rangeFactorPerGame: string;
}

/** Outfielder-specific stats */
export interface MLBOutfielderStats extends MLBHitterStats {
  assists: number;
  putOuts: number;
  errors: number;
  doublePlays: number;
  fieldingPercentage: string;
  rangeFactorPerGame: string;
}

/** Union type for all possible stats */
export type MLBPositionStats =
  | MLBPitcherStats
  | MLBHitterStats
  | MLBCatcherStats
  | MLBInfielderStats
  | MLBOutfielderStats;

/** Stats response from MLB API */
export interface MLBPlayerStatsResponse {
  copyright: string;
  stats: Array<{
    type: {
      displayName: string;
    };
    group: {
      displayName: string;
    };
    splits: Array<{
      season: string;
      stat: MLBPositionStats;
      team: {
        id: number;
        name: string;
        link: string;
      };
      player: {
        id: number;
        fullName: string;
        link: string;
      };
    }>;
  }>;
}
