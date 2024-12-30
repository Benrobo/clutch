import { createExaClient } from "./exa-js-client.js";
import env from "./env.js";

const exa = createExaClient(env.EXA_AI_API_KEY);

export default exa;
