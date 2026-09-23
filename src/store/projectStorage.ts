import type { Project } from "../types/editor";

let database: Promise<IDBDatabase> | undefined;
function openDatabase() {
  database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("shorts-editor", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("projects");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = undefined; reject(request.error); };
  });
  return database;
}

export async function writeAutosave(project: Project) {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction("projects", "readwrite");
    transaction.objectStore("projects").put(project, "autosave");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function readAutosave(): Promise<Project | undefined> {
  try {
    const db = await openDatabase();
    const saved = await new Promise<Project | undefined>((resolve, reject) => {
      const request = db.transaction("projects").objectStore("projects").get("autosave");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    if (saved) return saved;
  } catch { /* Older browsers can still recover the previous small autosave. */ }
  try { return JSON.parse(localStorage.getItem("shorts-editor-autosave") ?? "null") ?? undefined; }
  catch { return undefined; }
}
