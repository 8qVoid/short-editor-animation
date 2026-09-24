import { Circle, Ellipse, Group, Line, Path, Rect } from "react-konva";
import type { Asset, CharacterAppearance, SceneObject } from "../types/editor";
import { appearanceFor, Hair, Outfit } from "./CharacterWardrobe";
import { MouthShape } from "./CharacterMouth";

const ink = "#1f2328";
const edge = { stroke: ink, strokeWidth: 8, lineJoin: "round" as const };

// All geometry faces right in the same 420 x 760 space as the front view.
// Mirror only the outer group; the head and its features share one origin.
const profileHead = "M -112 144 C -112 67 -70 18 -9 18 C 53 18 97 67 99 130 Q 99 143 112 151 Q 119 160 102 165 C 101 226 70 270 17 272 C -58 274 -112 224 -112 144 Z";
const quarterHead = "M -114 143 C -114 63 -66 18 -7 18 C 59 18 108 60 110 126 Q 112 169 97 206 C 81 251 40 275 -7 272 C -68 269 -114 223 -114 143 Z";

function AngleHair({ appearance: a, profile, back = false }: { appearance: Required<CharacterAppearance>; profile: boolean; back?: boolean }) {
  return <Group name={back ? "hair-back" : "hair-front"} x={profile ? -9 : -4} scaleX={profile ? .92 : .97}>
    <Hair style={a.hair} color={a.hairColor} back={back} />
  </Group>;
}

function AngleOutfit({ appearance: a, profile, seated }: { appearance: Required<CharacterAppearance>; profile: boolean; seated: boolean }) {
  if (!profile) return <Group x={15} scaleX={.82}><Outfit outfit={a.outfit} color={a.clothingColor} seated={seated} /></Group>;
  const formal = a.outfit === "business" || a.outfit === "luxury" || a.outfit === "lab";
  return <Group name="profile-outfit">
    {a.outfit === "dress" && <>
      <Path data={seated
        ? "M -57 275 L 51 277 L 61 399 Q 92 459 159 516 L 145 553 L -67 550 Q -99 490 -68 389 Z"
        : "M -57 275 L 51 277 L 61 399 L 105 581 Q 11 606 -105 579 L -68 389 Z"} fill={a.clothingColor} {...edge} />
      <Line points={[-67, 387, 60, 387]} stroke="#eee0c2" strokeWidth={10} /><Circle x={53} y={387} radius={8} fill="#d8b65e" />
    </>}
    {formal && <>
      <Path data="M 15 267 L 59 277 L 80 380 L 38 349 Z" fill="#f8f6eb" {...edge} />
      <Line points={[3, 272, -12, 326, 26, 356, 8, 385, 74, 454]} stroke={a.outfit === "luxury" ? "#d0ae5c" : ink} strokeWidth={6} lineJoin="round" />
      {a.outfit !== "lab" && <Path data="M 48 286 L 62 289 L 59 308 L 76 363 L 63 377 L 48 359 L 50 308 Z" fill={a.outfit === "luxury" ? "#d6b65d" : "#ad5364"} stroke={ink} strokeWidth={4} />}
      {[440, 480, 520].map(y => <Circle key={y} x={67} y={y} radius={4} fill={ink} />)}
      <Rect x={-18} y={414} width={40} height={35} stroke={ink} strokeWidth={4} />
    </>}
    {a.outfit === "worn" && <><Rect x={-48} y={424} width={43} height={54} fill="#b29a7c" stroke={ink} strokeWidth={4} /><Line points={[-40, 434, -15, 434, -15, 466]} stroke="#eee0c2" strokeWidth={4} dash={[5, 5]} /><Line points={[34, 349, 58, 361, 37, 373]} stroke={ink} strokeWidth={4} /></>}
    {a.outfit === "overalls" && <><Line points={[-20, 270, 0, 387, 67, 383, 49, 277]} stroke="#2c5065" strokeWidth={17} /><Path data="M -7 358 L 64 363 L 78 529 L -51 530 L -32 426 Z" fill="#38718a" {...edge} /><Rect x={4} y={391} width={40} height={42} stroke="#b4ccd1" strokeWidth={4} /><Circle x={0} y={373} radius={6} fill="#e3be5f" /></>}
    {a.outfit === "casual" && <Line points={[-24, 264, 16, 282, 50, 270]} stroke="#fff" strokeWidth={8} opacity={.6} tension={.5} />}
  </Group>;
}

