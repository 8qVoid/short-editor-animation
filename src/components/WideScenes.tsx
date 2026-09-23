import { Circle, Ellipse, Group, Line, Rect, Text } from "react-konva";

const ink = "#303a40";
const edge = { stroke: ink, strokeWidth: 2.5, lineJoin: "round" as const };
const outdoorScenes = ["street", "sidewalk", "alley", "park", "blank-outdoor", "mall-exterior", "restaurant-exterior", "parking-lot"];

function Window({ x, y, width = 150, height = 150, glass }: { x: number; y: number; width?: number; height?: number; glass: string }) {
  return <Group x={x} y={y}><Rect width={width} height={height} fill={glass} {...edge} /><Line points={[width / 2, 0, width / 2, height]} stroke="#eff7f5" strokeWidth={6} /><Line points={[0, height / 2, width, height / 2]} stroke="#eff7f5" strokeWidth={6} /><Rect x={-5} y={height} width={width + 10} height={7} fill="#eff7f5" {...edge} /></Group>;
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <Group x={x} y={y} scaleX={scale} scaleY={scale}><Ellipse y={142} radiusX={48} radiusY={9} fill={ink} opacity={.12} /><Rect x={-8} width={16} height={140} fill="#967250" {...edge} /><Line points={[0, 65, -25, 30, 0, 65, 25, 25]} stroke="#715139" strokeWidth={6} /><Circle x={-28} y={10} radius={39} fill="#4b9470" {...edge} /><Circle x={28} y={5} radius={43} fill="#58a77a" {...edge} /><Circle y={-23} radius={43} fill="#6ab785" {...edge} /></Group>;
}

function Bench({ x, y }: { x: number; y: number }) {
  return <Group x={x} y={y}>{[14, 150].map(left => <Line key={left} points={[left, 0, left, 65, left - 5, 83]} stroke={ink} strokeWidth={6} />)}{[0, 19, 38].map(top => <Rect key={top} y={top} width={166} height={13} fill="#ca9670" {...edge} />)}<Rect x={-5} y={56} width={176} height={12} fill="#d9aa80" {...edge} /></Group>;
}

function Lamp({ x, y = 150, night }: { x: number; y?: number; night: boolean }) {
  return <Group x={x} y={y}><Line points={[0, 220, 0, 0, -32, 0]} stroke={ink} strokeWidth={6} /><Rect x={-52} y={-5} width={42} height={14} cornerRadius={4} fill={night ? "#ffe5a1" : "#eff3ed"} {...edge} />{night && <><Line points={[-45, 9, -16, 9, 48, 225, -108, 225]} closed fill="#ffe3a0" opacity={.12} /><Ellipse x={-30} y={225} radiusX={78} radiusY={13} fill="#ffe5ac" opacity={.18} /></>}</Group>;
}

function Desk({ x, y, width = 180 }: { x: number; y: number; width?: number }) {
  return <Group x={x} y={y}><Line points={[12, 10, 12, 90, width - 12, 90, width - 12, 10]} stroke="#576771" strokeWidth={6} /><Rect width={width} height={12} fill="#c49872" {...edge} /></Group>;
}

function Chair({ x, y }: { x: number; y: number }) {
  return <Group x={x} y={y}><Rect width={55} height={40} cornerRadius={5} fill="#ba808f" {...edge} /><Line points={[5, 40, 5, 90, 5, 52, 50, 52, 50, 90]} stroke={ink} strokeWidth={5} /></Group>;
}

function Car({ x, y, color }: { x: number; y: number; color: string }) {
  return <Group x={x} y={y}><Rect y={26} width={108} height={57} cornerRadius={12} fill={color} {...edge} /><Line points={[10, 32, 26, 0, 81, 0, 98, 32]} closed fill={color} {...edge} /><Line points={[23, 27, 33, 7, 75, 7, 85, 27]} closed fill="#b9dae3" {...edge} />{[12, 79].map(left => <Group key={left}><Rect x={left} y={82} width={18} height={12} fill={ink} /><Rect x={left} y={49} width={18} height={10} fill="#fff0b1" {...edge} /></Group>)}<Rect x={37} y={68} width={33} height={9} fill="#edf0ea" /></Group>;
}

