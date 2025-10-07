import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json({ limit: "5mb" })); // req.body
// Allow cross-origin requests from the frontend. If CLIENT_URL isn't set in
// the environment (common during quick local dev), fall back to Vite's
// default dev origin so the frontend can call the API and connect sockets.
const fallbackClientOrigins = ["http://localhost:5173", "http://localhost:3000"];
const clientOrigins = ENV.CLIENT_URL ? [ENV.CLIENT_URL] : fallbackClientOrigins;

if (!ENV.CLIENT_URL) {
  console.warn("Warning: CLIENT_URL is not set. Falling back to local origins for CORS:", clientOrigins);
}

app.use(cors({ origin: clientOrigins, credentials: true }));
app.use(cookieParser());

// Development-only debug endpoint to inspect runtime config
app.get("/api/debug", (req, res) => {
  const fallbackClientOrigins = ["http://localhost:5173", "http://localhost:3000"];
  const clientOrigins = ENV.CLIENT_URL ? [ENV.CLIENT_URL] : fallbackClientOrigins;
  res.json({
    nodeEnv: ENV.NODE_ENV || "development",
    clientOrigins,
    arcjetKeyPresent: !!ENV.ARCJET_KEY,
    jwtSecretPresent: !!ENV.JWT_SECRET,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