function Limb({ points, color, far = false, hand = false }: { points: number[]; color: string; far?: boolean; hand?: boolean }) {
  return <Group>
    <Line points={points} stroke={ink} strokeWidth={hand ? 22 : 24} lineCap="round" lineJoin="round" />
    <Line points={points} stroke={color} strokeWidth={13} lineCap="round" lineJoin="round" />
    {hand && <Circle x={points[points.length - 2]} y={points[points.length - 1]} radius={21} fill={color} stroke={ink} strokeWidth={7} />}
    {far && <Line points={points} stroke={ink} strokeWidth={13} opacity={.12} lineCap="round" lineJoin="round" />}
  </Group>;
}

export function AngledCharacterArt({ asset, object, tick = 0 }: { asset: Asset; object: SceneObject; tick?: number }) {
  const a = appearanceFor(asset, object);
  const left = object.view === "side-left" || object.view === "three-quarter-left";
  const profile = object.view === "side-left" || object.view === "side-right" || object.view === "seated-side";
  const action = object.action ?? "idle";
  const expression = object.expression ?? "neutral";
  const pose = object.pose ?? "arms-down";
  const seated = object.view === "seated-side" || action === "sitting";
  const running = action === "running";
  const moving = !seated && (running || action === "walking");
  const phase = tick * (running ? .018 : .009);
  const stride = moving ? Math.sin(phase) * (running ? 87 : 55) : 0;
  const lift = moving ? (running ? 57 : 30) : 0;
  const has = (id: string) => object.closet?.some(item => item === id);
  const farHip = profile ? 12 : 34;
  const nearHip = profile ? -18 : -39;
  const leg = (hip: number, swing: number, far: boolean) => seated
    ? [hip, 540, far ? 116 : 145, 547, far ? 120 : 149, far ? 677 : 701, far ? 148 : 180, far ? 677 : 701]
    : [hip, 557, hip + swing * .5, 627 - Math.max(0, swing / (running ? 87 : 55)) * lift * .35, hip + swing, 704 - Math.max(0, swing / (running ? 87 : 55)) * lift, hip + swing + 21, 704 - Math.max(0, swing / (running ? 87 : 55)) * lift];
  const nearShoulder = profile ? -37 : -62;
  let nearArm = [nearShoulder, 289, nearShoulder - 13 - stride * .6, 391, nearShoulder - stride, 493];
  let farArm = [57, 284, 72 + stride * .6, 387, 64 + stride, 481];
  if (seated) { nearArm = [nearShoulder, 289, -40, 430, 97, 508]; farArm = [57, 284, 76, 409, 122, 498]; }
  if (!moving) {
    if (pose === "explaining") nearArm = [nearShoulder, 289, -69, 381, 100, 306];
    if (pose === "palms-up") { nearArm = [nearShoulder, 289, -105, 357, -156, 318]; farArm = [57, 284, 113, 338, 169, 300]; }
    if (pose === "hands-hips") { nearArm = [nearShoulder, 289, -122, 392, -69, 436]; farArm = [57, 284, 116, 387, 73, 426]; }
    if (pose === "point-left" || pose === "point-right") {
      const pointing = (pose === "point-right" ? 1 : -1) * (left ? -1 : 1);
      nearArm = [nearShoulder, 289, pointing * 114, 290, pointing * 189, 285];
    }
  }
  if (action === "thinking") nearArm = [nearShoulder, 289, -49, 374, profile ? 65 : 32, 230];
  if (action === "waving") nearArm = [nearShoulder, 289, -127, 219, -140 + Math.sin(tick * .016) * 29, 117];
  const mouth = action === "talking" && (!object.mouth || object.mouth === "auto")
    ? (Math.sin(tick * .018) > 0 ? "talk-wide" : "talk-small") : object.mouth;
  const blink = tick % 4100 > 3910;
  const eyeH = blink ? 2 : expression === "happy" ? 5 : expression === "shocked" ? 20 : 12;
  const pitch = action === "looking-up" ? -12 : action === "looking-down" ? 12 : 0;
  const brow = expression === "angry" ? 12 : expression === "sad" || expression === "thinking" ? -10 : -4;
  const nearEye = profile ? 58 : 1;
  const mouthX = profile ? 67 : 44;
  const coat = has("lab-coat") ? "#f6f2df" : has("jacket") ? "#35434d" : a.clothingColor;
  const headTransform = { x: 0, y: 255, offsetY: 255, rotation: pitch };

  return <Group name="angled-character" x={object.transform.width / 2} y={8} scaleX={object.transform.width / 420 * (left ? -1 : 1)} scaleY={object.transform.height / 760}>
    <Limb points={leg(farHip, -stride, true)} color={a.hairColor} far />
    <Limb points={farArm} color={a.skinColor} hand far />
    <Group {...headTransform}><AngleHair appearance={a} profile={profile} back /></Group>
    {has("backpack") && <Rect x={-130} y={310} width={70} height={183} cornerRadius={22} fill="#8c5d43" {...edge} />}
    <Limb points={leg(nearHip, stride, false)} color={a.hairColor} />
    <Ellipse name="torso" y={397} radiusX={profile ? 88 : 104} radiusY={seated ? 158 : 188} fill={coat} {...edge} />
    <AngleOutfit appearance={{ ...a, clothingColor: coat }} profile={profile} seated={seated} />
    {has("bowtie") && <Group x={profile ? 47 : 20} y={276}><Path data="M 0 0 L -25 -15 L -25 15 Z M 0 0 L 25 -15 L 25 15 Z" fill="#c94e4e" stroke={ink} strokeWidth={4} /><Circle radius={7} fill="#c94e4e" /></Group>}
    <Group name="head" {...headTransform}>
      <Path name="head-skin" data={profile ? profileHead : quarterHead} fill={a.skinColor} {...edge} />
      <AngleHair appearance={a} profile={profile} />
      <Ellipse name="near-eye" x={nearEye} y={150} radiusX={profile ? 12 : 13} radiusY={eyeH} fill={ink} />
      {!profile && <Ellipse name="far-eye" x={73} y={149} radiusX={8} radiusY={eyeH * .86} fill={ink} />}
      <Line points={[nearEye - 18, 123 - brow / 2, nearEye + 17, 122 + brow / 2]} stroke={ink} strokeWidth={7} lineCap="round" />
      {!profile && <><Line points={[62, 122 + brow / 2, 84, 125 - brow / 2]} stroke={ink} strokeWidth={6} lineCap="round" /><Line points={[48, 150, 57, 177, 43, 179]} stroke={ink} strokeWidth={5} lineCap="round" lineJoin="round" /></>}
      <Group name="mouth" x={mouthX} y={profile ? 184 : 193} offsetY={180} scaleX={profile ? .65 : .76} scaleY={.9}><MouthShape mouth={mouth} expression={expression} /></Group>
      {has("glasses") && <Group name="glasses">
        <Ellipse x={nearEye} y={150} radiusX={profile ? 20 : 25} radiusY={23} stroke={ink} strokeWidth={5} />
        <Line points={[nearEye - (profile ? 20 : 25), 145, profile ? -46 : -75, 151]} stroke={ink} strokeWidth={5} />
        {profile ? <Line points={[78, 147, 99, 153]} stroke={ink} strokeWidth={5} /> : <><Ellipse x={73} y={149} radiusX={15} radiusY={21} stroke={ink} strokeWidth={5} /><Line points={[26, 149, 57, 148]} stroke={ink} strokeWidth={5} /></>}
      </Group>}
      {has("mustache") && <Group x={mouthX} y={profile ? 176 : 185} scaleX={profile ? .5 : .7}><Line points={[-38, 0, -15, -7, 0, 0, 15, -7, 38, 0]} stroke={a.hairColor} strokeWidth={10} tension={.4} lineCap="round" /></Group>}
      {has("hat") && <Group x={-10} y={22}><Rect x={-70} width={158} height={23} fill={a.hairColor} {...edge} cornerRadius={8} /><Rect x={-47} y={-38} width={100} height={47} fill={a.hairColor} {...edge} cornerRadius={8} /></Group>}
    </Group>
    <Limb points={nearArm} color={a.skinColor} hand />
    <Group name="held-props" x={nearArm[4]} y={nearArm[5]}>
      {has("phone-hand") && <Rect x={-15} y={-44} width={32} height={59} fill="#2d3440" {...edge} cornerRadius={6} />}
      {has("paper-hand") && <Rect x={-20} y={-50} width={52} height={72} fill="#f4f0dc" stroke={ink} strokeWidth={5} />}
      {has("coffee-hand") && <><Ellipse x={25} y={-7} radiusX={14} radiusY={18} stroke={ink} strokeWidth={5} /><Rect x={-21} y={-34} width={46} height={51} fill="#d7e0df" stroke={ink} strokeWidth={5} cornerRadius={7} /></>}
    </Group>
  </Group>;
}