function IndoorBase({ scene }: { scene: string }) {
  const wall = scene === "classroom" ? "#e8ecdc" : scene === "restaurant" ? "#ead9d9" : "#dfebec";
  return <><Rect width={960} height={540} fill={wall} /><Line points={[0, 0, 74, 40, 886, 40, 960, 0]} closed fill="#f2f3ee" /><Line points={[0, 0, 74, 40, 74, 350, 0, 390]} closed fill="#c2d1d1" /><Line points={[960, 0, 886, 40, 886, 350, 960, 390]} closed fill="#c2d1d1" /><Line points={[0, 390, 74, 350, 886, 350, 960, 390, 960, 540, 0, 540]} closed fill={scene === "restaurant" ? "#b6a8a0" : "#b3c4c8"} /><Line points={[0, 390, 74, 350, 886, 350, 960, 390]} stroke="#f1f2ed" strokeWidth={8} />{[415, 470].map(y => <Line key={y} points={[0, y, 960, y]} stroke={ink} opacity={.12} />)}{[0, 160, 320, 480, 640, 800, 960].map(x => <Line key={x} points={[480 + (x - 480) * .65, 353, x, 540]} stroke={ink} opacity={.12} />)}</>;
}

function Shelf({ x }: { x: number }) {
  return <Group x={x} y={140}><Rect width={174} height={217} fill="#d2dfe0" {...edge} />{[14, 80, 146].map((y, row) => <Group key={y}>{[12, 52, 92, 132].map((left, i) => <Group key={left}><Rect x={left} y={y} width={26} height={45} cornerRadius={3} fill={["#d78e7e", "#83b4b6", "#d9be6d"][(i + row) % 3]} {...edge} /><Rect x={left + 3} y={y + 17} width={20} height={13} fill="#f5f3e8" /></Group>)}<Rect y={y + 48} width={174} height={8} fill="#7b919b" {...edge} /></Group>)}</Group>;
}

function Bottle({ x, y, color }: { x: number; y: number; color: string }) {
  return <Group x={x} y={y}><Line points={[8, 0, 20, 0, 20, 16, 32, 45, -4, 45, 8, 16]} closed fill="#e0f5f5" {...edge} /><Line points={[3, 28, 24, 28, 29, 42, -1, 42]} closed fill={color} /><Rect x={6} y={-4} width={16} height={5} fill="#6c7781" {...edge} /></Group>;
}

