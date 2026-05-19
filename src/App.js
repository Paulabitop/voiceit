import { useState, useRef, useEffect, useCallback } from "react";

const MODEL = "claude-sonnet-4-20250514";

const loadJsPDF = () =>
  new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = reject;
    document.head.appendChild(s);
  });

const G = {
  bg: "#0D0D0D",
  surface: "#161616",
  text: "#E8DDD0",
  muted: "#7A7060",
  orange: "#FF6600",
  border: "#2A2A2A",
};

export default function VoiceToSiteReport() {
  const [phase, setPhase] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [installable, setInstallable] = useState(false);
  const recognitionRef = useRef(null);
  const installEventRef = useRef(null);

  useEffect(() => {
    // Check for PWA install prompt
    const beforeInstallPromptHandler = (e) => {
      e.preventDefault();
      installEventRef.current = e;
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

    // Remove the listener on cleanup
    return () => window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
  }, []);

  const startRecording = useCallback(() => {
    setError("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition requires Chrome or Edge browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    rec.onresult = (event) => {
      let final = "",
        interim = "";
      Array.from(event.results).forEach((result) => {
        result.isFinal ? (final += result[0].transcript) : (interim += result[0].transcript);
      });
      setTranscript(final);
    };
    rec.onerror = (err) => {
      setError(`Microphone error: ${err.error}`);
      setPhase("idle");
    };
    rec.start();
    recognitionRef.current = rec;
    setPhase("recording");
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setPhase("idle");
  }, []);

  const generateReport = async () => {
    // Placeholder for report generation logic
    console.log("Generate report");
    setPhase("done");
  };

  const installPWA = () => {
    installEventRef.current?.prompt();
    installEventRef.current = null;
    setInstallable(false);
  };

  return (
    <div style={{ backgroundColor: G.bg, color: G.text, minHeight: "100vh", padding: "20px" }}>
      {installable && <button onClick={installPWA}>Install App</button>}

      {phase === "idle" && (
        <div>
          <h1>Welcome to Voice-to-Site</h1>
          <button onClick={startRecording} style={{ padding: "10px", backgroundColor: G.orange, border: "none" }}>
            Start Recording
          </button>
        </div>
      )}

      {phase === "recording" && (
        <div>
          <h1>Recording...</h1>
          <button onClick={stopRecording} style={{ padding: "10px", backgroundColor: G.muted, border: "none" }}>
            Stop
          </button>
        </div>
      )}

      {phase === "done" && <div>Report generated: {JSON.stringify(report)}</div>}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}