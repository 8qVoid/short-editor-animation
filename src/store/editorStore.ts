import { create } from "zustand";
import { assets } from "../data/assets";
import type { Asset, AudioClip, CaptionCue, Project, SceneObject, Shot, ShotTransitionId, SoundAsset, Transform } from "../types/editor";
import { readAutosave, writeAutosave } from "./projectStorage";
import { cameraAt, cameraKeys, insertKey, motionKeys, objectAt, snapshot, type MotionPreset } from "../animation";
import type { Camera, Easing } from "../types/editor";
import { defaultScreen } from "../data/screenContent";

const projectId = () => crypto.randomUUID();

const baseTransform = (x: number, y: number, width: number, height: number): Transform => ({
  x,
  y,
  width,
  height,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  opacity: 1,
  flipX: false,
  flipY: false
});

const starterShot = (): Shot => ({
  id: projectId(),
  name: "Shot 1",
  duration: 2.5,
  camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
  objects: [
    {
      id: projectId(),
      assetId: "bg-bedroom",
      name: "Bedroom",
      kind: "background",
      atmosphere: "dust",
      transform: baseTransform(0, 0, 1080, 1920),
      locked: false,
      hidden: false,
      layer: 0
    },
    {
      id: projectId(),
      assetId: "char-young-man",
      name: "Young Man",
      kind: "character",
      transform: baseTransform(330, 760, 420, 760),
      locked: false,
      hidden: false,
      layer: 1,
      expression: "neutral",
      pose: "explaining",
      mouth: "auto",
      action: "idle",
      view: "front",
      closet: []
    }
  ]
});

const createProject = (): Project => {
  const shot = starterShot();
  return {
    id: projectId(),
    name: "Explainer Short",
    canvas: { width: 1080, height: 1920, fps: 30 },
    shots: [shot],
    activeShotId: shot.id
  };
};

type HistoryEntry = Project;