function WideIndoor({ scene, glass, sky, night }: { scene: string; glass: string; sky: string; night: boolean }) {
  return <><IndoorBase scene={scene} />
    {scene === "office" && <>
      <Window x={105} y={90} width={220} height={155} glass={sky} /><Window x={630} y={90} width={200} height={155} glass={sky} />
      <Rect x={394} y={88} width={165} height={112} fill="#fff" {...edge} /><Text x={411} y={102} text="PROJECT" fontSize={16} fill={ink} /><Line points={[409, 177, 443, 153, 472, 164, 506, 132, 541, 119]} stroke="#4f9d95" strokeWidth={4} />
      {[120, 520].map(x => <Group key={x}><Desk x={x} y={310} width={265} /><Rect x={x + 45} y={222} width={125} height={74} fill="#42555f" {...edge} /><Rect x={x + 52} y={229} width={111} height={58} fill="#a7d8e0" /><Line points={[x + 107, 296, x + 107, 308, x + 86, 308, x + 129, 308]} stroke={ink} strokeWidth={4} /><Chair x={x + 100} y={345} /></Group>)}
      <Rect x={814} y={271} width={78} height={111} fill="#849ca8" {...edge} />{[280, 312, 344].map(y => <Group key={y}><Rect x={821} y={y} width={64} height={27} fill="#c1d0d6" {...edge} /><Line points={[845, y + 8, 860, y + 8]} stroke={ink} strokeWidth={3} /></Group>)}
    </>}
    {scene === "classroom" && <>
      <Window x={103} y={98} width={126} height={166} glass={sky} /><Rect x={305} y={84} width={405} height={194} fill="#b58d68" {...edge} /><Rect x={314} y={93} width={387} height={176} fill="#356557" /><Text x={343} y={120} text="A B C     1 2 3" fontSize={29} fill="#eef6dc" /><Text x={345} y={181} text="2 + 3 = 5" fontSize={25} fill="#eef6dc" /><Line points={[592, 242, 628, 174, 667, 242, 592, 242]} stroke="#e8eec9" strokeWidth={3} /><Circle x={807} y={112} radius={29} fill="#fff" {...edge} /><Line points={[807, 93, 807, 112, 821, 122]} stroke={ink} strokeWidth={3} /><Desk x={699} y={325} width={147} />
      {[115, 350, 585].map(x => <Group key={x}><Desk x={x} y={400} /><Rect x={x + 25} y={388} width={63} height={10} fill="#f7faf5" {...edge} /><Chair x={x + 64} y={433} /></Group>)}
    </>}
    {scene === "lab" && <>
      {[110, 270, 430, 590, 750].map(x => <Group key={x}><Rect x={x} y={88} width={140} height={124} fill="#c4d9df" {...edge} /><Rect x={x + 8} y={96} width={124} height={108} fill="#eaf3f2" {...edge} /><Line points={[x + 112, 145, x + 112, 166]} stroke={ink} strokeWidth={4} /><Rect x={x} y={300} width={140} height={83} fill="#d9e5e7" {...edge} /><Line points={[x + 48, 315, x + 88, 315]} stroke={ink} strokeWidth={4} /></Group>)}
      <Rect x={98} y={285} width={804} height={17} fill="#526b75" {...edge} />{[140, 190, 240, 590, 640].map((x, i) => <Bottle key={x} x={x} y={236} color={["#72bfb0", "#ba8dc4", "#eac168"][i % 3]} />)}
      <Group x={422} y={206}><Line points={[12, 0, 44, 30, 46, 51, 16, 70]} stroke={ink} strokeWidth={13} tension={.4} /><Line points={[0, 0, 23, 28]} stroke="#cbdce2" strokeWidth={13} /><Rect x={-5} y={46} width={40} height={6} fill={ink} /><Rect x={-10} y={70} width={73} height={9} fill="#dce7e8" {...edge} /></Group><Circle x={789} y={253} radius={18} fill="#b6e1ea" {...edge} /><Line points={[777, 266, 761, 282]} stroke={ink} strokeWidth={6} />
    </>}
    {scene === "store" && <>
      <Text x={105} y={75} text="FRESH FOOD & EVERYDAY ESSENTIALS" fontSize={22} fill="#456964" />{[105, 299, 493, 687].map(x => <Shelf key={x} x={x} />)}
      <Rect x={538} y={407} width={330} height={104} fill="#76a9a4" {...edge} /><Rect x={527} y={394} width={352} height={15} fill="#edf2ee" {...edge} /><Rect x={733} y={344} width={88} height={48} fill="#475d66" {...edge} /><Rect x={740} y={351} width={74} height={29} fill="#b9dad8" />
    </>}
    {scene === "hospital" && <>
      <Window x={107} y={95} width={193} height={165} glass={sky} /><Line points={[606, 70, 893, 70]} stroke={ink} strokeWidth={5} /><Rect x={805} y={77} width={84} height={280} fill="#91c8c3" {...edge} />{[819, 840, 861, 881].map(x => <Line key={x} points={[x, 82, x, 351]} stroke="#609d99" strokeWidth={3} />)}
      <Group x={151} y={280}><Rect y={-15} width={17} height={123} fill="#dce5e9" {...edge} /><Rect x={13} y={34} width={285} height={52} cornerRadius={10} fill="#faf8f0" {...edge} /><Rect x={24} y={21} width={77} height={25} cornerRadius={8} fill="#fffdf7" {...edge} /><Rect x={119} y={32} width={173} height={62} fill="#72b8c2" {...edge} /><Rect x={9} y={96} width={300} height={11} fill="#b3c4cb" {...edge} />{[28, 278].map(x => <Group key={x}><Line points={[x, 107, x, 128]} stroke={ink} strokeWidth={7} /><Circle x={x} y={132} radius={8} fill={ink} /></Group>)}</Group>
      <Rect x={483} y={178} width={110} height={76} cornerRadius={4} fill="#f7fbfa" {...edge} /><Rect x={490} y={185} width={96} height={58} fill="#304d54" /><Line points={[496, 213, 513, 213, 520, 199, 529, 229, 540, 195, 549, 213, 580, 213]} stroke="#8ce0b6" strokeWidth={3} /><Line points={[538, 254, 538, 378, 508, 393, 538, 378, 568, 393]} stroke={ink} strokeWidth={5} /><Line points={[684, 196, 684, 386, 659, 398, 684, 386, 711, 398]} stroke="#5a747f" strokeWidth={5} /><Line points={[672, 196, 708, 196, 708, 208]} stroke={ink} strokeWidth={3} /><Rect x={696} y={208} width={24} height={40} fill="#edfafa" {...edge} /><Line points={[708, 248, 720, 306, 704, 332, 450, 341]} stroke="#769cac" strokeWidth={2} tension={.3} />
    </>}
    {scene === "restaurant" && <>
      <Rect x={75} y={279} width={810} height={70} fill="#75908c" />{[105, 300].map(x => <Window key={x} x={x} y={97} width={158} height={152} glass={glass} />)}<Rect x={616} y={104} width={161} height={139} fill="#375b53" stroke="#bd9273" strokeWidth={8} /><Text x={645} y={121} text="MENU" fontSize={22} fill="#f9f3db" />{[167, 189, 211].map(y => <Line key={y} points={[640, y, 753, y]} stroke="#d8e6cf" strokeWidth={3} />)}
      {[180, 475, 770].map(x => <Group key={x}><Line points={[x, 0, x, 76]} stroke={ink} strokeWidth={3} /><Line points={[x - 17, 76, x + 17, 76, x + 31, 99, x - 31, 99]} closed fill="#d5ad68" {...edge} />{night && <Line points={[x - 24, 100, x + 24, 100, x + 90, 355, x - 90, 355]} closed fill="#ffe3a0" opacity={.13} />}<Chair x={x - 112} y={365} /><Chair x={x + 60} y={365} /><Line points={[x - 46, 360, x - 46, 435, x + 46, 435, x + 46, 360]} stroke="#66564c" strokeWidth={6} /><Ellipse x={x} y={356} radiusX={94} radiusY={26} fill="#faf4e5" {...edge} />{[-43, 43].map(dx => <Ellipse key={dx} x={x + dx} y={354} radiusX={21} radiusY={8} stroke="#8facae" strokeWidth={2} />)}<Rect x={x - 6} y={331} width={12} height={22} fill="#8ab6b2" {...edge} /><Line points={[x, 334, x, 316]} stroke="#4c885e" strokeWidth={3} /><Circle x={x} y={313} radius={7} fill="#dd9eac" /></Group>)}
    </>}
    {scene === "gym" && <>
      <Text x={400} y={64} text="FITNESS" fontSize={27} fontStyle="bold" fill="#487b78" /><Rect x={108} y={112} width={744} height={187} fill="#9ebdc9" {...edge} />{[294, 480, 666].map(x => <Line key={x} points={[x, 112, x, 299]} stroke="#e6eff0" strokeWidth={5} />)}<Line points={[128, 284, 253, 125, 285, 125, 160, 284]} closed fill="#d2e5e9" opacity={.5} />
      <Group x={128} y={288}><Line points={[0, 0, 0, 110, 240, 110, 240, 0]} stroke="#394c58" strokeWidth={8} />{[15, 65].map(y => <Group key={y}><Line points={[0, y + 18, 240, y + 18]} stroke="#6e858f" strokeWidth={7} />{[15, 70, 125, 180].map(x => <Group key={x}><Line points={[x, y, x + 38, y]} stroke={ink} strokeWidth={5} /><Rect x={x} y={y - 12} width={10} height={24} fill="#425969" {...edge} /><Rect x={x + 28} y={y - 12} width={10} height={24} fill="#425969" {...edge} /></Group>)}</Group>)}</Group>
      <Group x={556} y={275}><Line points={[0, 133, 20, 0, 166, 0, 186, 133]} stroke="#4c626e" strokeWidth={7} /><Line points={[-5, 29, 190, 29]} stroke={ink} strokeWidth={6} />{[8, 163].map(x => <Rect key={x} x={x} y={5} width={14} height={48} fill="#52616c" {...edge} />)}<Rect x={39} y={87} width={108} height={15} fill="#c6757a" {...edge} /><Line points={[48, 102, 48, 144, 138, 144, 138, 102]} stroke={ink} strokeWidth={5} /></Group>
      <Line points={[195, 452, 390, 452, 431, 518, 183, 518]} closed fill="#75aaa5" {...edge} /><Circle x={809} y={450} radius={37} fill="#a997c4" {...edge} /><Line points={[794, 420, 780, 449, 794, 480]} stroke="#c8badd" strokeWidth={3} tension={.5} />
    </>}
  </>;
}



