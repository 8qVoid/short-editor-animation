import React from "react";
import { createRoot } from "react-dom/client";
import { Stage, Layer } from "react-konva";
import { assets } from "../src/data/assets";
import { AssetArt } from "../src/components/AssetArt";
import type { SceneObject } from "../src/types/editor";

createRoot(document.getElementById("root")!).render(<><h1>Character wardrobe</h1><div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>{assets.filter(asset => asset.kind === "character").map(asset => <section key={asset.id}><h2 style={{ fontSize: 14 }}>{asset.name}</h2><div style={{ display: "flex", background: "#e7eeed" }}>{(["front", "side-right"] as const).map(view => {
  const object: SceneObject = { id: asset.id, assetId: asset.id, name: asset.name, kind: "character", view, action: "idle", layer: 0, locked: true, hidden: false, transform: { x: 0, y: 0, width: 100, height: 190, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false } };
  return <Stage key={view} width={100} height={200}><Layer><AssetArt asset={asset} object={object} /></Layer></Stage>;
})}</div></section>)}</div></>);
