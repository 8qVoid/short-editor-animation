import { AudioLines, Pause, Play, Plus, Search, Star, Trash2, Upload } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Group, Layer, Stage } from "react-konva";
import { AssetArt } from "./AssetArt";
import { SceneLighting } from "./SceneLighting";
import { assets } from "../data/assets";
import { useEditorStore } from "../store/editorStore";
import { readClip, synthesizeSfx, type BuiltInSfx } from "./AudioEditor";
import type { Asset, AssetCategory, CaptionCue, SceneObject, SoundAsset } from "../types/editor";

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

const categories: AssetCategory[] = ["Characters", "Backgrounds", "Props", "Shapes", "Effects", "Sound FX", "Text"];

const builtInSounds: Array<{ id: BuiltInSfx; name: string; description: string }> = [
  { id: "pop", name: "Pop", description: "Quick bright accent" },
  { id: "whoosh", name: "Whoosh", description: "Short movement sweep" },
  { id: "bonk", name: "Bonk", description: "Soft comedic hit" },
  { id: "scratch", name: "Record Scratch", description: "Sudden stop" }
];

const providedSounds = [
  "ambient-kitchen-loop.mp3", "bass-impact.mp3", "bonk.mp3", "buzzer-or-wrong-answer-.mp3",
  "Comedy - Comedy Music.mp3", "Comedy Quirky Sneaky Music.mp3", "cricket-sound.mp3",
  "dialing-numbers-7025.mp3", "electric-sparks.mp3", "microwave-ding.mp3", "pop.mp3",
  "Quirky Music.mp3", "record_scratch.mp3", "Simple Whoosh.mp3",
  "Sound Effect TwinkleSparkle.mp3", "vine boom.mp3"
].map(name => ({ name, source: `/sound-fx/${encodeURIComponent(name)}` }));

function parseSubtitleTime(value: string) {
  const timestamp = value.trim().match(/^(?:(\d+):)?(\d{2}):(\d{2})[,.](\d{3})$/);
  if (timestamp) return Number(timestamp[1] ?? 0) * 3600 + Number(timestamp[2]) * 60 + Number(timestamp[3]) + Number(timestamp[4]) / 1000;
  const short = value.trim().match(/^(\d{2}):(\d{2})[,.](\d{3})$/);
  return short ? Number(short[1]) * 60 + Number(short[2]) + Number(short[3]) / 1000 : undefined;
}

function parseSubtitleFile(content: string): CaptionCue[] {
  return content.replace(/^\uFEFF/, "").replace(/\r/g, "").split(/\n\s*\n/).flatMap(block => {
    const lines = block.split("\n").map(line => line.trim()).filter(Boolean);
    const timingIndex = lines.findIndex(line => line.includes("-->"));
    if (timingIndex < 0) return [];
    const [from, to] = lines[timingIndex].split("-->").map(part => part.trim().split(/\s+/)[0]);
    const start = parseSubtitleTime(from);
    const end = parseSubtitleTime(to);
    const text = lines.slice(timingIndex + 1).join(" ").replace(/<[^>]*>/g, "").trim();
    return start !== undefined && end !== undefined && end > start && text ? [{ start, end, text }] : [];
  });
}

async function importedImage(file: File, kind: "background" | "prop"): Promise<Asset> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const imageData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => image.naturalWidth <= 8192 && image.naturalHeight <= 8192 ? resolve({ width: image.naturalWidth, height: image.naturalHeight }) : reject(new Error("Choose an image no larger than 8192 pixels on either side."));
    image.onerror = () => reject(new Error("This image could not be opened."));
    image.src = imageData;
  });
  const name = file.name.replace(/\.[^.]+$/, "") || "Imported Image";
  return { id: `custom-${kind}-${crypto.randomUUID()}`, name, category: kind === "background" ? "Backgrounds" : "Props", kind, tags: ["custom", "imported", kind], color: "#bac9ce", thumbnail: "uploaded-image", imageData, imageWidth: dimensions.width, imageHeight: dimensions.height };
}

