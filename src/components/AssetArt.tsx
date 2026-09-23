import { Arrow, Circle, Ellipse, Group, Label, Line, Rect, RegularPolygon, Star, Tag, Text } from "react-konva";
import type { Asset, SceneObject } from "../types/editor";
import { BackgroundArt } from "./BackgroundArt";
import { appearanceFor, Hair, Outfit } from "./CharacterWardrobe";

interface ArtProps {
  asset: Asset;
  object: SceneObject;
  tick?: number;
}

const stroke = "#1f2328";

function mouthFromExpression(expression = "neutral") {
  if (expression === "happy") return "smile";
  if (expression === "sad") return "frown";
  if (expression === "angry") return "flat";
  if (expression === "shocked") return "wide-open";
  if (expression === "thinking") return "smirk";
  return "talk-small";
}

function MouthShape({ mouth, expression }: { mouth?: string; expression?: string }) {
  const resolved = !mouth || mouth === "auto" ? mouthFromExpression(expression) : mouth;
  if (resolved === "open") return <Ellipse x={1} y={178} radiusX={18} radiusY={20} fill="#382326" stroke={stroke} strokeWidth={6} />;
  if (resolved === "wide-open") return <Ellipse x={1} y={178} radiusX={25} radiusY={32} fill="#382326" stroke={stroke} strokeWidth={7} />;
  if (resolved === "talk-wide") return <Ellipse x={1} y={179} radiusX={30} radiusY={17} fill="#382326" stroke={stroke} strokeWidth={6} />;
  if (resolved === "talk-small") return <Ellipse x={1} y={180} radiusX={22} radiusY={10} fill="#382326" stroke={stroke} strokeWidth={5} />;
  if (resolved === "smile") return <Line points={[-40, 172, -18, 194, 8, 200, 42, 174]} stroke={stroke} strokeWidth={8} lineCap="round" lineJoin="round" tension={0.45} />;
  if (resolved === "frown") return <Line points={[-38, 192, -16, 171, 10, 166, 40, 192]} stroke={stroke} strokeWidth={8} lineCap="round" lineJoin="round" tension={0.45} />;
  if (resolved === "smirk") return <Line points={[-32, 182, -5, 178, 34, 166]} stroke={stroke} strokeWidth={8} lineCap="round" lineJoin="round" tension={0.3} />;
  return <Line points={[-35, 181, 36, 181]} stroke={stroke} strokeWidth={8} lineCap="round" />;
}

function Closet({ items = [], accent }: { items?: string[]; accent: string }) {
  const has = (id: string) => items.includes(id);
  return (
    <Group>
      {has("hat") && <Rect x={-72} y={28} width={144} height={28} fill={accent} stroke={stroke} strokeWidth={7} cornerRadius={10} />}
      {has("hat") && <Rect x={-48} y={-7} width={96} height={44} fill={accent} stroke={stroke} strokeWidth={7} cornerRadius={12} />}
      {has("glasses") && <Group><Circle x={-38} y={154} radius={22} stroke={stroke} strokeWidth={6} /><Circle x={42} y={154} radius={22} stroke={stroke} strokeWidth={6} /><Line points={[-16, 154, 20, 154]} stroke={stroke} strokeWidth={5} /></Group>}
      {has("mustache") && <Line points={[-38, 181, -12, 171, 0, 181, 14, 171, 40, 181]} stroke={stroke} strokeWidth={8} lineCap="round" lineJoin="round" tension={0.45} />}
      {has("bowtie") && <Group><RegularPolygon x={-22} y={265} sides={3} radius={24} fill="#c94e4e" stroke={stroke} strokeWidth={5} rotation={30} /><RegularPolygon x={22} y={265} sides={3} radius={24} fill="#c94e4e" stroke={stroke} strokeWidth={5} rotation={-30} /></Group>}
      {has("lab-coat") && <Group><Line points={[-72, 290, -95, 520]} stroke="#f6f2df" strokeWidth={28} lineCap="round" /><Line points={[72, 290, 95, 520]} stroke="#f6f2df" strokeWidth={28} lineCap="round" /></Group>}
      {has("jacket") && <Rect x={-95} y={292} width={190} height={185} fill="#35434d" opacity={0.5} cornerRadius={40} />}
      {has("backpack") && <Rect x={82} y={330} width={54} height={150} fill="#8c5d43" stroke={stroke} strokeWidth={6} cornerRadius={20} />}
      {has("phone-hand") && <Rect x={170} y={138} width={32} height={58} fill="#2d3440" stroke={stroke} strokeWidth={5} cornerRadius={8} />}
      {has("paper-hand") && <Rect x={155} y={150} width={58} height={72} fill="#f4f0dc" stroke={stroke} strokeWidth={5} />}
      {has("coffee-hand") && <Rect x={160} y={150} width={52} height={58} fill="#d7e0df" stroke={stroke} strokeWidth={5} cornerRadius={8} />}
    </Group>
  );
}

