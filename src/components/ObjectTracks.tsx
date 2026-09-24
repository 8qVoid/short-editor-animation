import { ArrowDown, ArrowUp, Diamond, Eye, EyeOff, Lock, Trash2, Unlock } from "lucide-react";
import { useEditorStore } from "../store/editorStore";

export function ObjectTracks() {
  const s=useEditorStore(), shot=s.project.shots.find(x=>x.id===s.project.activeShotId)!;
  const start=s.project.shots.slice(0,s.project.shots.indexOf(shot)).reduce((n,x)=>n+x.duration,0), offset=shot.animationOffset??0;
  const local=Math.max(0,Math.min(shot.duration,s.playhead-start));
  return <details className="object-tracks" open><summary>Layers & keyframes <span>{shot.name}</span></summary>
    <div className="object-track-list">
    {[...shot.objects].sort((a,b)=>b.layer-a.layer).map(o=><div className={`object-track ${s.selectedIds.includes(o.id)?'selected':''}`} key={o.id}>
      <div className="track-label">
        <button className="track-name" title={o.name} onClick={()=>s.selectObject(o.id)}>{o.name}</button>
        <button title={o.hidden?'Show layer':'Hide layer'} onClick={()=>s.updateObject(o.id,{hidden:!o.hidden})}>{o.hidden?<EyeOff size={13}/>:<Eye size={13}/>}</button>
        <button title={o.locked?'Unlock layer':'Lock layer'} onClick={()=>s.updateObject(o.id,{locked:!o.locked})}>{o.locked?<Lock size={13}/>:<Unlock size={13}/>}</button>
        <button title="Bring forward" disabled={o.kind==='background'} onClick={()=>s.reorderObject(o.id,1)}><ArrowUp size={13}/></button>
        <button title="Send backward" disabled={o.kind==='background'} onClick={()=>s.reorderObject(o.id,-1)}><ArrowDown size={13}/></button>
        <button className="track-delete" title={`Delete ${o.name}`} aria-label={`Delete ${o.name}`} onClick={()=>{s.selectObject(o.id);s.deleteSelected();}}><Trash2 size={13}/></button>
      </div>
      <div className="key-track" aria-label={`${o.name} keyframes`} onPointerDown={e=>{
        if(e.target!==e.currentTarget)return;
        const rect=e.currentTarget.getBoundingClientRect();s.setPlaying(false);s.selectObject(o.id);s.seek(start+Math.min(shot.duration-1/s.project.canvas.fps,Math.round((e.clientX-rect.left)/rect.width*shot.duration*s.project.canvas.fps)/s.project.canvas.fps));
      }}>
        <i className="track-cursor" style={{left:`${local/shot.duration*100}%`}}/>
        {(o.keyframes??[]).filter(k=>k.time>=offset&&k.time<offset+shot.duration).map(k=><button className="key-marker" key={k.time} style={{left:`${(k.time-offset)/shot.duration*100}%`}} title={`Keyframe ${(k.time-offset).toFixed(2)}s; drag to retime`} aria-label={`${o.name} keyframe ${(k.time-offset).toFixed(2)}`}
          onPointerDown={e=>{e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);s.setPlaying(false);s.selectObject(o.id);s.seek(start+k.time-offset);}}
          onPointerUp={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))return;const rect=e.currentTarget.parentElement!.getBoundingClientRect();e.currentTarget.releasePointerCapture(e.pointerId);const time=offset+Math.max(0,Math.min(shot.duration-1/s.project.canvas.fps,(e.clientX-rect.left)/rect.width*shot.duration));if(Math.abs(time-k.time)>1/s.project.canvas.fps)s.moveKeyframe(o.id,k.time,time);}}
          onKeyDown={e=>{if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();e.stopPropagation();s.deleteKeyframe(o.id,k.time);}if(e.key==='Enter'){s.setPlaying(false);s.selectObject(o.id);s.seek(start+k.time-offset);}}}><Diamond size={12}/></button>)}
      </div>
    </div>)}
    </div>
  </details>;
}