function SoundFxShelf() {
  const { project, addSoundAsset, deleteSoundAsset, addSoundToTimeline, addAudio, playhead, setPlaying } = useEditorStore();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [previewing, setPreviewing] = useState<string>();
  const audioRef = useRef<HTMLAudioElement>();
  const previewUrl = useRef<string>();
  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = undefined;
    setPreviewing(undefined);
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    previewUrl.current = undefined;
  };
  useEffect(() => () => {
    audioRef.current?.pause();
    if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
  }, []);
  const preview = (id: string, source: string | Blob) => {
    if (previewing === id) { stopPreview(); return; }
    stopPreview();
    const url = source instanceof Blob ? URL.createObjectURL(source) : source;
    if (source instanceof Blob) previewUrl.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;
    setPreviewing(id);
    audio.onended = stopPreview;
    void audio.play().catch(() => setError("This sound could not be previewed in the browser."));
  };
  const addBuiltIn = async (kind: BuiltInSfx, name: string) => {
    setError(""); setPlaying(false);
    try { addAudio(await readClip(synthesizeSfx(kind), name, useEditorStore.getState().playhead)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Sound could not be added."); }
  };
  const addProvided = async (file: typeof providedSounds[number]) => {
    setError(""); setPlaying(false);
    try {
      const response = await fetch(file.source);
      if (!response.ok) throw new Error(`Could not load ${file.name}.`);
      addAudio(await readClip(await response.blob(), file.name, useEditorStore.getState().playhead));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "This sound could not be added."); }
  };
  const importSounds = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError(""); setPlaying(false);
    try {
      let usedBytes = (useEditorStore.getState().project.soundAssets ?? []).reduce((sum, sound) => sum + sound.source.length, 0);
      for (const file of Array.from(files)) {
        const clip = await readClip(file, file.name, 0);
        if (usedBytes + clip.source.length > 75 * 1024 * 1024) throw new Error("The sound library has reached its 75 MB limit.");
        const sound: SoundAsset = { id: clip.id, name: file.name.replace(/\.[^.]+$/, ""), source: clip.source, sourceDuration: clip.sourceDuration };
        addSoundAsset(sound);
        usedBytes += sound.source.length;
      }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Audio files could not be imported."); }
    finally { setBusy(false); }
  };
  const term = useEditorStore(state => state.search.trim().toLowerCase());
  const matches = (name: string) => !term || name.toLowerCase().includes(term);
  const sounds = project.soundAssets ?? [];
  return <section className="sound-fx-shelf">
    <div className="sound-shelf-heading"><span>Sound effects & music</span><button onClick={() => input.current?.click()} disabled={busy}><Upload size={15} /> {busy ? "Importing" : "Import sounds"}</button></div>
    <input ref={input} hidden type="file" multiple accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm" onChange={event => { void importSounds(event.target.files); event.target.value = ""; }} />
    <div className="sound-asset-list">
      {builtInSounds.filter(sound => matches(sound.name)).map(sound => <div className="sound-asset" key={sound.id}>
        <button className="sound-preview" title={`${previewing === sound.id ? "Stop" : "Play"} ${sound.name}`} aria-label={`${previewing === sound.id ? "Stop" : "Play"} ${sound.name}`} onClick={() => preview(sound.id, synthesizeSfx(sound.id))}>{previewing === sound.id ? <Pause size={15} /> : <Play size={15} />}</button>
        <AudioLines size={17} /><span><strong>{sound.name}</strong><small>{sound.description}</small></span>
        <button className="sound-add" title={`Add ${sound.name} at playhead`} aria-label={`Add ${sound.name} at playhead`} onClick={() => void addBuiltIn(sound.id, sound.name)}><Plus size={17} /></button>
      </div>)}
      {providedSounds.filter(sound => matches(sound.name)).map(sound => <div className="sound-asset" key={sound.name}>
        <button className="sound-preview" title={`${previewing === sound.name ? "Stop" : "Play"} ${sound.name}`} aria-label={`${previewing === sound.name ? "Stop" : "Play"} ${sound.name}`} onClick={() => preview(sound.name, sound.source)}>{previewing === sound.name ? <Pause size={15} /> : <Play size={15} />}</button>
        <AudioLines size={17} /><span><strong>{sound.name}</strong><small>Provided audio</small></span>
        <button className="sound-add" title={`Add ${sound.name} at playhead`} aria-label={`Add ${sound.name} at playhead`} onClick={() => void addProvided(sound)}><Plus size={17} /></button>
      </div>)}
      {sounds.filter(sound => matches(sound.name)).map(sound => <div className="sound-asset" key={sound.id}>
        <button className="sound-preview" title={`${previewing === sound.id ? "Stop" : "Play"} ${sound.name}`} aria-label={`${previewing === sound.id ? "Stop" : "Play"} ${sound.name}`} onClick={() => preview(sound.id, sound.source)}>{previewing === sound.id ? <Pause size={15} /> : <Play size={15} />}</button>
        <AudioLines size={17} /><span><strong>{sound.name}</strong><small>{sound.sourceDuration.toFixed(1)} sec</small></span>
        <button className="sound-add" title={`Add ${sound.name} at playhead`} aria-label={`Add ${sound.name} at playhead`} onClick={() => addSoundToTimeline(sound)}><Plus size={17} /></button>
        <button className="sound-remove" title={`Remove ${sound.name} from library`} aria-label={`Remove ${sound.name} from library`} onClick={() => deleteSoundAsset(sound.id)}><Trash2 size={15} /></button>
      </div>)}
      {!builtInSounds.some(sound => matches(sound.name)) && !providedSounds.some(sound => matches(sound.name)) && !sounds.some(sound => matches(sound.name)) && <p className="empty-state">No sound effects match that search.</p>}
    </div>
    {error && <span role="alert" className="audio-error">{error}</span>}
    <small className="sound-shelf-hint">Click + to add at {playhead.toFixed(2)}s</small>
  </section>;
}

