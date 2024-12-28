import dotenv from "dotenv";
dotenv.config();

export const IN_DEV = process.env.NODE_ENV === "development";

export const ENABLE_MAIL_SENDING = false;

const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  API_URL: process.env.API_URL || "http://localhost:8050/api",
  MAIL_FROM: process.env.MAIL_FROM!,
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
  // GOOGLE AUTH
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URI!,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY!,
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY!,
  // FIREBASE
  FIREBASE: {
    API_KEY: process.env.FIREBASE_API_KEY!,
    AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN!,
    PROJECT_ID: process.env.FIREBASE_PROJECT_ID!,
    STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET!,
    MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID!,
    APP_ID: process.env.FIREBASE_APP_ID!,
    MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID!,
  },
  // GOOGLE GEMINI
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  REDIS_URL: process.env.REDIS_URL!,
  EXA_AI_API_KEY: process.env.EXA_AI_API_KEY!,
  // huggingface token
  HF_TOKEN: process.env.HF_TOKEN!,

  // JINA-AI
  JINA_API_KEY: process.env.JINA_API_KEY!,
};

export default env;
