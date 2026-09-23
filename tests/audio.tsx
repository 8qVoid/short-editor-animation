import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { readClip } from "../src/components/AudioEditor";
import { Timeline } from "../src/components/Timeline";
import { useEditorStore } from "../src/store/editorStore";
import "../src/styles.css";

function Fixture() {
  const [status, setStatus] = useState("Ready");
  const [media, setMedia] = useState("");
  useEffect(() => {
    const timer = setInterval(() => {
      const audio = document.querySelector("audio");
      if (audio) setMedia(`Media: ${audio.currentTime.toFixed(2)}s / ${audio.duration.toFixed(2)}s, ${audio.paused ? "paused" : "playing"}, ready ${audio.readyState}`);
    }, 100);
    return () => clearInterval(timer);
  }, []);
  const load = async () => {
    try {
      const rate = 8000, seconds = 4, samples = rate * seconds;
      const buffer = new ArrayBuffer(44 + samples * 2), data = new DataView(buffer);
      const text = (at: number, value: string) => [...value].forEach((char, i) => data.setUint8(at + i, char.charCodeAt(0)));
      text(0, "RIFF"); data.setUint32(4, 36 + samples * 2, true); text(8, "WAVE"); text(12, "fmt ");
      data.setUint32(16, 16, true); data.setUint16(20, 1, true); data.setUint16(22, 1, true); data.setUint32(24, rate, true);
      data.setUint32(28, rate * 2, true); data.setUint16(32, 2, true); data.setUint16(34, 16, true); text(36, "data"); data.setUint32(40, samples * 2, true);
      for (let i = 0; i < samples; i++) data.setInt16(44 + i * 2, Math.sin(i / rate * Math.PI * 880) * 300, true);
      const clip = await readClip(new Blob([buffer], { type: "audio/wav" }), "Test tone", 0);
      useEditorStore.getState().addAudio(clip);
      setStatus(`Decoded ${clip.duration.toFixed(2)} seconds`);
    } catch (error) { setStatus(String(error)); }
  };
  return <div style={{ background: "white", minHeight: "100vh", padding: 16 }}><h1>Audio playback checks</h1><button onClick={load}>Load test audio</button><p role="status">{status}</p><output>{media}</output><Timeline /></div>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