export function AssetBrowser() {
  const { project, activeCategory, setActiveCategory, search, setSearch, addAssetToActiveShot, addCustomAsset, deleteCustomAsset } = useEditorStore();
  const imageInput = useRef<HTMLInputElement>(null);
  const overlayInput = useRef<HTMLInputElement>(null);
  const subtitleInput = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [captionMessage, setCaptionMessage] = useState("");
  const addCaptionCues = useEditorStore(state => state.addCaptionCues);
  const importImage = async (file: File | undefined, kind: "background" | "prop") => {
    if (!file) return;
    setImageError("");
    try { addCustomAsset(await importedImage(file, kind)); }
    catch (reason) { setImageError(reason instanceof Error ? reason.message : "The image could not be imported."); }
  };
  const makeCaptions = (text: string) => {
    const clean = text.replace(/\s+/g, " ").trim();
    if (!clean) { setCaptionMessage("Add a transcript first."); return; }
    const words = clean.split(" ");
    const chunks: string[] = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && (next.length > 38 || line.split(" ").length >= 7)) { chunks.push(line); line = word; }
      else line = next;
    }
    if (line) chunks.push(line);
    const state = useEditorStore.getState();
    const total = state.project.shots.reduce((sum, shot) => sum + shot.duration, 0);
    const remaining = Math.max(0, total - state.playhead);
    if (remaining < .25) { setCaptionMessage("Move the playhead earlier to make room for captions."); return; }
    const wordCount = chunks.reduce((sum, chunk) => sum + chunk.split(" ").length, 0);
    let elapsed = state.playhead;
    const cues = chunks.map((caption, index) => {
      const duration = remaining * caption.split(" ").length / wordCount;
      const cue = { start: elapsed, end: index === chunks.length - 1 ? total : elapsed + duration, text: caption };
      elapsed += duration;
      return cue;
    });
    addCaptionCues(cues);
    setCaptionMessage(`${cues.length} timed captions added.`);
  };
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
  const filtered = [...assets, ...(project.customAssets ?? [])].filter((asset) => {
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
      {activeCategory === "Backgrounds" && !showFavorites && <div className="import-background-row">
        <button onClick={() => imageInput.current?.click()}><Upload size={15} /> Import Background</button>
        <input ref={imageInput} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => { void importImage(event.target.files?.[0], "background"); event.target.value = ""; }} />
        {imageError && <span role="alert" className="audio-error">{imageError}</span>}
      </div>}
      {activeCategory === "Props" && !showFavorites && <div className="import-background-row">
        <button onClick={() => overlayInput.current?.click()}><Upload size={15} /> Import Image / Green Screen</button>
        <input ref={overlayInput} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => { void importImage(event.target.files?.[0], "prop"); event.target.value = ""; }} />
        {imageError && <span role="alert" className="audio-error">{imageError}</span>}
      </div>}
      {activeCategory === "Text" && !showFavorites && <section className="caption-maker">
        <div className="sound-shelf-heading"><span>Timed captions</span><button onClick={() => subtitleInput.current?.click()}><Upload size={15} /> Import SRT/VTT</button></div>
        <input ref={subtitleInput} hidden type="file" accept=".srt,.vtt,text/vtt,application/x-subrip" onChange={async event => {
          const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
          try { const cues = parseSubtitleFile(await file.text()); if (!cues.length) throw new Error("No timed captions found. Choose a valid SRT or VTT file."); addCaptionCues(cues); setCaptionMessage(`${cues.length} timed captions imported.`); }
          catch (reason) { setCaptionMessage(reason instanceof Error ? reason.message : "The subtitle file could not be read."); }
        }} />
        <textarea aria-label="Transcript for captions" placeholder="Paste your voiceover transcript here..." value={transcript} onChange={event => setTranscript(event.target.value)} />
        <button onClick={() => makeCaptions(transcript)}>Create timed captions</button>
        <small>Timed across the remaining video. Speech transcription is not available offline yet.</small>
        {captionMessage && <span role="status">{captionMessage}</span>}
      </section>}
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
            {asset.imageData && <button className="asset-remove" type="button" title="Remove imported image" aria-label={`Remove ${asset.name} from imported backgrounds`} disabled={project.shots.some(shot => shot.objects.some(object => object.assetId === asset.id))} onClick={event => { event.stopPropagation(); deleteCustomAsset(asset.id); }}><Trash2 size={14} /></button>}
          </div>
        ))}
      </div>
      {activeCategory === "Sound FX" && !showFavorites && <SoundFxShelf />}
    </aside>
  );
}
