import { Search, Star } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Group, Layer, Stage } from "react-konva";
import { AssetArt } from "./AssetArt";
import { SceneLighting } from "./SceneLighting";
import { assets } from "../data/assets";
import { useEditorStore } from "../store/editorStore";
import type { Asset, AssetCategory, SceneObject } from "../types/editor";

const BackgroundPreview = memo(function BackgroundPreview({ asset }: { asset: Asset }) {
  const ref=useRef<HTMLDivElement>(null);
  const [size,setSize]=useState(76);
  useEffect(()=>{const el=ref.current;if(!el)return;const observer=new ResizeObserver(()=>setSize(el.clientWidth));observer.observe(el);return()=>observer.disconnect();},[]);
  const object: SceneObject = {
    id: "preview", assetId: asset.id, name: asset.name, kind: asset.kind,
    locked: true, hidden: false, layer: 0,
    transform: { x: 0, y: 0, width: 43, height: 76, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false },
  };
  const large = asset.kind !== "character" && asset.kind !== "background";
  const scale=large?Math.min(size/260,76/220)*.9:1;
  return <div ref={ref} style={{ pointerEvents: "none",width:'100%',minWidth:0 }} aria-hidden="true"><Stage width={size} height={76}><Layer listening={false}><Group x={large?(size-260*scale)/2:(size-43)/2} y={large?(76-220*scale)/2:0} scaleX={scale} scaleY={scale}><AssetArt asset={asset} object={large?{...object,transform:{...object.transform,width:260,height:220}}:object} />{asset.kind==='background'&&<SceneLighting object={object} width={43} height={76}/>}</Group></Layer></Stage></div>;
});

const categories: AssetCategory[] = ["Characters", "Backgrounds", "Props", "Shapes", "Effects", "Text"];

export function AssetBrowser() {
  const { activeCategory, setActiveCategory, search, setSearch, addAssetToActiveShot } = useEditorStore();
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("shorts-editor-favorites") ?? "[]"); }
    catch { return []; }
  });
  const [showFavorites, setShowFavorites] = useState(false);
  const toggleFavorite = (id: string) => setFavorites(current => {
    const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
    localStorage.setItem("shorts-editor-favorites", JSON.stringify(next));
    return next;
  });
  const filtered = assets.filter((asset) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || asset.name.toLowerCase().includes(term) || asset.tags.some((tag) => tag.includes(term));
    return (showFavorites ? favorites.includes(asset.id) : asset.category === activeCategory) && matchesSearch;
  });

  return (
    <aside className="left-panel">
      <div className="panel-title">Assets</div>
      <label className="search">
        <Search size={16} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search money, office, sad..." />
      </label>
      <div className="category-list">
        <button className={showFavorites ? "active" : ""} aria-pressed={showFavorites} onClick={() => setShowFavorites(value => !value)}><Star size={14} /> Favorites</button>
        {categories.map((category) => (
          <button key={category} className={!showFavorites && category === activeCategory ? "active" : ""} onClick={() => { setShowFavorites(false); setActiveCategory(category); }}>
            {category}
          </button>
        ))}
      </div>
      <div className="asset-grid">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="asset-card"
            role="button"
            tabIndex={0}
            draggable
            onDragStart={(event) => event.dataTransfer.setData("asset/id", asset.id)}
            onClick={() => addAssetToActiveShot(asset)}
            onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); addAssetToActiveShot(asset); } }}
            title={asset.tags.join(", ")}
          >
            <div className="asset-thumb" style={{ background: asset.color }}>
              {asset.kind !== "text" ? <BackgroundPreview asset={asset} /> : <span>Aa</span>}
            </div>
            <span>{asset.name}</span>
            <button className={`asset-favorite ${favorites.includes(asset.id) ? "active" : ""}`} type="button" aria-label={`${favorites.includes(asset.id) ? "Remove" : "Add"} ${asset.name} ${favorites.includes(asset.id) ? "from" : "to"} favorites`} aria-pressed={favorites.includes(asset.id)} onClick={event => { event.stopPropagation(); toggleFavorite(asset.id); }} onKeyDown={event => event.stopPropagation()}><Star size={15} fill={favorites.includes(asset.id) ? "currentColor" : "none"} /></button>
          </div>
        ))}
      </div>
    </aside>
  );
}