function SideCharacterArt({ asset, object, tick = 0 }: ArtProps) {
  const appearance = appearanceFor(asset, object);
  const color = appearance.clothingColor;
  const accent = appearance.hairColor;
  const expression = object.expression ?? "neutral";
  const action = object.action ?? "idle";
  const isLeft = object.view === "side-left";
  const direction = isLeft ? -1 : 1;
  const cycle = action === "running" ? Math.sin(tick * 0.024) : action === "walking" ? Math.sin(tick * 0.012) : 0;
  const seated = action === "sitting" || object.view === "seated-side";
  const running = action === "running";
  const lean = running ? direction * 10 : 0;
  const bodyX = direction * 12 + lean;
  const headX = direction * 30 + lean;
  const mouth = action === "talking" && (!object.mouth || object.mouth === "auto") ? (Math.sin(tick * 0.018) > 0 ? "talk-wide" : "talk-small") : object.mouth;
  const stride = running ? 32 : 20;
  const lift = running ? 38 : 18;
  const blink = tick % 4100 > 3910;
  const frontLeg = seated
    ? [15 * direction, 505, 82 * direction, 558, 132 * direction, 640]
    : [18 * direction, 535, (32 + cycle * stride) * direction, 630 - Math.max(cycle, 0) * lift, (46 + cycle * stride) * direction, 710 - Math.max(cycle, 0) * lift];
  const backLeg = seated
    ? [-28 * direction, 510, 44 * direction, 570, 78 * direction, 646]
    : [-20 * direction, 535, (-24 - cycle * stride) * direction, 635 - Math.max(-cycle, 0) * lift, (-38 - cycle * stride) * direction, 712 - Math.max(-cycle, 0) * lift];
  const arm = action === "thinking"
    ? [58 * direction, 290, 96 * direction, 230, 75 * direction, 185]
    : [65 * direction, 292, (92 + cycle * 10) * direction, 395, 78 * direction, 500];
  const trailingArm = running || action === "walking"
    ? [-56 * direction, 305, (-86 - cycle * 12) * direction, 410, -58 * direction, 500]
    : undefined;

  const sideScaleX = object.transform.width / 420;
  const sideScaleY = object.transform.height / 760;
  const sideEyeX = headX + 39 * direction;
  const faceX = headX + 45 * direction;

  return (
    <Group x={object.transform.width / 2} y={8} scaleX={sideScaleX} scaleY={sideScaleY}>
      {/* Far limbs sit behind the torso; near limbs are drawn over it. */}
      <Line points={backLeg} stroke={stroke} strokeWidth={24} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={backLeg} stroke={accent} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.25} />
      <Group x={headX} scaleX={direction * .86}><Hair style={appearance.hair} color={accent} back /></Group>
      <Ellipse x={bodyX} y={seated ? 410 : 392 + Math.abs(cycle) * 6} radiusX={92} radiusY={seated ? 150 : 185} fill={color} stroke={stroke} strokeWidth={10} />
      <Group x={bodyX} scaleX={direction * .78}><Outfit outfit={appearance.outfit} color={color} seated={seated} /></Group>
      {trailingArm && <Line points={trailingArm} stroke={stroke} strokeWidth={18} lineCap="round" lineJoin="round" tension={0.35} />}
      {trailingArm && <Line points={trailingArm} stroke={appearance.skinColor} strokeWidth={10} lineCap="round" lineJoin="round" tension={0.35} />}
      <Line points={frontLeg} stroke={stroke} strokeWidth={24} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={frontLeg} stroke={accent} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={arm} stroke={stroke} strokeWidth={22} lineCap="round" lineJoin="round" tension={0.35} />
      <Line points={arm} stroke={appearance.skinColor} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.35} />
      <Ellipse x={headX} y={145} radiusX={102} radiusY={124} fill={appearance.skinColor} stroke={stroke} strokeWidth={10} />
      <Group x={headX} scaleX={direction * .86}><Hair style={appearance.hair} color={accent} /></Group>
      <Ellipse x={sideEyeX} y={154} radiusX={13} radiusY={blink ? 2 : expression === "happy" ? 5 : 12} fill={stroke} />
      <Line points={[headX + 10 * direction, 126, headX + 58 * direction, 120]} stroke={stroke} strokeWidth={8} rotation={expression === "angry" ? 12 : -4} lineCap="round" />
      <Line points={[headX + 81 * direction, 166, headX + 94 * direction, 174, headX + 81 * direction, 182]} stroke={stroke} strokeWidth={5} lineCap="round" lineJoin="round" />
      <Group x={faceX} y={50} scaleX={0.72} scaleY={0.72}>
        <MouthShape mouth={mouth} expression={expression} />
      </Group>
      <Circle x={arm[arm.length - 2]} y={arm[arm.length - 1]} radius={24} fill={appearance.skinColor} stroke={stroke} strokeWidth={8} />
      <Group scaleX={direction}><Closet items={object.closet} accent={accent} /></Group>
    </Group>
  );
}

