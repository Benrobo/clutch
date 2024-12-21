import { TranslationServiceClient } from "@google-cloud/translate";
import env from "./env.js";

const googleTranslate = new TranslationServiceClient({
  //   apiKey: env.GOOGLE_API_KEY,
  keyFile: env.GOOGLE_SERVICE_ACCOUNT_KEY,
});

export default googleTranslate;
