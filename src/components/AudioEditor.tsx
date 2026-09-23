import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Upload, Volume2, VolumeX } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { AudioClip } from "../types/editor";

const maximumBytes = 25 * 1024 * 1024;

export async function readClip(blob: Blob, name: string, start: number): Promise<AudioClip> {
  if (blob.size === 0 || blob.size > maximumBytes) throw new Error("Choose an audio file smaller than 25 MB.");
  const context = new AudioContext();
  let duration: number;
  try { duration = (await context.decodeAudioData(await blob.arrayBuffer())).duration; }
  catch { throw new Error("This audio format could not be opened. Try MP3, WAV, M4A, OGG, or WebM."); }
  finally { await context.close(); }
  if (!Number.isFinite(duration) || duration <= .01) throw new Error("The audio has no usable duration.");
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The audio file could not be read."));
    reader.readAsDataURL(blob);
  });
  return { id: crypto.randomUUID(), name, source, sourceDuration: duration, start, trimStart: 0, duration, volume: 1, muted: false };
}

function AudioPlayback({ clip, onError }: { clip: AudioClip; onError: (message: string) => void }) {
  const ref = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = ref.current!;
    let pending = false;
    let failed = false;
    const sync = () => {
      const { playhead, playing } = useEditorStore.getState();
      const active = playing && playhead >= clip.start && playhead < clip.start + clip.duration && !clip.muted;
      const position = Math.max(clip.trimStart, Math.min(clip.trimStart + clip.duration, clip.trimStart + playhead - clip.start));
      audio.volume = clip.volume;
      if (audio.readyState && Math.abs(audio.currentTime - position) > .12) audio.currentTime = position;
      if (!active) { audio.pause(); failed = false; }
      else if (audio.paused && !pending && !failed) {
        pending = true;
        void audio.play().catch(() => { failed = true; onError("Audio playback was blocked or unavailable. Press Play again, or re-import the clip."); }).finally(() => { pending = false; if (!useEditorStore.getState().playing) audio.pause(); });
      }
    };
    audio.addEventListener("loadedmetadata", sync);
    const unsubscribe = useEditorStore.subscribe(sync);
    sync();
    return () => { unsubscribe(); audio.removeEventListener("loadedmetadata", sync); audio.pause(); };
  }, [clip, onError]);
  return <audio ref={ref} src={clip.source} preload="auto" hidden />;
}

