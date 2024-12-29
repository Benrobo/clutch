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
