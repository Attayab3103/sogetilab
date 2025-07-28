import { Server as SocketIOServer } from "socket.io";
import http from "http";
import type { Express } from "express";

export function setupWebSocket(app: Express, server: http.Server) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("WebSocket client connected:", socket.id);

    // Emit a ready event to confirm connection
    socket.emit("ready", { message: "WebSocket connection established" });

    // Heartbeat: respond to ping from client
    socket.on("ping", () => {
      socket.emit("pong");
    });

    socket.on("audio_chunk", (data) => {
      // TODO: Handle audio data (send to ASR, emit transcript, etc.)
      // Example: io.to(socket.id).emit("transcript", { text: "transcribed text" });
    });

    socket.on("disconnect", () => {
      console.log("WebSocket client disconnected:", socket.id);
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
    });
  });

  return io;
}
