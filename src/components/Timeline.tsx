import { useEffect, useRef, useState } from "react";
import { Copy, Plus, Trash2, Play, Pause, Scissors, SkipBack, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Drama, Eye, MessageSquare } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import { AudioEditor } from "./AudioEditor";
import { ObjectTracks } from "./ObjectTracks";
import { Timer } from "lucide-react";
import type { ShotTransitionId } from "../types/editor";

const transitions: { id: ShotTransitionId; label: string }[] = [
  { id: "cut", label: "Cut" },
  { id: "crossfade", label: "Fade" },
  { id: "wipe", label: "Wipe" },
  { id: "slide", label: "Slide" },
  { id: "zoom", label: "Zoom" },
  { id: "dip-black", label: "Black" }
];

export function Timeline() {
  const { project, playhead, playing, seek, setPlaying, splitShot, moveShot, setActiveShot, addShot, duplicateShot, deleteShot, setShotDuration, setShotTransition, updateAudio, addStoryBeat } = useEditorStore();
  const [zoom, setZoom] = useState(100);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trim, setTrim] = useState<{ id: string; x: number; duration: number; next: number } | null>(null);
  const [audioDrag, setAudioDrag] = useState<{ id: string; x: number; start: number; next: number; moved: boolean } | null>(null);
  const [clipScrub, setClipScrub] = useState<{ id: string; x: number; moved: boolean } | null>(null);
  const active = project.shots.find(s => s.id === project.activeShotId)!;
  let cursor = 0;
  const clips = project.shots.map(shot => { const start = cursor; cursor += shot.duration; return { shot, start }; });
  const total = cursor;
  const fps = project.canvas.fps;
  const start = clips.find(c => c.shot.id === active.id)!.start;
  const cutFrame = Math.round((playhead - start) * fps);
  const canSplit = cutFrame > 0 && cutFrame < Math.round(active.duration * fps);
  const timecode = (time: number) => {
    const frames = Math.round(time * fps);
    return `${Math.floor(frames / fps / 60).toString().padStart(2, "0")}:${(Math.floor(frames / fps) % 60).toString().padStart(2, "0")}:${(frames % fps).toString().padStart(2, "0")}`;
  };
  useEffect(() => {
    if (!playing) return;
    let request = 0;
    let last = performance.now();
    const advance = (now: number) => {
      const state = useEditorStore.getState();
      const end = state.project.shots.reduce((sum, s) => sum + s.duration, 0);
      const next = state.playhead + (now - last) / 1000;
      last = now;
      state.seek(next);
      if (next >= end) state.setPlaying(false);
      else request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(request);
  }, [playing]);
  const toggle = () => { if (!playing && playhead >= total) seek(0); setPlaying(!playing); };
  const scrub = (clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    setPlaying(false);
    seek(Math.round((clientX - rect.left) / zoom * fps) / fps);
  };
  return <footer className="timeline">
    <div className="timeline-actions">
      <button title="Go to start" aria-label="Go to start" onClick={() => { setPlaying(false); seek(0); }}><SkipBack size={16} /></button>
      <button title="Previous frame" aria-label="Previous frame" onClick={() => { setPlaying(false); seek(playhead - 1 / fps); }}><ChevronLeft size={16} /></button>
      <button className="primary" title={playing ? "Pause" : "Play"} aria-label={playing ? "Pause" : "Play"} onClick={toggle}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
      <button title="Next frame" aria-label="Next frame" onClick={() => { setPlaying(false); seek(playhead + 1 / fps); }}><ChevronRight size={16} /></button>
      <output className="timecode">{timecode(playhead)} / {timecode(total)}</output>
      <button title="Split at playhead" aria-label="Split at playhead" disabled={!canSplit} onClick={splitShot}><Scissors size={16} /></button>
      <button onClick={addShot}><Plus size={16} /> Add Shot</button>
      <button onClick={()=>useEditorStore.getState().addTimeCard()}><Timer size={16}/>Time Card</button>
      <button onClick={() => addStoryBeat("awkward")}><Drama size={16} /> Awkward</button>
      <button onClick={() => addStoryBeat("closeup")}><Eye size={16} /> Close-up</button>
      <button onClick={() => addStoryBeat("meanwhile")}><MessageSquare size={16} /> Meanwhile</button>
      <button title="Duplicate active shot" aria-label="Duplicate active shot" onClick={() => duplicateShot()}><Copy size={16} /> Duplicate</button>
      <button title="Delete shot" aria-label="Delete shot" disabled={project.shots.length < 2} onClick={() => deleteShot(active.id)}><Trash2 size={16} /></button>
      <label>Duration<input aria-label="Shot duration" type="number" min={1 / fps} step={1 / fps} value={Number(active.duration.toFixed(3))} onChange={e => setShotDuration(Number(e.target.value))} />s</label>
      <button title="Zoom timeline out" aria-label="Zoom timeline out" onClick={() => setZoom(z => Math.max(30, z / 1.5))}><ZoomOut size={16} /></button>
      <button title="Zoom timeline in" aria-label="Zoom timeline in" onClick={() => setZoom(z => Math.min(600, z * 1.5))}><ZoomIn size={16} /></button>
    </div>
    <div className="timeline-scroll">
      <div ref={trackRef} className="timeline-track" style={{ width: Math.max(total * zoom + 80, 800), height: 104 + (project.audioClips?.length ?? 0) * 32 }}>
        <div className="time-ruler" role="slider" tabIndex={0} aria-label="Timeline playhead" aria-valuemin={0} aria-valuemax={total} aria-valuenow={playhead}
          onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setPlaying(false); seek(playhead + (e.key === "ArrowRight" ? 1 : -1) / fps); } }}
          onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); scrub(e.clientX); }}
          onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) scrub(e.clientX); }}
          onPointerUp={e => e.currentTarget.releasePointerCapture(e.pointerId)}>
          {Array.from({ length: Math.ceil(total) + 1 }, (_, i) => <span key={i} style={{ left: i * zoom }}>{i}s</span>)}
        </div>
        {clips.map(({ shot, start: clipStart }, index) => <div key={shot.id} className={`timeline-clip ${shot.id === active.id ? "selected" : ""}`} style={{ left: clipStart * zoom, width: (trim?.id === shot.id ? trim.next : shot.duration) * zoom }}>
          <button className={`clip-body ${clipScrub?.id === shot.id ? "scrubbing" : ""}`} title={`${shot.name}: ${shot.duration.toFixed(2)} seconds. Drag to scrub.`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); moveShot(e.dataTransfer.getData("shot/id"), shot.id); }}
            onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setClipScrub({ id: shot.id, x: event.clientX, moved: false }); }}
            onPointerMove={event => {
              if (clipScrub?.id !== shot.id) return;
              const moved = clipScrub.moved || Math.abs(event.clientX - clipScrub.x) > 3;
              setClipScrub({ ...clipScrub, moved });
              if (moved) scrub(event.clientX);
            }}
            onPointerUp={event => {
              if (clipScrub?.id === shot.id && !clipScrub.moved) setActiveShot(shot.id);
              setClipScrub(null);
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => setClipScrub(null)}>
            <strong>{index + 1}. {shot.name}</strong><small>{shot.duration.toFixed(2)}s</small>
          </button>
          <button className="clip-quick clip-duplicate" title={`Duplicate ${shot.name}`} aria-label={`Duplicate ${shot.name}`} onClick={event => { event.stopPropagation(); duplicateShot(shot.id); }}><Copy size={13} /></button>
          {project.shots.length > 1 && <button className="clip-quick clip-delete" title={`Delete ${shot.name}`} aria-label={`Delete ${shot.name}`} onClick={event => { event.stopPropagation(); deleteShot(shot.id); }}><Trash2 size={13} /></button>}
          {(shot.transition ?? "cut") !== "cut" && index < project.shots.length - 1 && <i className={`clip-transition transition-${shot.transition}`} title={`${transitions.find(t => t.id === shot.transition)?.label ?? "Transition"} to next shot: ${(shot.transitionDuration ?? .5).toFixed(1)}s`} style={{ width: Math.min(shot.duration, shot.transitionDuration ?? .5) * zoom }} />}
          {index < project.shots.length - 1 && <label className={`transition-picker ${(shot.transition ?? "cut") !== "cut" ? "active" : ""}`} style={{ left: Math.max(8, Math.min((trim?.id === shot.id ? trim.next : shot.duration) * zoom - 86, (trim?.id === shot.id ? trim.next : shot.duration) * zoom / 2 - 38)) }} title="Transition to next shot">
            <span>FX</span>
            <select aria-label={`Transition after ${shot.name}`} value={shot.transition ?? "cut"} onClick={event => event.stopPropagation()} onChange={event => setShotTransition(shot.id, event.target.value as ShotTransitionId)}>
              {transitions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </label>}
          <div className="clip-trim" role="separator" aria-label={`Trim ${shot.name}`} title="Drag to trim duration"
            onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); setActiveShot(shot.id); setTrim({ id: shot.id, x: e.clientX, duration: shot.duration, next: shot.duration }); }}
            onPointerMove={e => { if (trim?.id === shot.id) setTrim({ ...trim, next: Math.max(1, Math.round((trim.duration + (e.clientX - trim.x) / zoom) * fps)) / fps }); }}
            onPointerUp={e => { if (trim) setShotDuration(trim.next); setTrim(null); e.currentTarget.releasePointerCapture(e.pointerId); }} onPointerCancel={() => setTrim(null)} />
        </div>)}
        {(project.audioClips ?? []).map((clip, index) => {
          const dragStart = audioDrag?.id === clip.id ? audioDrag.next : clip.start;
          return <button key={clip.id} className={`audio-timeline-clip ${audioDrag?.id === clip.id ? "dragging" : ""}`} title={`${clip.name}: ${clip.duration.toFixed(2)}s. Drag to move.`} style={{ left: dragStart * zoom, top: 104 + index * 32, width: Math.max(4, clip.duration * zoom), opacity: clip.muted ? .4 : 1 }}
            onPointerDown={event => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setPlaying(false);
              setAudioDrag({ id: clip.id, x: event.clientX, start: clip.start, next: clip.start, moved: false });
            }}
            onPointerMove={event => {
              if (audioDrag?.id !== clip.id) return;
              const next = Math.max(0, Math.round((audioDrag.start + (event.clientX - audioDrag.x) / zoom) * fps) / fps);
              setAudioDrag({ ...audioDrag, next, moved: audioDrag.moved || Math.abs(event.clientX - audioDrag.x) > 3 });
            }}
            onPointerUp={event => {
              if (audioDrag?.id === clip.id) {
                if (audioDrag.moved) updateAudio(clip.id, { start: audioDrag.next });
                else seek(clip.start);
              }
              setAudioDrag(null);
              if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
            }}
            onPointerCancel={() => setAudioDrag(null)}
            onClick={event => { if (audioDrag?.moved) event.preventDefault(); }}>{clip.name}</button>;
        })}
        <div className="playhead" style={{ left: playhead * zoom }} />
      </div>
    </div>
    <ObjectTracks />
    <AudioEditor />
  </footer>;
}