function CharacterArt({ asset, object, tick = 0 }: ArtProps) {
  const appearance = appearanceFor(asset, object);
  const color = appearance.clothingColor;
  const accent = appearance.hairColor;
  const expression = object.expression ?? "neutral";
  const pose = object.pose ?? "arms-down";
  const action = object.action ?? "idle";
  const view = object.view ?? "front";
  if (view === "side-left" || view === "side-right" || view === "seated-side" || action === "walking" || action === "running" || action === "sitting") {
    const sideObject = { ...object, view: view === "front" ? "side-right" : view };
    return <SideCharacterArt asset={asset} object={sideObject} tick={tick} />;
  }
  const activePose = action === "waving" ? "explaining" : pose;
  const leftArm = action === "thinking"
    ? [-72, 250, -118, 210, -70, 180]
    : activePose === "point-left" ? [-85, 250, -170, 190, -230, 185] : activePose === "palms-up" ? [-70, 255, -140, 250, -180, 210] : [-70, 245, -115, 370, -96, 480];
  const rightArm = activePose === "point-right" ? [85, 250, 170, 190, 230, 185] : activePose === "explaining" || action === "waving" ? [75, 255, 150, 220, 190, action === "waving" ? 105 : 170] : activePose === "hands-hips" ? [78, 255, 130, 335, 88, 405] : [70, 245, 115, 370, 96, 480];
  const eyebrowTilt = expression === "angry" ? 14 : expression === "sad" ? -10 : expression === "shocked" ? 0 : -4;
  const eyeHeight = tick % 4100 > 3910 ? 2 : expression === "happy" ? 5 : expression === "shocked" ? 20 : 12;
  const breathing = Math.sin(tick * .002) * .005;
  const talkOpen = action === "talking" && Math.sin(tick * 0.018) > 0;
  const wave = action === "waving" ? Math.sin(tick * 0.016) * 35 : 0;
  const bodyY = 395;
  const bodyH = 190;
  const headY = 145;
  const eyeY = action === "looking-up" ? 143 : action === "looking-down" ? 166 : 154;
  const mouthY = action === "looking-up" ? -8 : action === "looking-down" ? 9 : 0;
  const leftLeg = [-42, 565, -58, 705];
  const rightLeg = [42, 565, 58, 705];
  const animatedRightArm = action === "waving" ? [75, 255, 150 + wave, 190, 190 + wave, 105] : rightArm;
  const mouth = action === "talking" && (!object.mouth || object.mouth === "auto") ? (talkOpen ? "talk-wide" : "talk-small") : object.mouth;
  const threeQuarter = view === "three-quarter-left" || view === "three-quarter-right";
  const lookDirection = view === "three-quarter-left" ? -1 : 1;
  const nearEyeX = threeQuarter ? lookDirection * 47 : -38;
  const farEyeX = threeQuarter ? -lookDirection * 42 : 42;

  return (
    <Group x={object.transform.width / 2} y={8 - 705 * breathing * object.transform.height / 760} scaleX={object.transform.width / 420} scaleY={object.transform.height / 760 * (1 + breathing)}>
      <Line points={leftArm} stroke={stroke} strokeWidth={22} lineCap="round" lineJoin="round" tension={0.35} />
      <Line points={animatedRightArm} stroke={stroke} strokeWidth={22} lineCap="round" lineJoin="round" tension={0.35} />
      <Line points={leftArm} stroke={appearance.skinColor} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.35} />
      <Line points={animatedRightArm} stroke={appearance.skinColor} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.35} />
      <Hair style={appearance.hair} color={accent} back />
      <Ellipse x={0} y={bodyY} radiusX={118} radiusY={bodyH} fill={color} stroke={stroke} strokeWidth={10} />
      <Line points={leftLeg} stroke={stroke} strokeWidth={24} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={rightLeg} stroke={stroke} strokeWidth={24} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={leftLeg} stroke={accent} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.25} />
      <Line points={rightLeg} stroke={accent} strokeWidth={13} lineCap="round" lineJoin="round" tension={0.25} />
      <Outfit outfit={appearance.outfit} color={color} />
      <Ellipse x={0} y={headY} radiusX={118} radiusY={128} fill={appearance.skinColor} stroke={stroke} strokeWidth={10} />
      <Hair style={appearance.hair} color={accent} />
      <Line points={[-58, 128, -20, 118]} stroke={stroke} strokeWidth={8} rotation={eyebrowTilt} lineCap="round" />
      <Line points={[28, 118, 66, 128]} stroke={stroke} strokeWidth={8} rotation={-eyebrowTilt} lineCap="round" />
      <Ellipse x={nearEyeX} y={eyeY} radiusX={threeQuarter ? 14 : 13} radiusY={eyeHeight} fill={stroke} />
      <Ellipse x={farEyeX} y={eyeY + (threeQuarter ? 2 : 0)} radiusX={threeQuarter ? 8 : 13} radiusY={threeQuarter ? eyeHeight * 0.82 : eyeHeight} fill={stroke} opacity={threeQuarter ? 0.78 : 1} />
      {threeQuarter && <Line points={[lookDirection * 18, 160, lookDirection * 29, 178, lookDirection * 13, 184]} stroke={stroke} strokeWidth={5} lineCap="round" lineJoin="round" />}
      <Group x={threeQuarter ? lookDirection * 12 : 0} y={mouthY}><MouthShape mouth={mouth} expression={expression} /></Group>
      <Circle x={leftArm[leftArm.length - 2]} y={leftArm[leftArm.length - 1]} radius={24} fill={appearance.skinColor} stroke={stroke} strokeWidth={8} />
      <Circle x={animatedRightArm[animatedRightArm.length - 2]} y={animatedRightArm[animatedRightArm.length - 1]} radius={24} fill={appearance.skinColor} stroke={stroke} strokeWidth={8} />
      <Closet items={object.closet} accent={accent} />
    </Group>
  );
}