export function WideScenes({ scene, night, sky, time }: { scene: string; night: boolean; sky: string; time: string }) {
  const glass = night ? "#ead998" : "#d7eff2";
  if (!outdoorScenes.includes(scene)) return <WideIndoor scene={scene} glass={glass} sky={sky} night={night} />;
  return <>
    <Rect width={960} height={540} fill={sky} />
    <Circle x={time === "sunrise" ? 125 : 822} y={time === "sunrise" || time === "sunset" ? 238 : 72} radius={30} fill={night ? "#f2efd1" : "#ffe092"} />
    {night ? [43, 152, 295, 412, 577, 687, 902].map((x, i) => <Circle key={x} x={x} y={24 + i % 3 * 27} radius={2} fill="#f2f5ff" />) : [90, 410, 660].map((x, i) => <Group key={x} x={x} y={79 + i % 2 * 32}><Ellipse radiusX={40} radiusY={12} fill="#fff" opacity={.8} /><Circle x={-12} y={-9} radius={16} fill="#fff" opacity={.8} /><Circle x={12} y={-12} radius={20} fill="#fff" opacity={.8} /></Group>)}
    <Line points={[0, 294, 140, 250, 300, 286, 450, 244, 640, 285, 800, 247, 960, 290, 960, 540, 0, 540]} closed fill="#a0c993" /><Rect y={323} width={960} height={217} fill="#80b47d" />
    {scene === "street" && <>
      {[{ x: -12, h: 204, c: "#91a9b8" }, { x: 156, h: 267, c: "#b9b6c9" }, { x: 324, h: 229, c: "#b3c9bf" }, { x: 492, h: 253, c: "#c7b8a2" }, { x: 660, h: 201, c: "#a8bccb" }, { x: 828, h: 240, c: "#c6aaa9" }].map(({ x, h, c }) => <Group key={x} x={x} y={330 - h}><Rect width={164} height={h} fill={c} {...edge} />{[25, 96].map(left => [26, 82, 138].filter(y => y < h - 57).map(y => <Rect key={`${left}-${y}`} x={left} y={y} width={37} height={40} fill={glass} {...edge} />))}<Rect x={63} y={h - 58} width={39} height={58} fill="#5f7c87" {...edge} /></Group>)}
      <Rect y={330} width={960} height={79} fill="#d8dcda" />{[0, 160, 320, 480, 640, 800].map(x => <Line key={x} points={[x, 331, x - 25, 409]} stroke="#adb7b6" />)}<Rect y={409} width={960} height={11} fill="#a6b5b9" {...edge} /><Rect y={420} width={960} height={120} fill="#68757f" /><Line points={[0, 491, 960, 491]} stroke="#f2e7b2" strokeWidth={6} dash={[62, 45]} /><Lamp x={246} night={night} /><Lamp x={802} night={night} />
    </>}
    {scene === "sidewalk" && <>
      {[66, 364, 662].map((x, i) => <Group key={x} x={x} y={153}><Rect width={220} height={173} fill={["#d8acac", "#b9c8dd", "#e1cfad"][i]} {...edge} /><Line points={[-14, 0, 110, -65, 234, 0]} closed fill="#697a83" {...edge} />{[20, 139].map(left => <Window key={left} x={left} y={24} width={59} height={63} glass={glass} />)}<Rect x={86} y={91} width={49} height={82} fill="#658f88" {...edge} /><Circle x={125} y={136} radius={3} fill="#f5ddb2" /></Group>)}
      <Rect y={376} width={960} height={96} fill="#d6d9d4" />{[0, 120, 240, 360, 480, 600, 720, 840].map(x => <Line key={x} points={[x, 376, x - 30, 472]} stroke="#a5aeab" />)}<Line points={[0, 424, 960, 424]} stroke="#a5aeab" /><Rect y={472} width={960} height={12} fill="#9fabaf" {...edge} /><Rect y={484} width={960} height={56} fill="#69747b" /><Tree x={33} y={222} scale={.8} /><Tree x={913} y={222} scale={.8} /><Lamp x={599} y={185} night={night} /><Rect x={301} y={321} width={6} height={54} fill="#4d656e" /><Rect x={282} y={299} width={43} height={28} cornerRadius={5} fill="#628ba2" {...edge} />
    </>}
    {scene === "park" && <>
      <Line points={[470, 321, 508, 321, 601, 410, 818, 540, 624, 540, 471, 419, 431, 370]} closed fill="#dfd8bd" />{[{ x: 85, y: 226, s: 1 }, { x: 308, y: 211, s: .8 }, { x: 674, y: 223, s: .9 }, { x: 867, y: 246, s: 1.15 }].map(p => <Tree key={p.x} x={p.x} y={p.y} scale={p.s} />)}<Bench x={320} y={347} /><Bench x={695} y={387} />{[80, 192, 550, 880].map((x, i) => <Group key={x} x={x} y={447 + i % 2 * 45}><Line points={[0, 15, 0, -2]} stroke="#467a54" strokeWidth={3} /><Circle radius={6} fill="#ebaaa4" /><Circle radius={2} fill="#ffe6a2" /></Group>)}
    </>}
    {scene === "alley" && <>
      <Rect x={320} y={210} width={320} height={148} fill="#8a9499" /><Line points={[320, 358, 640, 358, 960, 540, 0, 540]} closed fill="#a7a9a5" /><Line points={[0, 0, 320, 190, 320, 358, 0, 475]} closed fill="#b18f86" {...edge} /><Line points={[960, 0, 640, 190, 640, 358, 960, 475]} closed fill="#87959e" {...edge} />{[80, 140, 200, 260, 320, 380].map(y => <Line key={y} points={[0, y, 320, 190 + y * .42]} stroke="#836f6b" strokeWidth={2} />)}<Rect x={436} y={246} width={87} height={111} fill="#546770" {...edge} /><Rect x={450} y={262} width={59} height={38} fill={glass} {...edge} /><Line points={[104, 132, 104, 372, 129, 399]} stroke="#53626a" strokeWidth={10} /><Line points={[815, 117, 815, 387]} stroke="#495d68" strokeWidth={7} /><Group x={105} y={369}><Rect width={134} height={79} fill="#587f73" {...edge} /><Rect x={-5} y={-8} width={144} height={15} fill="#3e6156" {...edge} /><Circle x={19} y={88} radius={8} fill={ink} /><Circle x={114} y={88} radius={8} fill={ink} /></Group><Rect x={742} y={399} width={65} height={58} fill="#bfa07b" {...edge} /><Line points={[774, 399, 774, 457]} stroke="#8e765c" strokeWidth={4} /><Ellipse x={538} y={478} radiusX={66} radiusY={13} fill="#809ca7" /><Line points={[295, 160, 480, 201, 661, 160]} stroke={ink} strokeWidth={3} tension={.4} /><Rect x={465} y={198} width={30} height={13} fill="#f4d58e" {...edge} />{night && <Line points={[465, 211, 495, 211, 564, 369, 396, 369]} closed fill="#ffe3a0" opacity={.13} />}
    </>}
    {["mall-exterior", "restaurant-exterior", "parking-lot"].includes(scene) && <>
      <Rect y={332} width={960} height={208} fill="#d0d6d2" />
      {scene === "mall-exterior" && <>
        <Rect x={70} y={156} width={820} height={178} fill="#d7dfe3" {...edge} /><Rect x={60} y={147} width={840} height={14} fill="#698792" {...edge} />{[94, 222, 624, 752].map(x => <Window key={x} x={x} y={191} width={108} height={117} glass={glass} />)}<Rect x={369} y={113} width={222} height={224} fill="#8daeb8" {...edge} /><Rect x={386} y={132} width={188} height={48} fill="#f0f4ee" {...edge} /><Text x={386} y={144} width={188} text="MALL" align="center" fontSize={25} fill="#354e60" /><Window x={406} y={201} width={148} height={131} glass={glass} /><Rect x={390} y={338} width={180} height={10} fill="#a7b6ba" {...edge} /><Rect x={377} y={348} width={206} height={10} fill="#bdc9cd" {...edge} /><Bench x={104} y={388} /><Bench x={690} y={388} /><Tree x={41} y={215} scale={.8} /><Tree x={919} y={215} scale={.8} />{[392, 462, 530].map(y => <Line key={y} points={[285, y, 667, y]} stroke="#a5b1b1" strokeWidth={2} />)}
      </>}
      {scene === "restaurant-exterior" && <>
        <Rect x={126} y={151} width={708} height={191} fill="#d9bbb2" {...edge} /><Rect x={116} y={140} width={728} height={16} fill="#7c6667" {...edge} /><Rect x={303} y={166} width={354} height={43} fill="#f4e9d5" {...edge} /><Text x={303} y={177} width={354} text="RESTAURANT" align="center" fontSize={22} fill="#795158" />{[156, 362].map(x => <Window key={x} x={x} y={238} width={177} height={81} glass={glass} />)}<Rect x={637} y={224} width={105} height={118} fill="#607e78" {...edge} /><Rect x={648} y={234} width={82} height={66} fill={glass} {...edge} /><Circle x={727} y={322} radius={3} fill="#ffe8b4" />{Array.from({ length: 12 }, (_, i) => <Line key={i} points={[147 + i * 33, 215, 180 + i * 33, 215, 185 + i * 33, 247, 152 + i * 33, 247]} closed fill={i % 2 ? "#f3eadd" : "#b96f7c"} {...edge} />)}{[221, 483].map(x => <Group key={x}><Chair x={x - 86} y={395} /><Chair x={x + 42} y={395} /><Line points={[x, 395, x, 469, x - 25, 481, x, 469, x + 25, 481]} stroke={ink} strokeWidth={5} /><Ellipse x={x} y={393} radiusX={65} radiusY={19} fill="#f3e7ce" {...edge} /></Group>)}<Rect x={687} y={388} width={69} height={92} fill="#3f6458" stroke="#b39175" strokeWidth={8} /><Text x={693} y={401} width={57} text={"TODAY\n\nSOUP\nPASTA"} align="center" fontSize={12} fill="#f7ebd1" /><Tree x={76} y={228} scale={.8} /><Tree x={881} y={228} scale={.8} /><Rect y={513} width={960} height={27} fill="#707b82" />
      </>}
      {scene === "parking-lot" && <>
        <Rect x={73} y={179} width={814} height={133} fill="#a8bcbf" {...edge} /><Rect x={64} y={170} width={832} height={14} fill="#647d86" {...edge} />{[104, 206, 308, 616, 718, 820].map(x => <Rect key={x} x={x} y={209} width={52} height={70} fill={glass} {...edge} />)}<Text x={391} y={196} width={186} text="SHOPPING CENTER" align="center" fontSize={15} fill="#334b55" /><Rect x={442} y={237} width={76} height={75} fill={glass} {...edge} /><Rect y={329} width={960} height={211} fill="#78848b" /><Rect y={313} width={960} height={16} fill="#b4c3c5" {...edge} />{[45, 190, 335, 480, 625, 770, 915].map(x => <Line key={x} points={[x, 349, x - 15, 467]} stroke="#ecebdc" strokeWidth={3} />)}<Line points={[0, 467, 960, 467]} stroke="#ecebdc" strokeWidth={3} />{[{ x: 60, c: "#bd7880" }, { x: 205, c: "#83a4bd" }, { x: 640, c: "#a6b696" }, { x: 785, c: "#c5b2ce" }].map(p => <Car key={p.x} x={p.x} y={354} color={p.c} />)}<Line points={[480, 526, 480, 487, 466, 501, 480, 487, 494, 501]} stroke="#efeacb" strokeWidth={5} /><Lamp x={37} y={127} night={night} /><Lamp x={928} y={127} night={night} /><Rect x={552} y={292} width={6} height={49} fill={ink} /><Rect x={538} y={260} width={34} height={35} fill="#527fa3" {...edge} /><Text x={539} y={263} width={32} text="P" align="center" fontSize={25} fill="#fff" />
      </>}
    </>}
  </>;
}


