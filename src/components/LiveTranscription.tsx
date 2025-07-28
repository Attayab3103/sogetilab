import { useState } from "react";
import { Mic, PauseCircle, PlayCircle, XCircle } from "lucide-react";

export function LiveTranscription() {
  const [transcript, setTranscript] = useState<string>("");

  return (
    <div className="w-full space-y-2 p-4">
      <h2>Live Transcript</h2>
      <div>{transcript}</div>
    </div>
  );
}
