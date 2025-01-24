import Redis from "ioredis";
import env from "./env.js";

const connString = env.REDIS_URL;

const redis = new Redis(connString, {
  maxRetriesPerRequest: null, // Remove retry limit
  enableTLSForSentinelMode: true, // Required for Upstash
  // tls: {}, // Change from boolean to empty object
});

redis.on("error", (err) => {
  if (err.message.includes("MaxRetriesPerRequestError")) {
    // Handle or ignore this specific error
  } else {
    console.error("Redis error:", err);
  }
});

export default redis;
