import { useEffect, useRef, useState } from "react";
import { Mic, Sparkles, Square, Trash2, Upload, Volume2, VolumeX, Zap } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { AudioClip } from "../types/editor";

const maximumBytes = 25 * 1024 * 1024;

type BuiltInSfx = "pop" | "whoosh" | "bonk" | "scratch";

function wavBlob(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => [...text].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, index) => view.setInt16(44 + index * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true));
  return new Blob([buffer], { type: "audio/wav" });
}

function synthesizeSfx(kind: BuiltInSfx) {
  const sampleRate = 44100;
  const durations = { pop: .18, whoosh: .55, bonk: .32, scratch: .48 };
  const length = Math.floor(sampleRate * durations[kind]);
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const p = i / length;
    const noise = Math.sin(i * 91.7) * Math.sin(i * 12.31);
    if (kind === "pop") samples[i] = Math.sin(2 * Math.PI * (740 - p * 300) * t) * Math.pow(1 - p, 5) * .95;
    if (kind === "whoosh") samples[i] = noise * Math.sin(Math.PI * p) * .45 + Math.sin(2 * Math.PI * (120 + p * 620) * t) * Math.sin(Math.PI * p) * .12;
    if (kind === "bonk") samples[i] = Math.sin(2 * Math.PI * (155 - p * 70) * t) * Math.pow(1 - p, 2.4) * .9 + Math.sin(2 * Math.PI * 420 * t) * Math.pow(1 - p, 12) * .35;
    if (kind === "scratch") samples[i] = (Math.sin(2 * Math.PI * (900 - p * 760) * t + Math.sin(90 * t) * 4) + noise * .65) * Math.pow(1 - p, .75) * .35;
  }
  return wavBlob(samples, sampleRate);
}

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
  const addSfx = (kind: BuiltInSfx) => {
    setError("");
    const state = useEditorStore.getState();
    state.setPlaying(false);
    const names = { pop: "Pop", whoosh: "Whoosh", bonk: "Bonk", scratch: "Record scratch" };
    void add(synthesizeSfx(kind), names[kind], state.playhead, state.project.id);
  };

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
      <button disabled={busy || recording} onClick={() => addSfx("pop")}><Sparkles size={15} /> Pop</button>
      <button disabled={busy || recording} onClick={() => addSfx("whoosh")}><Zap size={15} /> Whoosh</button>
      <button disabled={busy || recording} onClick={() => addSfx("bonk")}>Bonk</button>
      <button disabled={busy || recording} onClick={() => addSfx("scratch")}>Scratch</button>
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
