import React from "react";
import { createRoot } from "react-dom/client";
import { Layer, Stage } from "react-konva";
import { assets } from "../src/data/assets";
import { BackgroundArt } from "../src/components/BackgroundArt";
import { SceneLighting } from "../src/components/SceneLighting";
import type { SceneObject } from "../src/types/editor";

// Isolated visual fixture: never reads or modifies the editor's saved project.
const params = new URLSearchParams(location.search);
const time = (params.get("time") ?? "day") as SceneObject["timeOfDay"];
const backgrounds = assets.filter(asset => asset.kind === "background");
createRoot(document.getElementById("root")!).render(<>
  <h1>Backgrounds: {time}</h1>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 16 }}>
    {backgrounds.map(asset => <section key={asset.id} data-scene={asset.thumbnail}>
      <h2 style={{ fontSize: 15 }}>{asset.name}</h2>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ width: 320, height: 180 }, { width: 101.25, height: 180 }].map(size => {
          const object: SceneObject = { id: asset.id, assetId: asset.id, name: asset.name, kind: "background", layer: 0, locked: false, hidden: false, timeOfDay: time, transform: { x: 0, y: 0, ...size, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false } };
          return <Stage key={size.width} {...size}><Layer><BackgroundArt asset={asset} object={object} /><SceneLighting object={object} {...size} /></Layer></Stage>;
        })}
      </div>
    </section>)}
  </div>
</>);
