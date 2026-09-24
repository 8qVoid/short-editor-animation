import { Copy, Eye, EyeOff, FlipHorizontal, FlipVertical, Lock, Trash2, Unlock } from "lucide-react";
import { actions, characterViews, closetItems, expressions, mouths, poses } from "../data/assets";
import { useEditorStore } from "../store/editorStore";
import { assetById } from "../data/assets";
import { appearanceFor, hairstyles, outfits } from "./CharacterWardrobe";
import type { CharacterAppearance, HairId, OutfitId, SceneObject } from "../types/editor";
import { objectAt } from "../animation";
import { MotionPanel } from "./MotionPanel";
import { ShotPanel } from "./ShotPanel";
import { ProjectSyncPanel } from "./ProjectSyncPanel";
import { ScreenControls } from "./ScreenControls";

export function PropertiesPanel() {
  const { project, selectedIds, updateObject, updateObjectTransform, deleteSelected, duplicateSelected } = useEditorStore();
  const shot = project.shots.find((item) => item.id === project.activeShotId)!;
  const playhead = useEditorStore(state=>state.playhead);
  const start = project.shots.slice(0,project.shots.indexOf(shot)).reduce((n,s)=>n+s.duration,0);
  const source = shot.objects.find((item) => item.id === selectedIds[0]);
  const object = source ? objectAt(source,playhead-start+(shot.animationOffset??0)) : undefined;

  if (!object) {
    return (
      <aside className="right-panel">
        <div className="panel-title">Properties</div>
        <ProjectSyncPanel />
        <ShotPanel />
      </aside>
    );
  }

  const t = object.transform;
  const selectedAsset = project.customAssets?.find(asset => asset.id === object.assetId) ?? assetById(object.assetId) ?? assetById("char-young-man")!;
  const appearance = appearanceFor(selectedAsset, object);
  const customize = (patch: CharacterAppearance) => updateObject(object.id, { appearance: { ...object.appearance, ...patch } });
  const numeric = (key: keyof typeof t, label: string, step = 1) => (
    <label className="field">
      <span>{label}</span>
      <input type="number" step={step} value={Number(Number(t[key]).toFixed(3))} onChange={(event) => updateObjectTransform(object.id, { [key]: Number(event.target.value) })} />
    </label>
  );

  return (
    <aside className="right-panel">
      <div className="panel-title">Properties</div>
      <ProjectSyncPanel />
      <input className="object-name" aria-label="Layer name" value={object.name} onChange={e=>updateObject(object.id,{name:e.target.value})}/>
      <MotionPanel object={object} />
      {object.kind === "character" && <>
        <div className="section-label">Wardrobe & Hair</div>
        <div className="fields">
          <label className="field"><span>Outfit</span><select aria-label="Outfit" value={appearance.outfit} onChange={e => { const outfit = e.target.value as OutfitId; customize({ outfit, clothingColor: outfits.find(item => item.id === outfit)!.color }); }}>{outfits.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="field"><span>Hairstyle</span><select aria-label="Hairstyle" value={appearance.hair} onChange={e => customize({ hair: e.target.value as HairId })}>{hairstyles.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          {([['clothingColor', 'Clothing'], ['hairColor', 'Hair'], ['skinColor', 'Skin']] as const).map(([key, label]) => <label className="field" key={key}><span>{label}</span><input aria-label={`${label} color`} type="color" value={appearance[key]} onChange={e => customize({ [key]: e.target.value })} /></label>)}
        </div>
      </>}
      {object.kind === "background" && <>
        <label className="field"><span>Atmosphere</span><select aria-label="Atmosphere" value={object.atmosphere??'none'} onChange={e=>updateObject(object.id,{atmosphere:e.target.value as typeof object.atmosphere})}><option value="none">None</option><option value="dust">Floating dust</option><option value="breeze">Clouds and breeze</option><option value="clouds">Slow clouds</option><option value="rain">Rain</option><option value="traffic">Passing traffic</option><option value="lights">Twinkling lights</option></select></label>
        <div className="section-label">Time of Day</div>
        <div className="picker-grid" role="group" aria-label="Time of day">
          {(["day", "sunrise", "sunset", "night"] as const).map(time => <button key={time} aria-pressed={(object.timeOfDay ?? (object.assetId === "bg-night" ? "night" : "day")) === time} className={(object.timeOfDay ?? (object.assetId === "bg-night" ? "night" : "day")) === time ? "active" : ""} onClick={() => updateObject(object.id, { timeOfDay: time })}>{time.charAt(0).toUpperCase() + time.slice(1)}</button>)}
        </div>
      </>}
      {selectedAsset.imageData && <>
        <div className="section-label">Background Removal</div>
        <label className="chroma-toggle"><input type="checkbox" checked={object.chromaKeyEnabled ?? false} onChange={event => updateObject(object.id, { chromaKeyEnabled: event.target.checked, chromaKeyColor: object.chromaKeyColor ?? "#00ff00" })} /> Remove a solid color (chroma key)</label>
        {object.chromaKeyEnabled && <div className="fields">
          <label className="field"><span>Key Color</span><input aria-label="Chroma key color" type="color" value={object.chromaKeyColor ?? "#00ff00"} onChange={event => updateObject(object.id, { chromaKeyColor: event.target.value })} /></label>
          <label className="field"><span>Tolerance {object.chromaKeyTolerance ?? 90}</span><input aria-label="Chroma key tolerance" type="range" min={0} max={260} value={object.chromaKeyTolerance ?? 90} onChange={event => updateObject(object.id, { chromaKeyTolerance: Number(event.target.value) })} /></label>
          <label className="field"><span>Edge Softness {object.chromaKeySoftness ?? 45}</span><input aria-label="Chroma key edge softness" type="range" min={1} max={150} value={object.chromaKeySoftness ?? 45} onChange={event => updateObject(object.id, { chromaKeySoftness: Number(event.target.value) })} /></label>
        </div>}
      </>}
      {["prop-phone", "prop-laptop", "prop-brand-sign"].includes(object.assetId) && <ScreenControls key={object.id} object={object} update={patch => updateObject(object.id, patch)} />}
      <div className="fields">
        {numeric("x", "X")}
        {numeric("y", "Y")}
        {numeric("width", "Width")}
        {numeric("height", "Height")}
        {numeric("scaleX", "Scale X", 0.05)}
        {numeric("scaleY", "Scale Y", 0.05)}
        {numeric("rotation", "Rotation")}
        {numeric("opacity", "Opacity", 0.05)}
      </div>
      <div className="icon-row">
        <button title="Flip horizontal" onClick={() => updateObjectTransform(object.id, { flipX: !t.flipX })}><FlipHorizontal size={17} /></button>
        <button title="Flip vertical" onClick={() => updateObjectTransform(object.id, { flipY: !t.flipY })}><FlipVertical size={17} /></button>
        <button title="Duplicate" onClick={duplicateSelected}><Copy size={17} /></button>
        <button title={object.locked ? "Unlock" : "Lock"} onClick={() => updateObject(object.id, { locked: !object.locked })}>{object.locked ? <Lock size={17} /> : <Unlock size={17} />}</button>
        <button title={object.hidden ? "Show" : "Hide"} onClick={() => updateObject(object.id, { hidden: !object.hidden })}>{object.hidden ? <EyeOff size={17} /> : <Eye size={17} />}</button>
        <button title="Delete" onClick={deleteSelected}><Trash2 size={17} /></button>
      </div>
      {object.kind === "character" && (
        <>
          <div className="section-label">Expression</div>
          <div className="picker-grid">
            {expressions.map((expression) => (
              <button key={expression.id} className={object.expression === expression.id ? "active" : ""} onClick={() => updateObject(object.id, { expression: expression.id })}>
                {expression.name}
              </button>
            ))}
          </div>
          <div className="section-label">Pose</div>
          <div className="picker-grid">
            {poses.map((pose) => (
              <button key={pose.id} className={object.pose === pose.id ? "active" : ""} onClick={() => updateObject(object.id, { pose: pose.id })}>
                {pose.name}
              </button>
            ))}
          </div>
          <div className="section-label">View</div>
          <div className="picker-grid">
            {characterViews.map((view) => (
              <button key={view.id} className={(object.view ?? "front") === view.id ? "active" : ""} onClick={() => updateObject(object.id, { view: view.id })}>
                {view.name}
              </button>
            ))}
          </div>
          <div className="section-label">Mouth</div>
          <div className="picker-grid">
            {mouths.map((mouth) => (
              <button key={mouth.id} className={(object.mouth ?? "auto") === mouth.id ? "active" : ""} onClick={() => updateObject(object.id, { mouth: mouth.id })}>
                {mouth.name}
              </button>
            ))}
          </div>
          <div className="section-label">Action</div>
          <div className="picker-grid">
            {actions.map((action) => (
              <button key={action.id} className={(object.action ?? "idle") === action.id ? "active" : ""} onClick={() => updateObject(object.id, { action: action.id })}>
                {action.name}
              </button>
            ))}
          </div>
          <div className="section-label">Closet</div>
          <div className="picker-grid">
            {closetItems.map((item) => {
              const current = object.closet ?? [];
              const active = current.includes(item.id);
              return (
                <button
                  key={item.id}
                  className={active ? "active" : ""}
                  onClick={() =>
                    updateObject(object.id, {
                      closet: active ? current.filter((id) => id !== item.id) : [...current, item.id]
                    })
                  }
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </>
      )}
      {object.kind === "text" && (
        <>
          <label className="text-field"><span>Text</span><textarea value={object.text} onChange={(event) => updateObject(object.id, { text: event.target.value })} /></label>
          <div className="section-label">Text Style</div>
          <div className="fields">
            <label className="field"><span>Font</span><select aria-label="Font family" value={object.fontFamily ?? "Arial"} onChange={e => updateObject(object.id, { fontFamily: e.target.value })}>{["Arial", "Verdana", "Trebuchet MS", "Georgia", "Impact", "Courier New", "Comic Sans MS", "system-ui"].map(font => <option key={font} value={font}>{font}</option>)}</select></label>
            <label className="field"><span>Size</span><input aria-label="Font size" type="number" min={8} max={200} step={2} value={object.fontSize ?? 54} onChange={e => updateObject(object.id, { fontSize: Math.max(8, Math.min(200, Number(e.target.value) || 8)) })} /></label>
            <label className="field"><span>Style</span><select aria-label="Font style" value={object.fontStyle ?? "bold"} onChange={e => updateObject(object.id, { fontStyle: e.target.value as SceneObject["fontStyle"] })}><option value="normal">Regular</option><option value="bold">Bold</option><option value="italic">Italic</option><option value="bold italic">Bold italic</option></select></label>
            <label className="field"><span>Align</span><select aria-label="Text alignment" value={object.textAlign ?? "center"} onChange={e => updateObject(object.id, { textAlign: e.target.value as SceneObject["textAlign"] })}><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></label>
            <label className="field"><span>Color</span><input aria-label="Text color" type="color" value={object.textColor ?? assetById(object.assetId)?.color ?? "#ffffff"} onChange={e => updateObject(object.id, { textColor: e.target.value })} /></label>
          </div>
        </>
      )}
      <ShotPanel />
    </aside>
  );
}
