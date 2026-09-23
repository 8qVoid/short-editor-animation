import { FolderOpen, Monitor, Redo2, Save, Smartphone, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { loadAutosave, useEditorStore } from "../store/editorStore";
import type { Project } from "../types/editor";
import { ExportButton } from "./ExportButton";

export function TopBar() {
  const { project, saveProjectFile, loadProject, undo, redo, stageScale, stagePosition, setStageView, setCanvasSize } = useEditorStore();
  const vertical = project.canvas.height > project.canvas.width;
  const saveError = useEditorStore(state => state.saveError);

  return (
    <header className="topbar">
      <div>
        <strong>{project.name}</strong>
        {saveError && <span role="alert">{saveError}</span>}
        <span>{project.canvas.width} × {project.canvas.height} · {project.canvas.fps} FPS</span>
      </div>
      <nav>
        <button title="Undo" onClick={undo}><Undo2 size={17} /></button>
        <button title="Redo" onClick={redo}><Redo2 size={17} /></button>
        <button title="Zoom out" onClick={() => setStageView(Math.max(0.18, stageScale - 0.05), stagePosition)}><ZoomOut size={17} /></button>
        <button title="Zoom in" onClick={() => setStageView(Math.min(0.75, stageScale + 0.05), stagePosition)}><ZoomIn size={17} /></button>
        <div className="ratio-toggle" role="group" aria-label="Canvas aspect ratio">
          <button title="Shorts vertical" className={vertical ? "active" : ""} onClick={() => setCanvasSize(1080, 1920)}><Smartphone size={16} /> Shorts</button>
          <button title="Longform horizontal" className={!vertical ? "active" : ""} onClick={() => setCanvasSize(1920, 1080)}><Monitor size={16} /> Wide</button>
        </div>
        <button onClick={saveProjectFile}><Save size={17} /> Save Project</button>
        <label className="file-button">
          <FolderOpen size={17} /> Load Project
          <input
            type="file"
            accept="application/json"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              loadProject(JSON.parse(await file.text()) as Project);
            }}
          />
        </label>
        <button onClick={async () => {
          const autosave = await loadAutosave();
          if (autosave) loadProject(autosave);
        }}>Load Autosave</button>
        <ExportButton />
      </nav>
    </header>
  );
}
