import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";

import { ENV } from "./env.js";

// If no ARCJET_KEY is provided (typical in local development), we should
// avoid blocking real requests. Use DRY_RUN so arcjet only logs decisions.
const liveMode = ENV.ARCJET_KEY ? "LIVE" : "DRY_RUN";

if (!ENV.ARCJET_KEY) {
  console.warn(
    "Warning: ARCJET_KEY is not set. Arcjet will run in DRY_RUN (log-only) mode for development."
  );
}

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: liveMode }),
    // Create a bot detection rule
    detectBot({
      mode: liveMode, // Blocks requests only in LIVE mode
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    slidingWindow({
      mode: liveMode,
      max: 100,
      interval: 60,
    }),
  ],
});

export default aj;
