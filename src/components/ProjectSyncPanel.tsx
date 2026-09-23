import { Cloud, HardDrive, Info } from "lucide-react";
import { useEditorStore } from "../store/editorStore";

export function ProjectSyncPanel() {
  const { project, saveProjectFile } = useEditorStore();
  return (
    <section className="sync-panel" aria-label="Project save status">
      <div><HardDrive size={16} /><strong>Local autosave</strong><span>On this device</span></div>
      <div><Cloud size={16} /><strong>Cloud sync</strong><span>Ready for a login backend</span></div>
      <button onClick={saveProjectFile}><Info size={15} /> Download {project.name}</button>
    </section>
  );
}
