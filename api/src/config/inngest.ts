import { Inngest } from "inngest";
import { schemas } from "../types/inngest.types.js";
import env from "./env.js";

export const inngestClient = new Inngest({
  id: "clutch-api",
  schemas,
  eventKey: env.INNGEST_EVENT_KEY,
});

inngestClient.setEventKey(env.INNGEST_EVENT_KEY);
