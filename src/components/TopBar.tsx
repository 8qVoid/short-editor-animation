import { FolderOpen, Monitor, Redo2, Save, Smartphone, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { loadAutosave, useEditorStore } from "../store/editorStore";
import type { Project } from "../types/editor";
import { ExportButton } from "./ExportButton";

const aspectPresets = [
  { label: "9:16", title: "Vertical shorts", width: 1080, height: 1920, icon: Smartphone },
  { label: "1:1", title: "Square post", width: 1080, height: 1080, icon: Smartphone },
  { label: "4:5", title: "Portrait feed", width: 1080, height: 1350, icon: Smartphone },
  { label: "3:4", title: "Portrait classic", width: 1080, height: 1440, icon: Smartphone },
  { label: "16:9", title: "Wide video", width: 1920, height: 1080, icon: Monitor },
  { label: "4:3", title: "Classic horizontal", width: 1440, height: 1080, icon: Monitor }
];

export function TopBar() {
  const { project, saveProjectFile, loadProject, undo, redo, stageScale, stagePosition, setStageView, setCanvasSize } = useEditorStore();
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
          {aspectPresets.map(({ label, title, width, height, icon: Icon }) => (
            <button
              key={label}
              title={title}
              aria-label={`${label} ${title}`}
              className={project.canvas.width === width && project.canvas.height === height ? "active" : ""}
              onClick={() => setCanvasSize(width, height)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
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
