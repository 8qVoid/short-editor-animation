import { ChevronLeft, ChevronRight, Diamond, Trash2 } from "lucide-react";
import { useEditorStore } from "../store/editorStore";
import type { SceneObject, Easing } from "../types/editor";
import type { MotionPreset } from "../animation";

export function MotionPanel({ object }: { object: SceneObject }) {
  const s = useEditorStore();
  const shot = s.project.shots.find(x=>x.id===s.project.activeShotId)!;
  const start=s.project.shots.slice(0,s.project.shots.indexOf(shot)).reduce((n,x)=>n+x.duration,0);
  const offset=shot.animationOffset??0, time=s.playhead-start+offset;
  const keys=(object.keyframes??[]).filter(k=>k.time>=offset&&k.time<offset+shot.duration);
  const current=keys.find(k=>Math.abs(k.time-time)<.5/s.project.canvas.fps);
  const previous=[...keys].reverse().find(k=>k.time<time-.5/s.project.canvas.fps), next=keys.find(k=>k.time>time+.5/s.project.canvas.fps);
  return <section className="motion-panel">
    <div className="section-label">Animation</div>
    <div className="icon-row">
      <button title="Previous keyframe" disabled={!previous} onClick={()=>{s.setPlaying(false);s.seek(start+previous!.time-offset);}}><ChevronLeft size={16}/></button>
      <button title="Add or update keyframe" aria-label="Add keyframe" className={current?'key-active':''} onClick={()=>s.addKeyframe(object.id)}><Diamond size={16}/></button>
      <button title="Next keyframe" disabled={!next} onClick={()=>{s.setPlaying(false);s.seek(start+next!.time-offset);}}><ChevronRight size={16}/></button>
      <button title="Delete keyframe" disabled={!current} onClick={()=>s.deleteKeyframe(object.id,current!.time)}><Trash2 size={16}/></button>
      <label className="auto-key"><input type="checkbox" checked={s.autoKey} onChange={e=>s.setAutoKey(e.target.checked)}/>Auto key</label>
    </div>
    {current&&<label className="field"><span>Interpolation</span><select aria-label="Keyframe interpolation" value={current.easing} onChange={e=>s.setKeyEasing(object.id,current.time,e.target.value as Easing)}><option value="smooth">Ease in / out</option><option value="linear">Linear</option><option value="hold">Hold, then cut</option></select></label>}
    <label className="field"><span>Movement preset</span><select aria-label="Movement preset" value="" onChange={e=>{if(e.target.value)s.applyMotion(object.id,e.target.value as MotionPreset);}}>
      <option value="">Choose movement</option><option value="enter-left">Enter from left</option><option value="enter-right">Enter from right</option><option value="exit-right">Exit to right</option><option value="approach">Move closer</option><option value="recede">Move away</option><option value="hop">Hop</option><option value="clear">Remove movement</option>
    </select></label>
  </section>;
}
