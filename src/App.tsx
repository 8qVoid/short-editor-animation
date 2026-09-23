import { Box, Clapperboard, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetBrowser } from "./components/AssetBrowser";
import { EditorCanvas } from "./components/EditorCanvas";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { Timeline } from "./components/Timeline";
import { TopBar } from "./components/TopBar";
import { loadAutosave, useEditorStore } from "./store/editorStore";
import "./styles.css";

export default function App() {
  const { loadProject, autosave, deleteSelected, duplicateSelected, undo, redo } = useEditorStore();
  const [restored, setRestored] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"assets" | "properties" | "timeline">("assets");

  useEffect(() => {
    let cancelled = false;
    const initial = useEditorStore.getState().project;
    void loadAutosave().then(saved => {
      if (cancelled) return;
      if (saved && useEditorStore.getState().project === initial) loadProject(saved);
      setRestored(true);
    });
    return () => { cancelled = true; };
  }, [loadProject]);

  useEffect(() => {
    if (!restored) return;
    let previous = useEditorStore.getState().project;
    const interval = window.setInterval(() => {
      const current = useEditorStore.getState().project;
      if (current !== previous || useEditorStore.getState().saveError) { autosave(); previous = current; }
    }, 3500);
    return () => window.clearInterval(interval);
  }, [autosave, restored]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT", "AUDIO"].includes(target.tagName)) return;
      if (event.code === "Space" && target.tagName !== "BUTTON") {
        event.preventDefault();
        const state = useEditorStore.getState();
        const total = state.project.shots.reduce((sum, shot) => sum + shot.duration, 0);
        if (!state.playing && state.playhead >= total) state.seek(0);
        state.setPlaying(!state.playing);
      }
      if (event.key === "Delete" || event.key === "Backspace") deleteSelected();
      if (event.ctrlKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        duplicateSelected();
      }
      if (event.ctrlKey && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      if ((event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "z") || (event.ctrlKey && event.key.toLowerCase() === "y")) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteSelected, duplicateSelected, redo, undo]);

  return (
    <div className={`app mobile-panel-${mobilePanel}`}>
      <TopBar />
      <div className="workspace">
        <AssetBrowser />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
      <Timeline />
      <nav className="mobile-dock" aria-label="Mobile editor panels">
        <button className={mobilePanel === "assets" ? "active" : ""} onClick={() => setMobilePanel("assets")}><Box size={18} /> Assets</button>
        <button className={mobilePanel === "properties" ? "active" : ""} onClick={() => setMobilePanel("properties")}><SlidersHorizontal size={18} /> Edit</button>
        <button className={mobilePanel === "timeline" ? "active" : ""} onClick={() => setMobilePanel("timeline")}><Clapperboard size={18} /> Timeline</button>
      </nav>
    </div>
  );
}
