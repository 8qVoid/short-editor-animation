import type { Camera, CameraKeyframe, Easing, ObjectKeyframe, SceneObject, Shot, Transform } from "./types/editor";

export function eased(value: number, easing: Easing) {
  const t = Math.max(0, Math.min(1, value));
  return easing === "hold" ? 0 : easing === "smooth" ? t * t * (3 - 2 * t) : t;
}

function interval<T extends { time: number; easing: Easing }>(keys: T[], time: number) {
  const ordered = [...keys].sort((a, b) => a.time - b.time);
  const right = ordered.findIndex(k => k.time > time);
  if (right === 0) return { a: ordered[0], b: ordered[0], amount: 0 };
  if (right === -1) return { a: ordered[ordered.length - 1], b: ordered[ordered.length - 1], amount: 0 };
  const a = ordered[right - 1], b = ordered[right];
  return { a, b, amount: eased((time - a.time) / (b.time - a.time), a.easing) };
}

export function objectAt(object: SceneObject, time: number): SceneObject {
  if (!object.keyframes?.length) return object;
  const { a, b, amount } = interval(object.keyframes, time);
  const transform = { ...a.transform };
  for (const key of ["x", "y", "width", "height", "scaleX", "scaleY", "rotation", "opacity"] as const) {
    transform[key] = a.transform[key] + (b.transform[key] - a.transform[key]) * amount;
  }
  return { ...object, transform, action: a.action ?? object.action, expression: a.expression ?? object.expression,
    pose: a.pose ?? object.pose, mouth: a.mouth ?? object.mouth, view: a.view ?? object.view };
}

export function cameraAt(shot: Shot, time: number): Camera {
  if (!shot.cameraKeyframes?.length) return shot.camera;
  const { a, b, amount } = interval(shot.cameraKeyframes, time);
  return Object.fromEntries((["x", "y", "zoom", "rotation"] as const).map(key => [key, a.camera[key] + (b.camera[key] - a.camera[key]) * amount])) as unknown as Camera;
}

export function snapshot(object: SceneObject, time: number, easing: Easing = "smooth"): ObjectKeyframe {
  return { time, easing, transform: { ...object.transform }, action: object.action, expression: object.expression, pose: object.pose, mouth: object.mouth, view: object.view };
}

export function insertKey<T extends { time: number }>(keys: T[], key: T): T[] {
  return [...keys.filter(k => Math.abs(k.time - key.time) > .0001), key].sort((a, b) => a.time - b.time);
}

export type MotionPreset = "enter-left" | "enter-right" | "exit-right" | "approach" | "recede" | "hop" | "bounce" | "shake" | "fall" | "slide-left" | "slide-right" | "clear";
export function motionKeys(object: SceneObject, preset: MotionPreset, start: number, end: number, width: number): ObjectKeyframe[] {
  const t = objectAt(object, start).transform;
  const key = (time: number, patch: Partial<Transform>) => snapshot({ ...object, transform: { ...t, ...patch } }, time);
  const approach = (scale: number) => ({ scaleX: t.scaleX * scale, scaleY: t.scaleY * scale,
    x: t.x + t.width * t.scaleX * (1 - scale) / 2, y: t.y + t.height * t.scaleY * (1 - scale) });
  if (preset === "clear") return [];
  if (preset === "hop") return [key(start, {}), key((start + end) / 2, { y: t.y - t.height * .18, rotation: t.rotation - 5 }), key(end, {})];
  if (preset === "bounce") return [key(start, {}), key(start + (end - start) * .28, { y: t.y - t.height * .13, scaleX: t.scaleX * 1.04, scaleY: t.scaleY * .96 }), key(start + (end - start) * .55, { y: t.y + t.height * .05, scaleX: t.scaleX * .97, scaleY: t.scaleY * 1.05 }), key(end, {})];
  if (preset === "shake") return [key(start, {}), key(start + (end - start) * .18, { x: t.x - t.width * .035, rotation: t.rotation - 3 }), key(start + (end - start) * .36, { x: t.x + t.width * .035, rotation: t.rotation + 3 }), key(start + (end - start) * .54, { x: t.x - t.width * .025, rotation: t.rotation - 2 }), key(start + (end - start) * .72, { x: t.x + t.width * .02, rotation: t.rotation + 1.5 }), key(end, {})];
  if (preset === "fall") return [key(start, {}), key(start + (end - start) * .42, { rotation: t.rotation + 18, y: t.y + t.height * .05 }), key(end, { rotation: t.rotation + 88, y: t.y + t.height * .34, scaleY: t.scaleY * .72 })];
  if (preset === "slide-left") return [key(start, {}), key(end, { x: t.x - width * .22 })];
  if (preset === "slide-right") return [key(start, {}), key(end, { x: t.x + width * .22 })];
  if (preset === "approach") return [key(start, approach(.65)), key(end, {})];
  if (preset === "recede") return [key(start, {}), key(end, approach(.65))];
  const from = preset === "enter-left" ? -t.width * t.scaleX : width;
  const keys = preset === "exit-right" ? [key(start, {}), key(end, { x: width })] : [key(start, { x: from }), key(end, {})];
  return keys.map((k, i) => ({ ...k, easing: "linear", ...(object.kind === "character" ? { action: i === 0 ? "walking" : "idle", view: preset === "enter-right" ? "side-left" : "side-right" } : {}) }));
}

export function cameraKeys(camera: Camera, preset: string, start: number, end: number, width: number): CameraKeyframe[] {
  const initial = { ...camera, zoom: preset.startsWith("pan-") ? Math.max(1.25, camera.zoom) : camera.zoom };
  const finish = { ...initial };
  if (preset === "push-in") finish.zoom *= 1.22;
  if (preset === "snap-zoom") finish.zoom *= 1.55;
  if (preset === "pull-out") return [{time:start,camera:{...camera,zoom:camera.zoom*1.22},easing:"smooth"},{time:end,camera,easing:"smooth"}];
  if (preset === "shake") return [
    {time:start,camera,easing:"linear"},
    {time:start+(end-start)*.2,camera:{...camera,x:camera.x-width*.018,rotation:camera.rotation-1.2},easing:"linear"},
    {time:start+(end-start)*.4,camera:{...camera,x:camera.x+width*.018,rotation:camera.rotation+1.2},easing:"linear"},
    {time:start+(end-start)*.65,camera:{...camera,y:camera.y-width*.012,rotation:camera.rotation-.8},easing:"linear"},
    {time:end,camera,easing:"smooth"}
  ];
  if (preset === "pan-left") finish.x -= width * .1;
  if (preset === "pan-right") finish.x += width * .1;
  if (preset === "follow-left") { finish.x -= width * .18; finish.zoom = Math.max(1.15, finish.zoom); }
  if (preset === "follow-right") { finish.x += width * .18; finish.zoom = Math.max(1.15, finish.zoom); }
  if (preset === "static") return [];
  return [{time:start,camera:initial,easing:"smooth"},{time:end,camera:finish,easing:"smooth"}];
}
