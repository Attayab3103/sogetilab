import { useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function LiveTranscription() {
  const [transcript, setTranscript] = useState("");
  useSocket((text) => setTranscript((prev) => prev + " " + text));

  // Example: send dummy audio chunk (replace with real audio capture)
  // sendAudioChunk(audioBuffer);

  return (
    <div>
      <h2>Live Transcript</h2>
      <div>{transcript}</div>
    </div>
  );
}
