import { Download } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "../store/editorStore";

export function ExportButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const exportPreview = async () => {
    setError("");
    const canvas = document.querySelector<HTMLCanvasElement>(".canvas-wrap canvas");
    const stream = canvas?.captureStream?.(useEditorStore.getState().project.canvas.fps);
    if (!canvas || !stream || typeof MediaRecorder === "undefined") {
      setError("Export is not available in this browser. Try Chrome or Edge.");
      return;
    }
    const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(MediaRecorder.isTypeSupported);
    const recorder = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    const chunks: Blob[] = [];
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    setBusy(true);
    try {
      await new Promise<void>((resolve, reject) => {
        recorder.onerror = () => reject(new Error("Export failed while recording the preview."));
        recorder.onstop = () => resolve();
        const store = useEditorStore.getState();
        const total = store.project.shots.reduce((sum, shot) => sum + shot.duration, 0);
        store.seek(0);
        store.setPlaying(true);
        recorder.start(250);
        window.setTimeout(() => {
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
      setError(reason instanceof Error ? reason.message : "Export failed.");
    } finally {
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
