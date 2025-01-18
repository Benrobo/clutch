import * as zod from "zod";

export const AddUserPreferencesSchema = zod.object({
  body: zod.object({
    teams: zod.array(zod.number()),
    players: zod.array(zod.number()).optional(),
  }),
});

export const GetTeamRostersSchema = zod.object({
  body: zod.object({
    teamIds: zod.array(zod.number()).min(1, "At least one team ID is required"),
  }),
});

export const AIChatConversationSchema = zod.object({
  body: zod.object({
    message: zod.string().min(1, "Message is required"),
  }),
});

export const CreateMatchupSchema = zod.object({
  body: zod.object({
    challengerId: zod.number().min(1, "Challenger ID is required"),
    opponentId: zod.number().min(1, "Opponent ID is required"),
    challengerTeamId: zod.number().min(1, "Challenger Team ID is required"),
    opponentTeamId: zod.number().min(1, "Opponent Team ID is required"),
    position: zod.string().min(1, "Position is required"),
    season: zod.number().min(1, "Season is required"),
  }),
});

export const GetTeamPlayersSchema = zod.object({
  params: zod.object({
    teamId: zod.string().transform((val) => parseInt(val)),
  }),
});

export const ProcessLastMessageSchema = zod.object({
  body: zod.object({
    last_message: zod.string().min(1, "Message is required"),
    pbId: zod.string().min(1, "Playback ID is required"),
  }),
});