interface EditorState {
  autoKey: boolean;
  setAutoKey: (value: boolean) => void;
  addKeyframe: (id: string) => void;
  deleteKeyframe: (id: string, time: number) => void;
  moveKeyframe: (id: string, from: number, to: number) => void;
  setKeyEasing: (id: string, time: number, easing: Easing) => void;
  applyMotion: (id: string, preset: MotionPreset) => void;
  updateCamera: (patch: Partial<Camera>) => void;
  applyCameraMotion: (preset: string) => void;
  addTimeCard: () => void;
  addStoryBeat: (beat: "awkward" | "meanwhile" | "closeup" | "reveal") => void;
  reorderObject: (id: string, direction: number) => void;
  saveError?: string;
  addAudio: (clip: AudioClip) => void;
  addSoundAsset: (asset: SoundAsset) => void;
  deleteSoundAsset: (id: string) => void;
  addSoundToTimeline: (asset: SoundAsset) => void;
  addCaptionCues: (cues: CaptionCue[]) => void;
  addCustomAsset: (asset: Asset) => void;
  deleteCustomAsset: (id: string) => void;
  updateAudio: (id: string, patch: Partial<AudioClip>) => void;
  deleteAudio: (id: string) => void;
  playhead: number;
  playing: boolean;
  seek: (time: number) => void;
  setPlaying: (playing: boolean) => void;
  splitShot: () => void;
  moveShot: (id: string, target: string) => void;
  project: Project;
  selectedIds: string[];
  search: string;
  activeCategory: Asset["category"];
  stageScale: number;
  stagePosition: { x: number; y: number };
  history: HistoryEntry[];
  future: HistoryEntry[];
  setSearch: (search: string) => void;
  setActiveCategory: (category: Asset["category"]) => void;
  selectObject: (id?: string, additive?: boolean) => void;
  setStageView: (stageScale: number, stagePosition: { x: number; y: number }) => void;
  setCanvasSize: (width: number, height: number) => void;
  addAssetToActiveShot: (asset: Asset, x?: number, y?: number) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  updateObjectTransform: (id: string, transform: Partial<Transform>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  setShotDuration: (duration: number) => void;
  setShotTransition: (id: string, transition: ShotTransitionId, duration?: number) => void;
  addShot: () => void;
  duplicateShot: (shotId?: string) => void;
  deleteShot: (shotId: string) => void;
  setActiveShot: (shotId: string) => void;
  saveProjectFile: () => void;
  loadProject: (project: Project) => void;
  undo: () => void;
  redo: () => void;
  autosave: () => void;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function withHistory(state: EditorState, project: Project): Partial<EditorState> {
  const start = project.shots.slice(0, project.shots.findIndex(s => s.id === project.activeShotId)).reduce((sum, s) => sum + s.duration, 0);
  const oldStart = state.project.shots.slice(0, state.project.shots.findIndex(s => s.id === state.project.activeShotId)).reduce((sum, s) => sum + s.duration, 0);
  const duration = activeShot(project).duration;
  return {
    project,
    playing: false,
    playhead: start + (project.activeShotId === state.project.activeShotId ? Math.min(Math.max(0, state.playhead - oldStart), Math.max(0, duration - 1 / project.canvas.fps)) : 0),
    // Projects are updated immutably; retain audio strings without copying them per edit.
    history: [...state.history.slice(-29), state.project],
    future: []
  };
}

function activeShot(project: Project) {
  return project.shots.find((shot) => shot.id === project.activeShotId) ?? project.shots[0];
}

function localTime(state: EditorState) {
  const shot = activeShot(state.project);
  const start = state.project.shots.slice(0, state.project.shots.indexOf(shot)).reduce((sum, s) => sum + s.duration, 0);
  return (shot.animationOffset ?? 0) + Math.round(Math.min(shot.duration, Math.max(0, state.playhead - start)) * state.project.canvas.fps) / state.project.canvas.fps;
}

function editAnimated(state: EditorState, object: SceneObject, patch: Partial<SceneObject>) {
  if (!state.autoKey && !object.keyframes?.length) return { ...object, ...patch };
  const time = localTime(state);
  const current = objectAt(object, time);
  const keys = object.keyframes?.length ? object.keyframes : [snapshot(object, activeShot(state.project).animationOffset ?? 0)];
  const existing = keys.find(k => Math.abs(k.time - time) < .0001);
  return { ...object, keyframes: insertKey(keys, snapshot({ ...current, ...patch }, time, existing?.easing)) };
}

function mutateActiveShot(project: Project, mutate: (shot: Shot) => Shot): Project {
  const activeId = project.activeShotId;
  return {
    ...project,
    shots: project.shots.map((shot) => (shot.id === activeId ? mutate(shot) : shot))
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  autoKey: false,
  setAutoKey: autoKey => set({ autoKey }),
  addKeyframe: id => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({ ...shot, objects: shot.objects.map(o => o.id !== id ? o : {
    ...o, keyframes: insertKey(o.keyframes?.length ? o.keyframes : [snapshot(o, shot.animationOffset ?? 0)], snapshot(objectAt(o, localTime(state)), localTime(state)))
  }) })))),
  deleteKeyframe: (id, time) => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({...shot, objects: shot.objects.map(o => o.id !== id ? o : {
    ...o, transform: objectAt(o, localTime(state)).transform, keyframes: o.keyframes?.filter(k => Math.abs(k.time - time) > .0001)
  })})))),
  moveKeyframe: (id, from, to) => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({...shot, objects: shot.objects.map(o => {
    const key = o.keyframes?.find(k => k.time === from);
    if (o.id !== id || !key) return o;
    const offset = shot.animationOffset ?? 0;
    const time = offset + Math.round(Math.max(0, Math.min(shot.duration - 1 / state.project.canvas.fps, to - offset)) * state.project.canvas.fps) / state.project.canvas.fps;
    return {...o, keyframes: insertKey(o.keyframes!.filter(k => k !== key), {...key,time})};
  })})))),
  setKeyEasing: (id, time, easing) => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({...shot,objects:shot.objects.map(o=>o.id!==id?o:{...o,keyframes:o.keyframes?.map(k=>k.time===time?{...k,easing}:k)})})))),
  applyMotion: (id, preset) => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({...shot, objects: shot.objects.map(o => o.id !== id ? o : {
    ...o, transform: objectAt(o, localTime(state)).transform, keyframes: motionKeys(o, preset, shot.animationOffset ?? 0, (shot.animationOffset ?? 0) + Math.max(0, shot.duration - 1 / state.project.canvas.fps), state.project.canvas.width)
  })})))),
  updateCamera: patch => set(state => withHistory(state, mutateActiveShot(state.project, shot => {
    const time = localTime(state), camera = { ...cameraAt(shot,time), ...patch };
    camera.zoom = Math.max(.25, Math.min(4, camera.zoom));
    if (!Object.values(camera).every(Number.isFinite)) return shot;
    return shot.cameraKeyframes?.length ? {...shot,cameraKeyframes:insertKey(shot.cameraKeyframes,{time,camera,easing:"smooth"})} : {...shot,camera};
  }))),
  applyCameraMotion: preset => set(state => withHistory(state, mutateActiveShot(state.project, shot => ({...shot, camera: preset === "static" ? {x:0,y:0,zoom:1,rotation:0} : shot.camera,
    cameraKeyframes: cameraKeys(shot.camera, preset, shot.animationOffset ?? 0, (shot.animationOffset ?? 0) + Math.max(0, shot.duration - 1 / state.project.canvas.fps), state.project.canvas.width)
  })))),
  reorderObject: (id, direction) => set(state => withHistory(state, mutateActiveShot(state.project, shot => {
    const objects = [...shot.objects].sort((a,b)=>a.layer-b.layer), index=objects.findIndex(o=>o.id===id), next=index+direction;
    if(index<0 || next<0 || next>=objects.length || objects[index].kind==='background' || objects[next].kind==='background')return shot;
    [objects[index],objects[next]]=[objects[next],objects[index]];
    return {...shot,objects:objects.map((o,layer)=>({...o,layer}))};
  }))),
  addTimeCard: () => set(state => {
    const {width,height}=state.project.canvas;
    const title: SceneObject = {id:projectId(),assetId:"text-caption",name:"5 seconds later...",kind:"text",transform:baseTransform(width*.08,height*.38,width*.84,height*.24),locked:false,hidden:false,layer:1,text:"5 seconds later..."};
    const shot: Shot = {id:projectId(),name:"5 seconds later...",duration:2,camera:{x:0,y:0,zoom:1,rotation:0},objects:[{id:projectId(),assetId:"bg-time-card",name:"Time card",kind:"background",transform:baseTransform(0,0,width,height),locked:true,hidden:false,layer:0},title]};
    const shots=[...state.project.shots], index=shots.findIndex(s=>s.id===state.project.activeShotId);
    const insertion=shots.slice(0,index+1).reduce((n,s)=>n+s.duration,0);
    shots.splice(index+1,0,shot);
    const audioClips=state.project.audioClips?.map(c=>c.start>=insertion?{...c,start:c.start+shot.duration}:c);
    return {...withHistory(state,{...state.project,shots,audioClips,activeShotId:shot.id}),selectedIds:[title.id]};
  }),
  addStoryBeat: beat => set(state => {
    const { width, height } = state.project.canvas;
    const index = state.project.shots.findIndex(s => s.id === state.project.activeShotId);
    const source = state.project.shots[index];
    const background = source.objects.find(o => o.kind === "background");
    const labels = {
      awkward: { name: "Awkward Pause", text: "...", duration: 1.4 },
      meanwhile: { name: "Meanwhile", text: "Meanwhile...", duration: 1.8 },
      closeup: { name: "Dramatic Close-up", text: "", duration: 1.2 },
      reveal: { name: "One reveal later", text: "One reveal later...", duration: 1.6 }
    }[beat];
    const objects = background ? [{ ...clone(background), id: projectId(), locked: true, layer: 0 }] : [];
    if (labels.text) objects.push({
      id: projectId(),
      assetId: "text-caption",
      name: labels.text,
      kind: "text",
      transform: baseTransform(width * .08, height * .39, width * .84, height * .18),
      locked: false,
      hidden: false,
      layer: 2,
      text: labels.text
    });
    const shot: Shot = {
      id: projectId(),
      name: labels.name,
      duration: labels.duration,
      camera: { x: 0, y: 0, zoom: 1, rotation: 0 },
      cameraKeyframes: beat === "closeup"
        ? cameraKeys(source.camera, "push-in", source.animationOffset ?? 0, (source.animationOffset ?? 0) + labels.duration, width)
        : undefined,
      objects: beat === "closeup"
        ? clone(source.objects).map((o: SceneObject) => ({ ...o, id: projectId() }))
        : objects
    };
    if (beat === "awkward") {
      shot.objects.push({
        id: projectId(),
        assetId: "effect-thought",
        name: "Awkward silence",
        kind: "effect",
        transform: baseTransform(width * .37, height * .32, width * .26, height * .12),
        locked: false,
        hidden: false,
        layer: 3
      });
    }
    const shots = [...state.project.shots];
    shots.splice(index + 1, 0, shot);
    return { ...withHistory(state, { ...state.project, shots, activeShotId: shot.id }), selectedIds: [] };
  }),
  addAudio: (clip) => set(state => {
    const shots = [...state.project.shots];
    const total = shots.reduce((sum, shot) => sum + shot.duration, 0);
    const end = clip.start + clip.duration;
    if (end > total) shots[shots.length - 1] = { ...shots[shots.length - 1], duration: shots[shots.length - 1].duration + Math.ceil((end - total) * state.project.canvas.fps) / state.project.canvas.fps };
    return withHistory(state, { ...state.project, shots, audioClips: [...state.project.audioClips ?? [], clip] });
  }),
  addSoundAsset: asset => set(state => withHistory(state, { ...state.project, soundAssets: [...state.project.soundAssets ?? [], asset] })),
  deleteSoundAsset: id => set(state => withHistory(state, { ...state.project, soundAssets: (state.project.soundAssets ?? []).filter(asset => asset.id !== id) })),
  addSoundToTimeline: asset => {
    const state = get();
    const clip: AudioClip = { id: projectId(), name: asset.name, source: asset.source, sourceDuration: asset.sourceDuration, start: state.playhead, trimStart: 0, duration: asset.sourceDuration, volume: 1, muted: false };
    get().addAudio(clip);
  },
  addCaptionCues: cues => set(state => {
    if (!cues.length) return {};
    const width = state.project.canvas.width;
    const height = state.project.canvas.height;
    let shotStart = 0;
    let sequence = 0;
    const shots = state.project.shots.map(shot => {
      const objects = [...shot.objects];
      for (const cue of cues) {
        const from = Math.max(cue.start, shotStart);
        const until = Math.min(cue.end, shotStart + shot.duration);
        if (until <= from) continue;
        sequence += 1;
        const offset = shot.animationOffset ?? 0;
        objects.push({
          id: projectId(), assetId: "text-caption", name: `Subtitle ${sequence}`, kind: "text",
          transform: baseTransform(width * .08, height * .78, width * .84, height * .12),
          locked: false, hidden: false, layer: objects.length, text: cue.text,
          fontFamily: "Arial", fontSize: Math.round(width * .052), fontStyle: "bold", textAlign: "center",
          textColor: "#ffffff", outlineWidth: Math.max(3, Math.round(width * .004)),
          visibleFrom: offset + from - shotStart, visibleUntil: offset + until - shotStart
        });
      }
      shotStart += shot.duration;
      return { ...shot, objects };
    });
    return { ...withHistory(state, { ...state.project, shots }), selectedIds: [] };
  }),
  addCustomAsset: asset => set(state => withHistory(state, { ...state.project, customAssets: [...state.project.customAssets ?? [], asset] })),
  deleteCustomAsset: id => set(state => {
    if (state.project.shots.some(shot => shot.objects.some(object => object.assetId === id))) return {};
    return withHistory(state, { ...state.project, customAssets: (state.project.customAssets ?? []).filter(asset => asset.id !== id) });
  }),
  updateAudio: (id, patch) => set(state => {
    const audioClips = (state.project.audioClips ?? []).map(clip => {
      if (clip.id !== id) return clip;
      const next = { ...clip, ...patch, id: clip.id, source: clip.source, sourceDuration: clip.sourceDuration };
      if (![next.start, next.trimStart, next.duration, next.volume].every(Number.isFinite)) return clip;
      next.start = Math.max(0, next.start);
      next.trimStart = Math.max(0, Math.min(next.sourceDuration - .01, next.trimStart));
      next.duration = Math.max(.01, Math.min(next.sourceDuration - next.trimStart, next.duration));
      next.volume = Math.max(0, Math.min(1, next.volume));
      return next;
    });
    const shots = [...state.project.shots];
    const total = shots.reduce((sum, shot) => sum + shot.duration, 0);
    const end = Math.max(0, ...audioClips.map(clip => clip.start + clip.duration));
    if (end > total) shots[shots.length - 1] = { ...shots[shots.length - 1], duration: shots[shots.length - 1].duration + Math.ceil((end - total) * state.project.canvas.fps) / state.project.canvas.fps };
    return withHistory(state, { ...state.project, shots, audioClips });
  }),
  deleteAudio: id => set(state => withHistory(state, { ...state.project, audioClips: (state.project.audioClips ?? []).filter(clip => clip.id !== id) })),
  playhead: 0,
  playing: false,
  setPlaying: (playing) => set({ playing }),
  seek: (time) => set(state => {
    const total = state.project.shots.reduce((sum, s) => sum + s.duration, 0);
    const playhead = Math.max(0, Math.min(total, time));
    let end = 0;
    const shot = state.project.shots.find(s => { end += s.duration; return playhead < end; }) ?? state.project.shots[state.project.shots.length - 1];
    return { playhead, project: shot.id === state.project.activeShotId ? state.project : { ...state.project, activeShotId: shot.id }, selectedIds: shot.id === state.project.activeShotId ? state.selectedIds : [] };
  }),
  splitShot: () => set(state => {
    const index = state.project.shots.findIndex(s => s.id === state.project.activeShotId);
    const source = state.project.shots[index];
    const start = state.project.shots.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
    const frames = Math.round(source.duration * state.project.canvas.fps);
    const cut = Math.round((state.playhead - start) * state.project.canvas.fps);
    if (cut < 1 || cut >= frames) return {};
    const duration = cut / state.project.canvas.fps;
    const second = { ...clone(source), id: projectId(), name: `${source.name} Split`, duration: (frames - cut) / state.project.canvas.fps, animationOffset: (source.animationOffset ?? 0) + duration };
    second.objects = second.objects.map(o => ({ ...o, id: projectId() }));
    const shots = [...state.project.shots];
    shots.splice(index, 1, { ...source, duration }, second);
    return { ...withHistory(state, { ...state.project, shots, activeShotId: second.id }), selectedIds: [] };
  }),
  moveShot: (id, target) => set(state => {
    if (id === target) return {};
    const shots = [...state.project.shots];
    const from = shots.findIndex(s => s.id === id);
    const to = shots.findIndex(s => s.id === target);
    if (from < 0 || to < 0) return {};
    shots.splice(to, 0, shots.splice(from, 1)[0]);
    return withHistory(state, { ...state.project, shots, activeShotId: id });
  }),
  project: createProject(),
  selectedIds: [],
  search: "",
  activeCategory: "Characters",
  stageScale: 0.36,
  stagePosition: { x: 320, y: 32 },
  history: [],
  future: [],
  setSearch: (search) => set({ search }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setCanvasSize: (width, height) =>
    set((state) => {
      if (state.project.canvas.width === width && state.project.canvas.height === height) return {};
      const sx = width / state.project.canvas.width;
      const sy = height / state.project.canvas.height;
      const sizeRatio = Math.min(width, height) / Math.min(state.project.canvas.width, state.project.canvas.height);
      const resize = (t: Transform): Transform => ({ ...t, x: t.x * sx, y: t.y * sy, width: t.width * sizeRatio, height: t.height * sizeRatio });
      const shots = state.project.shots.map((shot) => ({
        ...shot,
        camera: { ...shot.camera, x: shot.camera.x * sx, y: shot.camera.y * sy },
        cameraKeyframes: shot.cameraKeyframes?.map(k=>({...k,camera:{...k.camera,x:k.camera.x*sx,y:k.camera.y*sy}})),
        objects: shot.objects.map((object) => {
          if (object.kind === "background") {
            return {
              ...object,
              transform: { ...object.transform, x: 0, y: 0, width, height, scaleX: 1, scaleY: 1 },
              keyframes: object.keyframes?.map(k=>({...k,transform:{...k.transform,x:0,y:0,width,height,scaleX:1,scaleY:1}}))
            };
          }
          return {
            ...object,
            transform: resize(object.transform),
            keyframes: object.keyframes?.map(k=>({...k,transform:resize(k.transform)}))
          };
        })
      }));
      return withHistory(state, { ...state.project, canvas: { ...state.project.canvas, width, height }, shots });
    }),
  selectObject: (id, additive = false) =>
    set((state) => {
      if (!id) return { selectedIds: [] };
      if (!additive) return { selectedIds: [id] };
      return {
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter((selectedId) => selectedId !== id)
          : [...state.selectedIds, id]
      };
    }),
  setStageView: (stageScale, stagePosition) => set({ stageScale, stagePosition }),
  addAssetToActiveShot: (asset, x = 340, y = 680) =>
    set((state) => {
      const layer = activeShot(state.project).objects.length;
      const dimensions =
        asset.kind === "background"
          ? { x: 0, y: 0, width: state.project.canvas.width, height: state.project.canvas.height }
          : asset.kind === "text"
            ? { x, y, width: 520, height: 120 }
          : asset.kind === "character"
              ? { x, y, width: 380, height: 690 }
              : asset.imageWidth && asset.imageHeight
                ? (() => { const scale = Math.min(600 / asset.imageWidth, 760 / asset.imageHeight); return { x, y, width: asset.imageWidth * scale, height: asset.imageHeight * scale }; })()
              : asset.id === "prop-phone" ? { x, y, width: 300, height: 520 }
              : asset.id === "prop-laptop" ? { x, y, width: 460, height: 320 }
              : asset.id === "prop-brand-sign" ? { x, y, width: 500, height: 330 }
              : { x, y, width: 260, height: 220 };
      const object: SceneObject = {
        id: projectId(),
        assetId: asset.id,
        name: asset.name,
        kind: asset.kind,
        atmosphere: asset.kind === "background" ? asset.id === "bg-time-card" ? "none" : asset.tags.some(tag => ["outside", "outdoor", "exterior"].includes(tag)) ? "breeze" : "dust" : undefined,
        transform: baseTransform(dimensions.x, dimensions.y, dimensions.width, dimensions.height),
        locked: false,
        hidden: false,
        layer,
        expression: asset.kind === "character" ? "neutral" : undefined,
        pose: asset.kind === "character" ? "arms-down" : undefined,
        mouth: asset.kind === "character" ? "auto" : undefined,
        action: asset.kind === "character" ? "idle" : undefined,
        view: asset.kind === "character" ? "front" : undefined,
        closet: asset.kind === "character" ? [] : undefined,
        text: asset.kind === "text" ? "YOUR SHORTS CAPTION" : undefined,
        screen: defaultScreen(asset.id)
      };
      const project = mutateActiveShot(state.project, (shot) => ({
        ...shot,
        objects: asset.kind === "background"
          ? [{ ...object, layer: -1 }, ...shot.objects.filter(item => item.kind !== "background")]
          : [...shot.objects, object]
      }));
      return { ...withHistory(state, project), selectedIds: [object.id] };
    }),
  updateObject: (id, patch) =>
    set((state) => {
      const project = mutateActiveShot(state.project, (shot) => ({
        ...shot,
        objects: shot.objects.map((object) => (object.id === id ?
          Object.keys(patch).some(key => ["action", "expression", "pose", "mouth", "view"].includes(key)) ? editAnimated(state, object, patch) : { ...object, ...patch } : object))
      }));
      return withHistory(state, project);
    }),
  updateObjectTransform: (id, transform) =>
    set((state) => {
      const project = mutateActiveShot(state.project, (shot) => ({
        ...shot,
        objects: shot.objects.map((object) =>
          object.id === id ? editAnimated(state, object, { transform: { ...objectAt(object, localTime(state)).transform, ...transform } }) : object
        )
      }));
      return withHistory(state, project);
    }),
  deleteSelected: () =>
    set((state) => {
      const selected = new Set(state.selectedIds);
      const project = mutateActiveShot(state.project, (shot) => ({
        ...shot,
        objects: shot.objects.filter((object) => !selected.has(object.id))
      }));
      return { ...withHistory(state, project), selectedIds: [] };
    }),
  duplicateSelected: () =>
    set((state) => {
      const selected = new Set(state.selectedIds);
      const copies: SceneObject[] = [];
      const project = mutateActiveShot(state.project, (shot) => {
        const objects = [...shot.objects];
        shot.objects.forEach((object) => {
          if (selected.has(object.id)) {
            const copy = clone(object);
            copy.id = projectId();
            copy.name = `${object.name} Copy`;
            copy.layer = objects.length + copies.length;
            copy.transform.x += 42;
            copy.transform.y += 42;
            copy.keyframes = copy.keyframes?.map(k=>({...k,transform:{...k.transform,x:k.transform.x+42,y:k.transform.y+42}}));
            copies.push(copy);
          }
        });
        return { ...shot, objects: [...objects, ...copies] };
      });
      return { ...withHistory(state, project), selectedIds: copies.map((copy) => copy.id) };
    }),
  setShotDuration: (duration) =>
    set((state) => !Number.isFinite(duration) || duration <= 0 ? {} : withHistory(state, mutateActiveShot(state.project, (shot) => ({ ...shot, duration: Math.max(1, Math.round(duration * state.project.canvas.fps)) / state.project.canvas.fps })))),
  setShotTransition: (id, transition, duration) => set(state => {
    const project = { ...state.project, shots: state.project.shots.map(shot => shot.id !== id ? shot : {
      ...shot,
      transition,
      transitionDuration: duration === undefined ? shot.transitionDuration ?? .5 : Math.max(.1, Math.min(shot.duration, Number.isFinite(duration) ? duration : .5))
    }) };
    return withHistory(state, project);
  }),
  addShot: () =>
    set((state) => {
      const shot: Shot = { ...starterShot(), name: `Shot ${state.project.shots.length + 1}` };
      const shots = [...state.project.shots];
      shots.splice(shots.findIndex(s => s.id === state.project.activeShotId) + 1, 0, shot);
      return { ...withHistory(state, { ...state.project, shots, activeShotId: shot.id }), selectedIds: [] };
    }),
  duplicateShot: (shotId) =>
    set((state) => {
      const source = shotId ? state.project.shots.find(shot => shot.id === shotId) : activeShot(state.project);
      if (!source) return {};
      const shot = clone(source);
      shot.id = projectId();
      shot.name = `${source.name} Copy`;
      shot.objects = shot.objects.map((object) => ({ ...object, id: projectId() }));
      const shots = [...state.project.shots];
      shots.splice(shots.findIndex(s => s.id === source.id) + 1, 0, shot);
      return { ...withHistory(state, { ...state.project, shots, activeShotId: shot.id }), selectedIds: [] };
    }),
  deleteShot: (shotId) =>
    set((state) => {
      if (state.project.shots.length === 1) return {};
      const shots = state.project.shots.filter((shot) => shot.id !== shotId);
      return withHistory(state, {
        ...state.project,
        shots,
        activeShotId: state.project.activeShotId === shotId ? shots[0].id : state.project.activeShotId
      });
    }),
  setActiveShot: (activeShotId) => {
    const state = get();
    const index = state.project.shots.findIndex(s => s.id === activeShotId);
    if (index < 0) return;
    state.seek(state.project.shots.slice(0, index).reduce((sum, s) => sum + s.duration, 0));
    set({ playing: false, selectedIds: [] });
  },
  saveProjectFile: () => {
    const blob = new Blob([JSON.stringify(get().project, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${get().project.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
  loadProject: (project) => set((state) => ({ ...withHistory(state, project), selectedIds: [] })),
  undo: () =>
    set((state) => {
      const previous = state.history[state.history.length - 1];
      if (!previous) return {};
      return {
        project: previous,
        playing: false,
        playhead: previous.shots.slice(0, previous.shots.findIndex(s => s.id === previous.activeShotId)).reduce((sum, s) => sum + s.duration, 0),
        history: state.history.slice(0, -1),
        future: [state.project, ...state.future],
        selectedIds: []
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return {};
      return {
        project: next,
        playing: false,
        playhead: next.shots.slice(0, next.shots.findIndex(s => s.id === next.activeShotId)).reduce((sum, s) => sum + s.duration, 0),
        history: [...state.history, state.project],
        future: state.future.slice(1),
        selectedIds: []
      };
    }),
  autosave: () => { void writeAutosave(get().project).then(() => set({ saveError: undefined })).catch(() => set({ saveError: "Autosave failed. Save Project to keep your changes." })); }
}));

export const loadAutosave = readAutosave;

export { assets };
