import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

// Determine allowed origins for socket connections. In development the
// frontend runs on a Vite dev server (default port 5173). If ENV.CLIENT_URL
// is not provided, fall back to common local origins so sockets aren't
// blocked by CORS during local development.
const fallbackOrigins = ["http://localhost:5173", "http://localhost:3000"]; // common dev ports
const allowedOrigins = ENV.CLIENT_URL ? [ENV.CLIENT_URL] : fallbackOrigins;

if (!ENV.CLIENT_URL) {
  console.warn(
    "Warning: CLIENT_URL is not set. Falling back to local origins for socket CORS:",
    allowedOrigins
  );
}

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// we will use this function to check if the user is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// this is for storig online users
const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // with socket.on we listen for events from clients
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
