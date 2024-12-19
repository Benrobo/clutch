import { Inngest } from "inngest";
import { schemas } from "../types/inngest.types.js";

export const inngestClient = new Inngest({ id: "clutch-api", schemas });