function PropArt({ asset, object, tick = 0 }: ArtProps) {
  const color = asset.color ?? "#ddd";
  const accent = asset.accent ?? "#777";
  const w = object.transform.width;
  const h = object.transform.height;
  const pulse = 1 + Math.sin(tick * 0.004) * 0.08;
  if (asset.thumbnail === "dumbbell") return <Group>
    <Line points={[w * .18, h * .5, w * .82, h * .5]} stroke={stroke} strokeWidth={Math.max(9, h * .08)} lineCap="round" />
    {[.18, .3, .7, .82].map((x, i) => <Rect key={x} x={w * x - w * (i % 2 ? .035 : .05)} y={h * (i % 2 ? .31 : .23)} width={w * (i % 2 ? .07 : .1)} height={h * (i % 2 ? .38 : .54)} cornerRadius={8} fill={i % 2 ? color : accent} stroke={stroke} strokeWidth={5} />)}
  </Group>;
  if (asset.thumbnail === "shopping-bag") return <Group>
    <Line points={[w * .28, h * .36, w * .34, h * .12, w * .66, h * .12, w * .72, h * .36]} stroke={accent} strokeWidth={9} lineCap="round" lineJoin="round" />
    <Line points={[w * .18, h * .32, w * .82, h * .32, w * .76, h * .9, w * .24, h * .9]} closed fill={color} stroke={stroke} strokeWidth={7} lineJoin="round" />
    <Line points={[w * .42, h * .48, w * .58, h * .48]} stroke="#f7edda" strokeWidth={6} lineCap="round" />
  </Group>;
  if (asset.thumbnail === "plate") return <Group>
    <Ellipse x={w * .5} y={h * .52} radiusX={w * .42} radiusY={h * .34} fill={accent} stroke={stroke} strokeWidth={7} />
    <Ellipse x={w * .5} y={h * .49} radiusX={w * .34} radiusY={h * .24} fill={color} stroke="#d5d1c5" strokeWidth={5} />
    <Ellipse x={w * .5} y={h * .49} radiusX={w * .2} radiusY={h * .13} fill="#dca46a" stroke="#a95c3c" strokeWidth={4} />
  </Group>;
  if (asset.thumbnail === "bed") return <Group>
    <Rect x={w * .1} y={h * .2} width={w * .8} height={h * .65} fill={accent} stroke={stroke} strokeWidth={7} cornerRadius={9} />
    <Rect x={w * .17} y={h * .36} width={w * .76} height={h * .39} fill={color} stroke={stroke} strokeWidth={6} cornerRadius={9} />
    <Rect x={w * .2} y={h * .26} width={w * .27} height={h * .18} fill="#f4eee0" stroke={stroke} strokeWidth={4} cornerRadius={7} />
    <Line points={[w * .12, h * .84, w * .12, h * .96, w * .88, h * .96, w * .88, h * .84]} stroke={stroke} strokeWidth={8} lineCap="round" />
  </Group>;
  if (asset.thumbnail === "microwave") return <Group><Rect x={8} y={h*.15} width={w-16} height={h*.7} fill={color} stroke={stroke} strokeWidth={6} cornerRadius={12}/><Rect x={w*.08} y={h*.24} width={w*.59} height={h*.48} fill={accent} stroke={stroke} strokeWidth={5} cornerRadius={6}/><Line points={[w*.16,h*.62,w*.54,h*.34]} stroke="#8aa7ac" strokeWidth={9} opacity={.4}/><Rect x={w*.76} y={h*.25} width={w*.15} height={h*.13} fill="#172b26"/><Text text="0:05" x={w*.76} y={h*.27} width={w*.15} align="center" fontSize={w*.047} fill="#a8eaa0"/><Circle x={w*.83} y={h*.55} radius={w*.06} fill="#adb8ba" stroke={stroke} strokeWidth={4}/></Group>;
  if (asset.thumbnail === "pizza") return <Group><Ellipse x={w/2} y={h*.55} radiusX={w*.46} radiusY={h*.36} fill="#faf5e8" stroke={stroke} strokeWidth={5}/><Ellipse x={w/2} y={h*.5} radiusX={w*.4} radiusY={h*.3} fill={color} stroke="#a97135" strokeWidth={10}/>{[0,1,2,3,4,5].map(i=><Circle key={i} x={w*(.5+Math.cos(i*Math.PI/3)*.25)} y={h*(.5+Math.sin(i*Math.PI/3)*.17)} radius={Math.min(w,h)*.06} fill={accent}/>)}<Line points={[w*.15,h*.5,w*.85,h*.5]} stroke="#b28244" strokeWidth={3}/><Line points={[w*.3,h*.28,w*.7,h*.72]} stroke="#b28244" strokeWidth={3}/></Group>;
  if (asset.thumbnail === "clock") return <Group x={w/2} y={h/2}><Circle radius={Math.min(w,h)*.42} fill={color} stroke={accent} strokeWidth={9}/>{Array.from({length:12},(_,i)=><Circle key={i} x={Math.sin(i*Math.PI/6)*Math.min(w,h)*.34} y={-Math.cos(i*Math.PI/6)*Math.min(w,h)*.34} radius={3} fill={accent}/>)}<Line points={[0,0,0,-h*.22]} rotation={tick*.006} stroke={accent} strokeWidth={5} lineCap="round"/><Line points={[0,0,w*.17,0]} stroke={accent} strokeWidth={6} lineCap="round"/><Circle radius={6} fill="#cc6158"/></Group>;
  if (asset.thumbnail === "sofa") return <Group><Rect x={w*.08} y={h*.16} width={w*.84} height={h*.55} cornerRadius={18} fill={accent} stroke={stroke} strokeWidth={6}/>{[.16,.51].map(x=><Rect key={x} x={w*x} y={h*.22} width={w*.33} height={h*.42} cornerRadius={12} fill={color} stroke={stroke} strokeWidth={4}/>)}<Rect x={w*.06} y={h*.54} width={w*.88} height={h*.22} cornerRadius={10} fill={color} stroke={stroke} strokeWidth={6}/>{[.04,.85].map(x=><Rect key={x} x={w*x} y={h*.4} width={w*.11} height={h*.35} cornerRadius={9} fill={accent} stroke={stroke} strokeWidth={5}/>)}<Line points={[w*.16,h*.77,w*.16,h*.88]} stroke={stroke} strokeWidth={10}/><Line points={[w*.84,h*.77,w*.84,h*.88]} stroke={stroke} strokeWidth={10}/></Group>;
  if (asset.thumbnail === "plant") return <Group><Group x={w/2} y={h*.65} rotation={Math.sin(tick*.0015)*3}><Line points={[0,0,0,-h*.46]} stroke="#43664b" strokeWidth={7}/>{[0,1,2,3].map(i=><Ellipse key={i} x={(i%2?1:-1)*w*.13} y={-h*(.15+i*.09)} radiusX={w*.18} radiusY={h*.065} rotation={i%2?-35:35} fill={color} stroke="#43664b" strokeWidth={3}/>)}</Group><Line points={[w*.3,h*.62,w*.7,h*.62,w*.64,h*.91,w*.36,h*.91]} closed fill={accent} stroke={stroke} strokeWidth={5}/></Group>;
  if (asset.thumbnail === "cup") return <Group><Ellipse x={w*.71} y={h*.49} radiusX={w*.17} radiusY={h*.2} stroke={stroke} strokeWidth={9}/><Rect x={w*.2} y={h*.22} width={w*.5} height={h*.55} fill={color} stroke={stroke} strokeWidth={6} cornerRadius={20}/><Ellipse x={w*.45} y={h*.23} radiusX={w*.25} radiusY={h*.08} fill="#684a37" stroke={stroke} strokeWidth={5}/><Line points={[w*.42,h*.16,w*.39,h*.07,w*.43,0]} stroke="#fff" strokeWidth={5} opacity={.4+Math.sin(tick*.004)*.2} tension={.5}/></Group>;
  if (asset.thumbnail === "paper") return <Group><Rect x={w*.16} y={h*.05} width={w*.68} height={h*.9} fill={color} stroke={stroke} strokeWidth={5}/>{[.25,.4,.55,.7].map(y=><Line key={y} points={[w*.28,h*y,w*.72,h*y]} stroke={accent} strokeWidth={4}/>)}</Group>;
  if (asset.thumbnail === "box") return <Group><Rect x={w*.1} y={h*.2} width={w*.8} height={h*.66} fill={color} stroke={stroke} strokeWidth={5}/><Rect x={w*.44} y={h*.2} width={w*.12} height={h*.66} fill="#e2c599"/><Line points={[w*.1,h*.2,w*.22,h*.07,w*.8,h*.07,w*.9,h*.2]} closed fill={accent} stroke={stroke} strokeWidth={5}/></Group>;
  if (asset.thumbnail === "money") return <Group><Rect x={20} y={50} width={w - 40} height={h - 95} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={10} /><Circle x={w / 2} y={h / 2} radius={35} fill={accent} /><Line points={[40, 85, w - 40, 70]} stroke={stroke} strokeWidth={4} /></Group>;
  if (asset.thumbnail === "arrow") return <Arrow points={[20, h / 2, w - 45, h / 2]} pointerLength={55} pointerWidth={55} fill={color} stroke={stroke} strokeWidth={12} />;
  if (asset.thumbnail === "bubble") return <Label><Tag width={w} height={h * 0.75} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={28} pointerDirection="down" pointerWidth={45} pointerHeight={42} /><Text text="..." width={w} y={40} align="center" fontSize={64} fill={stroke} /></Label>;
  if (asset.thumbnail === "burst") return <Star x={w / 2} y={h / 2} numPoints={12} innerRadius={45 * pulse} outerRadius={110 * pulse} fill={color} stroke={stroke} strokeWidth={8} opacity={0.9} />;
  if (asset.thumbnail === "glow") return <Group opacity={0.45 + Math.sin(tick * 0.005) * 0.18}><Circle x={w / 2} y={h / 2} radius={Math.min(w, h) * 0.34 * pulse} fill={color} /><Circle x={w / 2} y={h / 2} radius={Math.min(w, h) * 0.2} fill={accent} opacity={0.55} /></Group>;
  if (asset.thumbnail === "speed-lines") return <Group opacity={0.65}>{[0, 1, 2, 3, 4].map((i) => <Line key={i} points={[w * (0.1 + i * 0.08), h * (0.22 + i * 0.12), w * (0.85 + i * 0.02), h * (0.1 + i * 0.12)]} stroke={color} strokeWidth={10} lineCap="round" dash={[70, 24]} dashOffset={tick * 0.08} />)}</Group>;
  if (asset.thumbnail === "dust") return <Group opacity={0.5}>{[0.18, 0.32, 0.48, 0.66, 0.82].map((x, i) => <Circle key={x} x={w * x} y={h * (0.25 + ((i * 23 + tick * 0.006) % 55) / 100)} radius={8 + i * 2} fill={color} opacity={0.32 + i * 0.05} />)}</Group>;
  if (asset.thumbnail === "question") return <Group opacity={0.75 + Math.sin(tick * 0.006) * 0.15}><Text text="?" x={w * 0.12} y={h * 0.12} fontSize={90} fontStyle="bold" fill={color} stroke={accent} strokeWidth={4} /><Text text="?" x={w * 0.48} y={h * 0.28 + Math.sin(tick * 0.006) * 10} fontSize={70} fontStyle="bold" fill={color} stroke={accent} strokeWidth={4} /><Text text="?" x={w * 0.72} y={h * 0.08} fontSize={56} fontStyle="bold" fill={color} stroke={accent} strokeWidth={4} /></Group>;
  if (asset.thumbnail === "text") return <Text text={object.text ?? "YOUR SHORTS CAPTION"} width={w} height={h} fontSize={54} fontStyle="bold" align="center" verticalAlign="middle" fill={color} stroke={accent} strokeWidth={5} fillAfterStrokeEnabled />;
  if (asset.thumbnail === "chart") return <Group><Rect x={10} y={15} width={w - 20} height={h - 30} fill={color} stroke={stroke} strokeWidth={8} /><Line points={[55, h - 55, 110, 125, 170, 150, 225, 70]} stroke={accent} strokeWidth={12} lineCap="round" lineJoin="round" /></Group>;
  if (asset.thumbnail === "chair") return <Group><Rect x={w * 0.22} y={h * 0.38} width={w * 0.54} height={h * 0.16} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={8} /><Rect x={w * 0.62} y={h * 0.12} width={w * 0.16} height={h * 0.42} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={8} /><Line points={[w * 0.28, h * 0.54, w * 0.22, h * 0.92]} stroke={stroke} strokeWidth={9} lineCap="round" /><Line points={[w * 0.68, h * 0.54, w * 0.76, h * 0.92]} stroke={stroke} strokeWidth={9} lineCap="round" /></Group>;
  if (asset.thumbnail === "bench") return <Group><Rect x={w * 0.08} y={h * 0.36} width={w * 0.84} height={h * 0.18} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={10} /><Line points={[w * 0.24, h * 0.54, w * 0.18, h * 0.92]} stroke={stroke} strokeWidth={9} lineCap="round" /><Line points={[w * 0.76, h * 0.54, w * 0.82, h * 0.92]} stroke={stroke} strokeWidth={9} lineCap="round" /></Group>;
  if (asset.thumbnail === "tree") return <Group><Rect x={w * 0.44} y={h * 0.42} width={w * 0.15} height={h * 0.48} fill={accent} stroke={stroke} strokeWidth={7} cornerRadius={8} /><Circle x={w * 0.5} y={h * 0.28} radius={Math.min(w, h) * 0.26} fill={color} stroke={stroke} strokeWidth={8} /><Circle x={w * 0.36} y={h * 0.38} radius={Math.min(w, h) * 0.2} fill={color} stroke={stroke} strokeWidth={7} /><Circle x={w * 0.64} y={h * 0.39} radius={Math.min(w, h) * 0.2} fill={color} stroke={stroke} strokeWidth={7} /></Group>;
  if (asset.thumbnail === "table") return <Group><Rect x={w * 0.08} y={h * 0.34} width={w * 0.84} height={h * 0.18} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={8} /><Line points={[w * 0.18, h * 0.52, w * 0.1, h * 0.9]} stroke={stroke} strokeWidth={10} lineCap="round" /><Line points={[w * 0.82, h * 0.52, w * 0.9, h * 0.9]} stroke={stroke} strokeWidth={10} lineCap="round" /></Group>;
  if (asset.thumbnail === "car") return <Group><Rect x={w * 0.1} y={h * 0.42} width={w * 0.8} height={h * 0.28} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={22} /><Line points={[w * 0.28, h * 0.42, w * 0.4, h * 0.25, w * 0.64, h * 0.25, w * 0.76, h * 0.42]} fill={color} stroke={stroke} strokeWidth={8} closed /><Circle x={w * 0.28} y={h * 0.72} radius={w * 0.08} fill={accent} stroke={stroke} strokeWidth={6} /><Circle x={w * 0.72} y={h * 0.72} radius={w * 0.08} fill={accent} stroke={stroke} strokeWidth={6} /></Group>;
  if (asset.thumbnail === "shelf") return <Group><Rect x={w * 0.12} y={h * 0.08} width={w * 0.76} height={h * 0.82} fill={color} stroke={stroke} strokeWidth={8} /><Line points={[w * 0.12, h * 0.35, w * 0.88, h * 0.35, w * 0.12, h * 0.62, w * 0.88, h * 0.62]} stroke={stroke} strokeWidth={6} /><Circle x={w * 0.28} y={h * 0.25} radius={18} fill="#db5b48" /><Rect x={w * 0.56} y={h * 0.47} width={34} height={52} fill="#72b9b1" /></Group>;
  if (asset.thumbnail === "bottle") return <Group><Rect x={w * 0.42} y={h * 0.15} width={w * 0.16} height={h * 0.22} fill={accent} stroke={stroke} strokeWidth={6} cornerRadius={8} /><Rect x={w * 0.28} y={h * 0.34} width={w * 0.44} height={h * 0.48} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={26} /><Line points={[w * 0.33, h * 0.58, w * 0.67, h * 0.53]} stroke={accent} strokeWidth={12} opacity={0.7} /></Group>;
  if (asset.thumbnail === "magnifier") return <Group><Circle x={w * 0.42} y={h * 0.38} radius={Math.min(w, h) * 0.23} fill={color} stroke={stroke} strokeWidth={9} opacity={0.82} /><Line points={[w * 0.58, h * 0.55, w * 0.82, h * 0.82]} stroke={accent} strokeWidth={18} lineCap="round" /><Line points={[w * 0.58, h * 0.55, w * 0.82, h * 0.82]} stroke={stroke} strokeWidth={7} lineCap="round" /></Group>;
  if (asset.thumbnail === "window") return <Group><Rect x={w * 0.1} y={h * 0.12} width={w * 0.8} height={h * 0.68} fill={color} stroke={stroke} strokeWidth={8} /><Line points={[w * 0.5, h * 0.12, w * 0.5, h * 0.8, w * 0.1, h * 0.46, w * 0.9, h * 0.46]} stroke={stroke} strokeWidth={6} /></Group>;
  if (asset.thumbnail === "lamp") return <Group><Line points={[w * 0.5, h * 0.5, w * 0.5, h * 0.88]} stroke={accent} strokeWidth={10} /><Line points={[w * 0.32, h * 0.9, w * 0.68, h * 0.9]} stroke={stroke} strokeWidth={8} lineCap="round" /><RegularPolygon x={w * 0.5} y={h * 0.32} sides={4} radius={w * 0.2} fill={color} stroke={stroke} strokeWidth={8} rotation={45} /></Group>;
  if (asset.thumbnail === "laptop") return <Group><Rect x={42} y={30} width={w - 84} height={h - 80} fill={accent} stroke={stroke} strokeWidth={8} cornerRadius={8} /><Rect x={10} y={h - 55} width={w - 20} height={32} fill={color} stroke={stroke} strokeWidth={7} /></Group>;
  if (asset.thumbnail === "phone") return <Rect x={w * 0.3} y={10} width={w * 0.4} height={h - 20} fill={color} stroke={stroke} strokeWidth={8} cornerRadius={24} />;
  return <RegularPolygon x={w / 2} y={h / 2} sides={4} radius={Math.min(w, h) * 0.38} fill={color} stroke={stroke} strokeWidth={8} />;
}

export function AssetArt(props: ArtProps) {
  if (props.asset.id === "bg-time-card") return <Group><Rect width={props.object.transform.width} height={props.object.transform.height} fill="#244f50"/>{Array.from({length:8},(_,i)=><Line key={i} points={[0,props.object.transform.height*i/7,props.object.transform.width,props.object.transform.height*(i+.5)/7]} stroke="#8dc2ae" strokeWidth={3} opacity={.16}/>)}</Group>;
  if (props.asset.kind === "character") return <CharacterArt {...props} />;
  if (props.asset.kind === "background") return <BackgroundArt {...props} />;
  return <PropArt {...props} />;
}
