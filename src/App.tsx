import { Box, ChevronsDownUp, Clapperboard, SlidersHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
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
  const [sheetHeight, setSheetHeight] = useState(38);
  const chooseMobilePanel = (panel: "assets" | "properties" | "timeline") => {
    setMobilePanel(panel);
    setSheetHeight(panel === "timeline" ? 48 : 38);
  };

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
    const saveOnExit = () => autosave();
    const saveWhenHidden = () => { if (document.visibilityState === "hidden") autosave(); };
    window.addEventListener("pagehide", saveOnExit);
    document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      window.removeEventListener("pagehide", saveOnExit);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, [autosave]);

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
    <div className={`app mobile-panel-${mobilePanel}`} style={{ "--mobile-sheet": sheetHeight } as CSSProperties}>
      <TopBar />
      <div className="workspace">
        <AssetBrowser />
        <EditorCanvas />
        <PropertiesPanel />
      </div>
      <Timeline />
      <button
        className="mobile-sheet-handle"
        aria-label="Resize mobile panel"
        title="Drag to resize panel"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          const move = (moveEvent: PointerEvent) => {
            const next = Math.round((1 - moveEvent.clientY / window.innerHeight) * 100) - 6;
            setSheetHeight(Math.max(18, Math.min(68, next)));
          };
          const stop = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", stop);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", stop);
        }}
      >
        <span />
        <ChevronsDownUp size={15} />
      </button>
      <nav className="mobile-dock" aria-label="Mobile editor panels">
        <button className={mobilePanel === "assets" ? "active" : ""} onClick={() => chooseMobilePanel("assets")}><Box size={18} /> Assets</button>
        <button className={mobilePanel === "properties" ? "active" : ""} onClick={() => chooseMobilePanel("properties")}><SlidersHorizontal size={18} /> Edit</button>
        <button className={mobilePanel === "timeline" ? "active" : ""} onClick={() => chooseMobilePanel("timeline")}><Clapperboard size={18} /> Timeline</button>
      </nav>
    </div>
  );
}
