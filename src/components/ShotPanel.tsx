import { cameraAt } from "../animation";
import { useEditorStore } from "../store/editorStore";
import type { ShotTransitionId } from "../types/editor";

const transitionOptions: { id: ShotTransitionId; label: string }[] = [
  { id: "cut", label: "Cut" },
  { id: "crossfade", label: "Fade" },
  { id: "wipe", label: "Wipe" },
  { id: "slide", label: "Slide" },
  { id: "zoom", label: "Zoom Pop" },
  { id: "dip-black", label: "Dip Black" }
];

export function ShotPanel() {
  const s=useEditorStore(), shot=s.project.shots.find(x=>x.id===s.project.activeShotId)!;
  const start=s.project.shots.slice(0,s.project.shots.indexOf(shot)).reduce((n,x)=>n+x.duration,0);
  const camera=cameraAt(shot,s.playhead-start+(shot.animationOffset??0));
  const isLastShot = s.project.shots.indexOf(shot) === s.project.shots.length - 1;
  return <section className="shot-panel">
    <div className="section-label">Transition to next shot</div>
    <div className="picker-grid" role="group" aria-label="Transition to next shot">
      {transitionOptions.map(option => <button key={option.id} disabled={isLastShot && option.id !== "cut"} aria-pressed={(shot.transition ?? "cut") === option.id} className={(shot.transition ?? "cut") === option.id ? "active" : ""} onClick={() => s.setShotTransition(shot.id, option.id)}>{option.label}</button>)}
    </div>
    {(shot.transition ?? "cut") !== "cut" && !isLastShot && <label className="field"><span>Transition length</span><input aria-label="Transition length" type="number" min={.1} max={Math.max(.1, shot.duration)} step={.1} value={shot.transitionDuration ?? .5} onChange={e => s.setShotTransition(shot.id, shot.transition ?? "crossfade", Number(e.target.value))} /></label>}
    <div className="section-label">Shot camera</div>
    <label className="field"><span>Camera move</span><select aria-label="Camera move" value="" onChange={e=>s.applyCameraMotion(e.target.value)}><option value="" disabled>Choose camera move</option><option value="push-in">Push in</option><option value="snap-zoom">Snap zoom</option><option value="pull-out">Pull out</option><option value="pan-left">Pan left</option><option value="pan-right">Pan right</option><option value="follow-left">Follow left</option><option value="follow-right">Follow right</option><option value="shake">Camera shake</option><option value="static">Reset camera</option></select></label>
    <div className="fields">
      {([['x','Pan X'],['y','Pan Y'],['zoom','Zoom'],['rotation','Tilt']] as const).map(([key,label])=><label className="field" key={key}><span>{label}</span><input aria-label={`Camera ${label}`} type="number" step={key==='zoom'?.05:1} min={key==='zoom'?.25:undefined} max={key==='zoom'?4:undefined} value={Number(camera[key].toFixed(3))} onChange={e=>s.updateCamera({[key]:Number(e.target.value)})}/></label>)}
    </div>
  </section>;
}
