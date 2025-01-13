import * as zod from "zod";

export const AddUserPreferencesSchema = zod.object({
  teams: zod.array(zod.number()),
  players: zod.array(zod.number()),
});

export const GetTeamRostersSchema = zod.object({
  teamIds: zod.array(zod.number()).min(1, "At least one team ID is required"),
});

export const AIChatConversationSchema = zod.object({
  message: zod.string().min(1, "Message is required"),
});

export const CreateMatchupSchema = zod.object({
  challengerId: zod.string().min(1, "Challenger ID is required"),
  opponentId: zod.string().min(1, "Opponent ID is required"),
  challengerTeamId: zod.number().min(1, "Challenger Team ID is required"),
  opponentTeamId: zod.number().min(1, "Opponent Team ID is required"),
  position: zod.string().min(1, "Position is required"),
  season: zod.number().min(1, "Season is required"),
});
