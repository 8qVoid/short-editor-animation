import { Download } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../store/editorStore";

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportPreview = async () => {
    setError("");
    const canvas = document.querySelector<HTMLCanvasElement>(".canvas-wrap canvas");
    const videoStream = canvas?.captureStream?.(useEditorStore.getState().project.canvas.fps);
    if (!canvas || !videoStream || typeof MediaRecorder === "undefined") {
      setError("Export is not available in this browser. Try Chrome or Edge.");
      return;
    }
    setBusy(true);
    let audioContext: AudioContext | undefined;
    let stream: MediaStream | undefined;
    let timeout = 0;
    const sources: AudioBufferSourceNode[] = [];
    try {
      const store = useEditorStore.getState();
      const total = store.project.shots.reduce((sum, shot) => sum + shot.duration, 0);
      const audioClips = (store.project.audioClips ?? []).filter(clip => !clip.muted && clip.start < total && clip.duration > 0);
      let audioDestination: MediaStreamAudioDestinationNode | undefined;
      if (audioClips.length) {
        if (!window.AudioContext) throw new Error("Audio export is not supported in this browser. Try Chrome or Edge.");
        audioContext = new AudioContext();
        await audioContext.resume();
        audioDestination = audioContext.createMediaStreamDestination();
        for (const clip of audioClips) {
          const response = await fetch(clip.source);
          const buffer = await audioContext.decodeAudioData(await response.arrayBuffer());
          const source = audioContext.createBufferSource();
          const gain = audioContext.createGain();
          source.buffer = buffer;
          gain.gain.value = clip.volume;
          source.connect(gain);
          gain.connect(audioDestination);
          sources.push(source);
        }
      }
      stream = new MediaStream([...videoStream.getVideoTracks(), ...(audioDestination?.stream.getAudioTracks() ?? [])]);
      const type = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(MediaRecorder.isTypeSupported);
      const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: Blob[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      await new Promise<void>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("Export failed while recording the preview."));
        recorder.onstop = () => resolve();
        recorder.onstart = () => {
          const audioStartsAt = audioContext ? audioContext.currentTime + .12 : 0;
          for (let index = 0; index < audioClips.length; index++) {
            const clip = audioClips[index];
            const duration = Math.min(clip.duration, total - clip.start, clip.sourceDuration - clip.trimStart);
            if (duration > 0) sources[index].start(audioStartsAt + clip.start, clip.trimStart, duration);
          }
        };
        store.seek(0);
        recorder.start(250);
        store.setPlaying(true);
        timeout = window.setTimeout(() => {
          useEditorStore.getState().setPlaying(false);
          if (recorder.state !== "inactive") recorder.stop();
        }, Math.ceil(total * 1000) + 300);
      });
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${useEditorStore.getState().project.name.replace(/\s+/g, "-").toLowerCase()}-preview.webm`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (reason) {
      useEditorStore.getState().setPlaying(false);
      setError(reason instanceof Error ? reason.message : "Export failed.");
    } finally {
      window.clearTimeout(timeout);
      sources.forEach(source => { try { source.stop(); } catch { /* A completed source is already stopped. */ } });
      stream?.getTracks().forEach(track => track.stop());
      await audioContext?.close().catch(() => undefined);
      setBusy(false);
    }
  };

  return (
    <>
      <button disabled={busy} onClick={() => void exportPreview()} title="Export a preview video">
        <Download size={17} /> {busy ? "Exporting" : "Export WebM"}
      </button>
      {error && <span role="alert" className="export-error">{error}</span>}
    </>
  );
}
