import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Group, Stage, Layer } from "react-konva";
import Konva from "konva";
import { actions, assets, expressions, mouths, poses } from "../src/data/assets";
import { AssetArt } from "../src/components/AssetArt";
import { hairstyles, outfits } from "../src/components/CharacterWardrobe";
import type { SceneObject } from "../src/types/editor";

const views = ["front", "three-quarter-left", "three-quarter-right", "side-left", "side-right", "seated-side"] as const;
const stages: Record<string, Konva.Stage> = {};
Object.assign(window, { characterStages: stages });

function Fixture() {
  const [settings, setSettings] = useState({ action: "idle", pose: "arms-down", expression: "neutral", mouth: "auto", hair: "", outfit: "" });
  const [tick, setTick] = useState(0);
  const [preview, setPreview] = useState(false);
  const [accessories, setAccessories] = useState(false);
  const options = { action: actions, pose: poses, expression: expressions, mouth: mouths, hair: [{ id: "", name: "Asset default" }, ...hairstyles], outfit: [{ id: "", name: "Asset default" }, ...outfits] };
  return <>
    <h1>Character views</h1>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
      {(Object.keys(options) as (keyof typeof options)[]).map(key => <label key={key}>{key} <select aria-label={key} value={settings[key]} onChange={e => setSettings({ ...settings, [key]: e.target.value })}>{options[key].map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>)}
      <label>Time <input aria-label="Time" type="number" value={tick} onChange={e => setTick(Number(e.target.value))} step={50} /></label>
      <label><input aria-label="Preview" type="checkbox" checked={preview} onChange={e => setPreview(e.target.checked)} />Preview</label>
      <label><input aria-label="Accessories" type="checkbox" checked={accessories} onChange={e => setAccessories(e.target.checked)} />Accessories</label>
    </div>
    {assets.filter(asset => asset.kind === "character").map(asset => <section key={asset.id} data-asset={asset.id}>
      <h2>{asset.name}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 260px)", gap: 8 }}>
        {views.map(view => {
          const object: SceneObject = { id: `${asset.id}-${view}`, assetId: asset.id, name: asset.name, kind: "character", view,
            action: settings.action as SceneObject["action"], pose: settings.pose as SceneObject["pose"], expression: settings.expression as SceneObject["expression"], mouth: settings.mouth as SceneObject["mouth"],
            appearance: { ...(settings.hair ? { hair: settings.hair as NonNullable<SceneObject["appearance"]>["hair"] } : {}), ...(settings.outfit ? { outfit: settings.outfit as NonNullable<SceneObject["appearance"]>["outfit"] } : {}) },
            closet: accessories ? ["hat", "glasses", "mustache", "bowtie", "backpack", "coffee-hand"] : [],
            layer: 0, locked: false, hidden: false,
            transform: { x: 0, y: 0, width: 210, height: 380, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false } };
          return <div key={view} data-view={view} style={{ background: "#e7eeed" }}><div style={{ padding: 6 }}>{view}</div>
            <Stage ref={stage => { if (stage) stages[object.id] = stage; else delete stages[object.id]; }} width={260} height={414}>
              <Layer><Group x={25} y={22}><AssetArt asset={asset} object={object} tick={tick} preview={preview} /></Group></Layer>
            </Stage>
          </div>;
        })}
      </div>
    </section>)}
  </>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
