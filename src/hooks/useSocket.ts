import { useEffect, useRef } from "react";
import io from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export function useSocket(onTranscript: (text: string) => void) {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("WebSocket connected:", socket.id);
    });

    socket.on("ready", (data: any) => {
      console.log("WebSocket server ready:", data);
    });

    socket.on("transcript", (data: { text?: string }) => {
      if (data?.text) onTranscript(data.text);
    });

    socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });

    socket.on("error", (err: unknown) => {
      console.error("WebSocket error:", err);
    });

    // Heartbeat: send ping every 20 seconds
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, 20000);

    return () => {
      socket.disconnect();
      clearInterval(pingInterval);
    };
  }, [onTranscript]);

  // Example: send audio chunk
  const sendAudioChunk = (chunk: ArrayBuffer) => {
    socketRef.current?.emit("audio_chunk", chunk);
  };

  // Expose socket instance for advanced use (e.g., AI answer streaming)
  return { sendAudioChunk, socket: socketRef };
}
