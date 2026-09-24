import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { defaultScreen } from "../data/screenContent";
import type { SceneObject, ScreenContent, ScreenMode } from "../types/editor";

export function ScreenControls({ object, update }: { object: SceneObject; update: (patch: Partial<SceneObject>) => void }) {
  const screen = { ...defaultScreen(object.assetId)!, ...object.screen };
  const imageInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [values, setValues] = useState(screen.graphValues.join(", "));
  const change = (patch: Partial<ScreenContent>) => update({ screen: { ...screen, ...patch } });
  const importImage = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { setError("Choose an image under 10 MB."); return; }
    try {
      const image = new Image();
      const url = URL.createObjectURL(file);
      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("This image could not be opened."));
          image.src = url;
        });
        const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
        change({ mode: "image", imageData: canvas.toDataURL("image/webp", .88) });
      } finally { URL.revokeObjectURL(url); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Image could not be imported."); }
  };

  return <section className="screen-controls">
    <div className="section-label">Display Content</div>
    <div className="fields">
      <label className="field"><span>Layout</span><select aria-label="Display layout" value={screen.mode} onChange={event => change({ mode: event.target.value as ScreenMode })}>
        <option value="text">Text / branding</option>
        <option value="notification">Notification</option>
        <option value="chart">Graph</option>
        <option value="map">Map</option>
        <option value="image">Picture</option>
      </select></label>
      <label className="field"><span>Brand / app</span><input aria-label="Display brand" value={screen.brand} maxLength={28} onChange={event => change({ brand: event.target.value })} /></label>
      <label className="field"><span>Heading</span><input aria-label="Display heading" value={screen.title} maxLength={54} onChange={event => change({ title: event.target.value })} /></label>
      {screen.mode !== "image" && <label className="field"><span>{screen.mode === "map" ? "Place" : "Message"}</span><textarea aria-label="Display message" rows={2} value={screen.body} maxLength={120} onChange={event => change({ body: event.target.value })} /></label>}
      <label className="field"><span>Accent</span><input aria-label="Display accent color" type="color" value={screen.accent} onChange={event => change({ accent: event.target.value })} /></label>
      {screen.mode === "chart" && <label className="field"><span>Graph values</span><input aria-label="Display graph values" value={values} onChange={event => setValues(event.target.value)} onBlur={() => {
        const parsed = values.split(/[\s,]+/).map(Number).filter(Number.isFinite).slice(0, 12).map(value => Math.max(0, Math.min(1000, value)));
        if (parsed.length >= 2) { change({ graphValues: parsed }); setValues(parsed.join(", ")); }
        else { setError("Enter at least two numbers."); setValues(screen.graphValues.join(", ")); }
      }} onKeyDown={event => { if (event.key === "Enter") event.currentTarget.blur(); }} /></label>}
    </div>
    <div className="screen-image-actions">
      <button type="button" onClick={() => imageInput.current?.click()}><ImagePlus size={16} /> {screen.imageData ? "Replace picture" : "Import picture"}</button>
      {screen.imageData && <button type="button" aria-label="Remove display picture" title="Remove display picture" onClick={() => change({ imageData: undefined, mode: "text" })}><Trash2 size={16} /></button>}
      <input ref={imageInput} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => { void importImage(event.target.files?.[0]); event.target.value = ""; }} />
    </div>
    {error && <span role="alert" className="audio-error">{error}</span>}
  </section>;
}