export function AudioEditor() {
  const { project, addAudio, updateAudio, deleteAudio } = useEditorStore();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorder = useRef<MediaRecorder>();
  const stream = useRef<MediaStream>();
  const mounted = useRef(true);
  const input = useRef<HTMLInputElement>(null);
  const clips = project.audioClips ?? [];

  useEffect(() => { mounted.current = true; return () => {
    mounted.current = false;
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach(track => track.stop());
  }; }, []);
  useEffect(() => {
    if (!recording) return;
    const began = performance.now();
    const interval = window.setInterval(() => {
      const seconds = (performance.now() - began) / 1000;
      setElapsed(seconds);
      if (seconds >= 600 && recorder.current?.state === "recording") recorder.current.stop();
    }, 200);
    return () => clearInterval(interval);
  }, [recording]);

  const add = async (blob: Blob, name: string, start: number, projectId: string) => {
    setBusy(true);
    try {
      const clip = await readClip(blob, name, start);
      if (!mounted.current) return;
      if (useEditorStore.getState().project.id !== projectId) throw new Error("The project changed. Import this audio into the current project again.");
      const size = (useEditorStore.getState().project.audioClips ?? []).reduce((sum, item) => sum + item.source.length, 0);
      if (size + clip.source.length > maximumBytes * 3) throw new Error("This project has reached its audio size limit. Remove unused clips first.");
      addAudio(clip);
    } catch (reason) { if (mounted.current) setError(reason instanceof Error ? reason.message : "Audio could not be added."); }
    finally { if (mounted.current) setBusy(false); }
  };

  const record = async () => {
    setError(""); setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") throw new Error("Microphone recording is unavailable in this browser. You can still import recorded audio.");
      const capture = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mounted.current) { capture.getTracks().forEach(track => track.stop()); return; }
      stream.current = capture;
      const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/mp4"].find(type => MediaRecorder.isTypeSupported(type));
      const current = new MediaRecorder(capture, mimeType ? { mimeType } : undefined);
      recorder.current = current;
      const chunks: Blob[] = [];
      const state = useEditorStore.getState();
      const start = state.playhead;
      const projectId = state.project.id;
      let bytes = 0;
      let failed = false;
      current.ondataavailable = event => { chunks.push(event.data); bytes += event.data.size; if (bytes >= maximumBytes && current.state === "recording") current.stop(); };
      current.onerror = () => { failed = true; setError("Recording failed. Check your microphone and try again."); capture.getTracks().forEach(track => track.stop()); setRecording(false); state.setPlaying(false); };
      current.onstop = () => {
        capture.getTracks().forEach(track => track.stop());
        if (!mounted.current) return;
        setRecording(false); state.setPlaying(false);
        if (!failed) void add(new Blob(chunks, { type: current.mimeType || "audio/webm" }), `Voiceover ${new Date().toLocaleTimeString()}`, start, projectId);
      };
      current.start(250);
      setElapsed(0); setRecording(true); state.setPlaying(true);
    } catch (reason) {
      stream.current?.getTracks().forEach(track => track.stop());
      setError(reason instanceof DOMException && reason.name === "NotAllowedError" ? "Microphone access was denied. Allow microphone access or import an audio file." : reason instanceof Error ? reason.message : "Could not start recording.");
    } finally { if (mounted.current) setBusy(false); }
  };

  return <div className="audio-editor">
    {clips.map(clip => <AudioPlayback key={clip.id} clip={clip} onError={setError} />)}
    <div className="audio-toolbar">
      <button disabled={busy || recording} onClick={() => input.current?.click()}><Upload size={15} /> Import Audio</button>
      <input ref={input} hidden type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" onChange={e => {
        const file = e.target.files?.[0]; e.target.value = ""; if (!file) return;
        setError(""); const state = useEditorStore.getState(); state.setPlaying(false);
        void add(file, file.name, state.playhead, state.project.id);
      }} />
      <button disabled={busy} className={recording ? "recording" : ""} onClick={() => { if (recording) recorder.current?.stop(); else void record(); }}>
        {recording ? <Square size={15} /> : <Mic size={15} />}{recording ? `Stop ${Math.floor(elapsed / 60)}:${Math.floor(elapsed % 60).toString().padStart(2, "0")}` : "Record Voiceover"}
      </button>
      {busy && <span role="status">Preparing audio...</span>}
      {error && <span role="alert" className="audio-error">{error}</span>}
    </div>
    {clips.length > 0 && <details className="audio-settings">
      <summary>Audio clips ({clips.length})</summary>
      {clips.map(clip => <div className="audio-clip-controls" key={clip.id}>
        <input aria-label={`Name for ${clip.name}`} value={clip.name} onChange={e => updateAudio(clip.id, { name: e.target.value })} />
        <label>Start<input aria-label={`Start for ${clip.name}`} type="number" min={0} step={.1} value={Number(clip.start.toFixed(2))} onChange={e => updateAudio(clip.id, { start: Number(e.target.value) })} /></label>
        <label>Trim in<input aria-label={`Trim in for ${clip.name}`} type="number" min={0} max={clip.sourceDuration - .01} step={.1} value={Number(clip.trimStart.toFixed(2))} onChange={e => updateAudio(clip.id, { trimStart: Number(e.target.value) })} /></label>
        <label>Duration<input aria-label={`Duration for ${clip.name}`} type="number" min={.01} max={clip.sourceDuration - clip.trimStart} step={.1} value={Number(clip.duration.toFixed(2))} onChange={e => updateAudio(clip.id, { duration: Number(e.target.value) })} /></label>
        <input aria-label={`Volume for ${clip.name}`} title={`Volume ${Math.round(clip.volume * 100)}%`} type="range" min={0} max={1} step={.01} value={clip.volume} onChange={e => updateAudio(clip.id, { volume: Number(e.target.value) })} />
        <button title={clip.muted ? `Unmute ${clip.name}` : `Mute ${clip.name}`} aria-pressed={clip.muted} onClick={() => updateAudio(clip.id, { muted: !clip.muted })}>{clip.muted ? <VolumeX size={15} /> : <Volume2 size={15} />}</button>
        <button title={`Delete ${clip.name}`} onClick={() => deleteAudio(clip.id)}><Trash2 size={15} /></button>
      </div>)}
    </details>}
  </div>;
}
