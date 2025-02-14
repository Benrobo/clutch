import { $Enums, Prisma } from "@prisma/client";
import { PlaySummary } from "../scripts/video-processing/generateVideoSummary.js";

export interface DBLeague {
  id: number;
  name: string;
  abbreviation: string;
}

export interface DBGameDecision {
  winner: {
    id: number;
    fullName: string;
  };
  loser: {
    id: number;
    fullName: string;
  };
}

export interface CreateGameInput {
  id: number;
  date: string;
  home_team_id: number;
  away_team_id: number;
  status: string;
  season: number;
  game_type: string;
  decisions: DBGameDecision;
}

export interface CreateTeamInput {
  id: number;
  name: string;
  abbreviation: string;
  league: DBLeague;
  logo_url: string;
}

interface DBPlayerStats {
  batSide: {
    code: string;
    description: string;
  };
  pitchHand: {
    code: string;
    description: string;
  };
}

export interface DBTranscriptData {
  text: string;
  start: number;
  end: number;
  confidence: number;
}

export enum SupportedTranslationsEnum {
  Spanish = "es",
  Japanese = "ja",
  Korean = "ko",
  ChineseSimplified = "zh",
  ChineseTraditional = "zh-TW",
  French = "fr",
  Portuguese = "pt",
  Italian = "it",
  Dutch = "nl",
  Tagalog = "tl",
  German = "de",
  Nahuatl = "nah",
}

export type SupportedTranslations =
  | "en" // English
  | "es" // Spanish
  | "ja" // Japanese
  | "ko" // Korean
  | "zh" // Chinese (Simplified)
  | "zh-TW" // Chinese (Traditional)
  | "fr" // French
  | "pt" // Portuguese
  | "it" // Italian
  | "nl" // Dutch
  | "tl" // Tagalog
  | "de" // German
  | "nah"; // Nahuatl

export type DBTranslatedTranscriptData = {
  [K in SupportedTranslations]?: DBTranscriptData;
};

export interface CreatePlayersInput {
  id: number;
  team_id: number;
  fullname: string;
  age: number;
  height: string;
  gender: string;
  verified: boolean;
  position: string;
  profile_pic: string;
  stats: DBPlayerStats;
}

export interface DBPlaybackOutput {
  id: string;
  highlight_id: string;
  title: string;
  description: string;
  metadata?: Prisma.JsonValue;
  mlb_video_url: string;
  mlb_video_duration: string;
  processed_video_url: string | null;
  processed_video_duration: string | null;
  orientation: $Enums.VideoOrientation;
  transcript?: Prisma.JsonValue;
  translated_transcript?: Prisma.JsonValue;
  subtitles: string | null;
  summary: PlaySummary;
}
