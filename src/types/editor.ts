export type AssetCategory =
  | "Characters"
  | "Catmemes"
  | "Backgrounds"
  | "Props"
  | "Shapes"
  | "Effects"
  | "Text"
  | "Sound FX";

export type AssetKind =
  | "character"
  | "background"
  | "prop"
  | "shape"
  | "effect"
  | "text"
  | "audio";

export interface Asset {
  appearance?: CharacterAppearance;
  id: string;
  name: string;
  category: AssetCategory;
  kind: AssetKind;
  tags: string[];
  color?: string;
  accent?: string;
  thumbnail: string;
  imageData?: string;
  imageWidth?: number;
  imageHeight?: number;
  mediaSrc?: string;
  mediaType?: "image" | "video";
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
}

export interface SceneObject {
  keyframes?: ObjectKeyframe[];
  screen?: ScreenContent;
  atmosphere?: "none" | "dust" | "breeze" | "rain" | "clouds" | "traffic" | "lights";
  appearance?: CharacterAppearance;
  timeOfDay?: "day" | "sunrise" | "sunset" | "night";
  id: string;
  assetId: string;
  name: string;
  kind: AssetKind;
  transform: Transform;
  locked: boolean;
  hidden: boolean;
  layer: number;
  expression?: ExpressionId;
  pose?: PoseId;
  mouth?: MouthId;
  action?: ActionId;
  view?: CharacterViewId;
  closet?: ClosetItemId[];
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: "normal" | "bold" | "italic" | "bold italic";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  outlineWidth?: number;
  chromaKeyEnabled?: boolean;
  chromaKeyColor?: string;
  chromaKeyTolerance?: number;
  chromaKeySoftness?: number;
  visibleFrom?: number;
  visibleUntil?: number;
}

export type ScreenMode = "text" | "notification" | "chart" | "map" | "image";
export interface ScreenContent {
  mode: ScreenMode;
  brand: string;
  title: string;
  body: string;
  accent: string;
  graphValues: number[];
  imageData?: string;
}

export type ExpressionId =
  | "neutral"
  | "happy"
  | "sad"
  | "angry"
  | "shocked"
  | "thinking";

export type PoseId =
  | "arms-down"
  | "explaining"
  | "point-left"
  | "point-right"
  | "palms-up"
  | "hands-hips";

export type MouthId =
  | "auto"
  | "flat"
  | "smile"
  | "frown"
  | "open"
  | "wide-open"
  | "talk-small"
  | "talk-wide"
  | "smirk";

export type ActionId =
  | "idle"
  | "talking"
  | "walking"
  | "running"
  | "sitting"
  | "looking-up"
  | "looking-down"
  | "thinking"
  | "waving";

export type CharacterViewId =
  | "front"
  | "three-quarter-left"
  | "three-quarter-right"
  | "side-left"
  | "side-right"
  | "seated-side";

export type ClosetItemId =
  | "hat"
  | "glasses"
  | "mustache"
  | "bowtie"
  | "lab-coat"
  | "jacket"
  | "backpack"
  | "phone-hand"
  | "paper-hand"
  | "coffee-hand";

export interface Camera {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface Shot {
  cameraKeyframes?: CameraKeyframe[];
  animationOffset?: number;
  id: string;
  name: string;
  duration: number;
  transition?: ShotTransitionId;
  transitionDuration?: number;
  objects: SceneObject[];
  camera: Camera;
}

export type ShotTransitionId = "cut" | "crossfade" | "wipe" | "slide" | "zoom" | "dip-black";

export type Easing = "linear" | "smooth" | "hold";
export interface ObjectKeyframe {
  time: number;
  transform: Transform;
  easing: Easing;
  action?: ActionId;
  expression?: ExpressionId;
  pose?: PoseId;
  mouth?: MouthId;
  view?: CharacterViewId;
}
export interface CameraKeyframe { time: number; camera: Camera; easing: Easing }

export interface Project {
  audioClips?: AudioClip[];
  customAssets?: Asset[];
  soundAssets?: SoundAsset[];
  id: string;
  name: string;
  canvas: {
    width: number;
    height: number;
    fps: number;
  };
  shots: Shot[];
  activeShotId: string;
}

export type OutfitId = "casual" | "business" | "luxury" | "worn" | "dress" | "lab" | "overalls";
export type HairId = "short" | "bob" | "long" | "ponytail" | "curly" | "bun" | "bald";
export interface CharacterAppearance {
  outfit?: OutfitId;
  hair?: HairId;
  hairColor?: string;
  clothingColor?: string;
  skinColor?: string;
}
export interface AudioClip {
  id: string;
  name: string;
  source: string;
  sourceDuration: number;
  start: number;
  trimStart: number;
  duration: number;
  volume: number;
  muted: boolean;
}

export interface SoundAsset {
  id: string;
  name: string;
  source: string;
  sourceDuration: number;
}

export interface CaptionCue {
  start: number;
  end: number;
  text: string;
}
