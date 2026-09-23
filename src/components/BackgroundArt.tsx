import { Circle, Ellipse, Group, Line, Rect, Text } from "react-konva";
import type { Asset, SceneObject } from "../types/editor";
import { createContext, useContext } from "react";
import { ExtraScenes } from "./ExtraScenes";
import { ExteriorScenes, exteriorScenes } from "./ExteriorScenes";
import { sceneTime } from "./SceneLighting";
import { WideScenes } from "./WideScenes";

const SkyColor = createContext("#9cd4e4");

const ink = "#303a40";
const outline = { stroke: ink, strokeWidth: 3, lineJoin: "round" as const };

function Window({ x, y, width = 150, height = 190 }: { x: number; y: number; width?: number; height?: number }) {
  const sky = useContext(SkyColor);
  return <Group x={x} y={y}>
    <Rect width={width} height={height} fill="#f6fbfc" {...outline} />
    <Rect x={8} y={8} width={width - 16} height={height - 16} fill={sky} />
    <Line points={[10, height * .7, width * .45, height * .52, width - 10, height * .65, width - 10, height - 10, 10, height - 10]} closed fill="#81bba4" />
    <Line points={[width / 2, 4, width / 2, height - 4]} stroke="#f6fbfc" strokeWidth={8} />
    <Line points={[4, height / 2, width - 4, height / 2]} stroke="#f6fbfc" strokeWidth={8} />
    <Rect x={-8} y={height} width={width + 16} height={10} fill="#eff4f4" {...outline} />
  </Group>;
}

function Room({ wall, floor, tiles = false }: { wall: string; floor: string; tiles?: boolean }) {
  return <>
    <Rect width={540} height={960} fill={wall} />
    <Rect y={590} width={540} height={370} fill={floor} />
    <Rect y={577} width={540} height={15} fill="#f1f2ed" {...outline} />
    {[660, 755, 865].map(y => <Line key={y} points={[0, y, 540, y]} stroke={ink} opacity={.12} strokeWidth={2} />)}
    {tiles ? [-540, -270, 0, 270, 540, 810, 1080].map(x => <Line key={x} points={[270 + (x - 270) * .28, 592, x, 960]} stroke={ink} opacity={.12} strokeWidth={2} />)
      : [80, 220, 380, 490].map(x => <Line key={x} points={[x, 595, x - 70, 960]} stroke={ink} opacity={.1} strokeWidth={2} />)}
  </>;
}

function Bed({ hospital = false }: { hospital?: boolean }) {
  return <Group x={40} y={455}>
    <Ellipse x={154} y={191} radiusX={170} radiusY={23} fill={ink} opacity={.12} />
    <Rect x={0} y={-28} width={20} height={210} cornerRadius={5} fill={hospital ? "#dce5e9" : "#926b59"} {...outline} />
    <Rect x={15} y={69} width={278} height={72} cornerRadius={12} fill="#faf8f0" {...outline} />
    <Rect x={26} y={53} width={84} height={33} cornerRadius={12} fill="#fffdf7" {...outline} />
    <Rect x={121} y={66} width={166} height={90} cornerRadius={8} fill={hospital ? "#72b8c2" : "#728bc3"} {...outline} />
    <Line points={[139, 72, 139, 149]} stroke="#ffffff" opacity={.4} strokeWidth={4} />
    <Rect x={10} y={150} width={294} height={16} fill={hospital ? "#b3c4cb" : "#926b59"} {...outline} />
    {[25, 278].map(x => <Group key={x}><Rect x={x} y={166} width={12} height={25} fill={hospital ? "#b3c4cb" : "#926b59"} {...outline} />{hospital && <Circle x={x + 6} y={195} radius={9} fill={ink} />}</Group>)}
    {hospital && <Group><Rect x={278} y={86} width={16} height={77} fill="#dce5e9" {...outline} /><Line points={[30, 112, 260, 112]} stroke="#dce5e9" strokeWidth={7} /></Group>}
  </Group>;
}

function Desk({ x, y, width = 210 }: { x: number; y: number; width?: number }) {
  return <Group x={x} y={y}>
    <Ellipse x={width / 2} y={120} radiusX={width * .57} radiusY={13} fill={ink} opacity={.12} />
    {[15, width - 25].map(left => <Rect key={left} x={left} y={12} width={10} height={105} fill="#576771" {...outline} />)}
    <Rect width={width} height={17} cornerRadius={3} fill="#c49872" {...outline} />
  </Group>;
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return <Group x={x} y={y} scaleX={scale} scaleY={scale}>
    <Ellipse x={0} y={205} radiusX={68} radiusY={15} fill="#345f48" opacity={.17} />
    <Line points={[-13, 200, -10, 60, 10, 60, 16, 200]} closed fill="#967250" {...outline} />
    <Line points={[0, 118, -36, 81, 0, 118, 35, 67]} stroke="#715139" strokeWidth={10} />
    <Circle x={-43} y={40} radius={57} fill="#4b9470" {...outline} />
    <Circle x={40} y={30} radius={62} fill="#58a77a" {...outline} />
    <Circle y={-12} radius={62} fill="#6ab785" {...outline} />
    <Line points={[-33, -30, -12, -43, 9, -40]} stroke="#99d59e" strokeWidth={8} lineCap="round" tension={.5} />
  </Group>;
}

function Bench() {
  return <Group x={178} y={518}>
    <Ellipse x={95} y={114} radiusX={115} radiusY={14} fill={ink} opacity={.13} />
    {[22, 165].map(x => <Line key={x} points={[x, 10, x, 75, x - 8, 113]} stroke={ink} strokeWidth={8} lineCap="round" />)}
    {[7, 30, 53].map(y => <Rect key={y} y={y} width={190} height={16} cornerRadius={3} fill="#ca9670" {...outline} />)}
    <Rect x={-7} y={76} width={204} height={14} cornerRadius={3} fill="#d9aa80" {...outline} />
    <Line points={[-7, 64, 16, 64, 16, 82]} stroke={ink} strokeWidth={6} />
    <Line points={[173, 82, 173, 64, 197, 64]} stroke={ink} strokeWidth={6} />
  </Group>;
}

function Bottle({ x, y, color }: { x: number; y: number; color: string }) {
  return <Group x={x} y={y}><Line points={[10, 0, 25, 0, 25, 22, 40, 57, -5, 57, 10, 22]} closed fill="#e0f5f5" {...outline} /><Line points={[6, 33, 29, 33, 37, 54, -2, 54]} closed fill={color} /><Rect x={8} y={-5} width={19} height={7} fill="#6c7781" {...outline} /><Circle x={17} y={42} radius={3} fill="#fff" opacity={.6} /></Group>;
}

function WideRoomBase({ wall, sideWall, floor }: { wall: string; sideWall: string; floor: string }) {
  return <>
    <Rect width={960} height={540} fill={sideWall} />
    <Line points={[170, 38, 790, 38, 900, 0, 62, 0]} closed fill="#e3cfa4" {...outline} />
    <Line points={[170, 38, 790, 38, 790, 392, 170, 392]} closed fill={wall} {...outline} />
    <Line points={[0, 64, 170, 38, 170, 392, 0, 432]} closed fill={sideWall} {...outline} />
    <Line points={[790, 38, 960, 0, 960, 392, 790, 392]} closed fill={sideWall} {...outline} />
    <Line points={[0, 432, 170, 392, 790, 392, 960, 430, 960, 540, 0, 540]} closed fill={floor} {...outline} />
    <Line points={[170, 392, 790, 392]} stroke="#f6efe1" strokeWidth={7} />
    {[90, 230, 370, 510, 650, 790, 930].map(x => <Line key={x} points={[x, 430, x - 52, 540]} stroke={ink} opacity={.12} strokeWidth={2} />)}
    {[455, 500].map(y => <Line key={y} points={[0, y, 960, y]} stroke={ink} opacity={.1} strokeWidth={2} />)}
  </>;
}

function WideBedroom({ night }: { night: boolean }) {
  return <Group>
    <WideRoomBase wall="#e5deea" sideWall="#d1c7db" floor="#bbad9c" />
    <Window x={221} y={102} width={170} height={196} />
    <Rect x={202} y={89} width={35} height={226} fill="#9a91bc" {...outline} />
    <Rect x={378} y={89} width={35} height={226} fill="#9a91bc" {...outline} />
    <Line points={[195, 83, 419, 83]} stroke={ink} strokeWidth={6} />
    <Rect x={628} y={92} width={146} height={328} cornerRadius={4} fill="#ae8872" {...outline} />
    <Rect x={637} y={102} width={60} height={298} fill="#cba88d" {...outline} />
    <Rect x={704} y={102} width={60} height={298} fill="#cba88d" {...outline} />
    <Circle x={687} y={252} radius={4} fill={ink} /><Circle x={715} y={252} radius={4} fill={ink} />
    <Ellipse x={402} y={485} radiusX={193} radiusY={45} fill="#c7b6d6" stroke="#a493b7" strokeWidth={4} />
    <Group x={120} y={-189}><Bed /></Group>
    <Rect x={485} y={337} width={98} height={87} fill="#b79179" {...outline} />
    <Rect x={491} y={343} width={86} height={33} fill="#dbb89b" {...outline} />
    <Circle x={534} y={361} radius={4} fill={ink} />
    <Line points={[533, 332, 533, 272]} stroke={ink} strokeWidth={5} />
    <Ellipse x={533} y={333} radiusX={22} radiusY={5} fill={ink} />
    <Line points={[506, 241, 560, 241, 572, 279, 494, 279]} closed fill="#f0cd79" {...outline} />
    {night && <Ellipse x={533} y={279} radiusX={70} radiusY={100} fill="#ffd489" opacity={.16} listening={false} />}
  </Group>;
}

function WideKitchen({ night }: { night: boolean }) {
  const cabinet = "#475064";
  return <Group>
    <WideRoomBase wall="#c7763e" sideWall="#bd6b39" floor="#efe2cb" />
    <Group x={178} y={148}>
      <Rect width={170} height={300} cornerRadius={11} fill="#f1eadc" {...outline} />
      <Line points={[0, 155, 170, 155]} stroke={ink} strokeWidth={4} />
      <Line points={[137, 58, 137, 136]} stroke={ink} strokeWidth={9} lineCap="round" />
      <Line points={[137, 190, 137, 276]} stroke={ink} strokeWidth={9} lineCap="round" />
      {[{ x: 39, y: 55, c: "#93bfd0" }, { x: 72, y: 44, c: "#9071bd" }, { x: 63, y: 101, c: "#e2c14d" }].map(n => <Rect key={n.y} x={n.x} y={n.y} width={23} height={24} fill={n.c} {...outline} />)}
    </Group>
    <Window x={452} y={100} width={126} height={142} />
    <Rect x={432} y={88} width={34} height={168} fill="#263b36" {...outline} />
    <Rect x={566} y={88} width={34} height={168} fill="#263b36" {...outline} />
    <Line points={[420, 90, 610, 90]} stroke={ink} strokeWidth={7} lineCap="round" />
    {[330, 602].map(x => <Group key={x} x={x} y={60}>
      <Rect width={118} height={178} fill={cabinet} {...outline} />
      <Rect x={14} y={18} width={90} height={67} fill="#586174" {...outline} />
      <Rect x={14} y={103} width={90} height={58} fill="#586174" {...outline} />
      <Circle x={93} y={119} radius={5} fill="#d6d2c9" {...outline} />
    </Group>)}
    <Group x={704} y={74}>
      <Rect width={144} height={152} fill={cabinet} {...outline} />
      <Rect x={14} y={15} width={116} height={52} fill="#586174" {...outline} />
      <Rect x={14} y={83} width={52} height={55} fill="#586174" {...outline} />
      <Rect x={78} y={83} width={52} height={55} fill="#586174" {...outline} />
      <Circle x={71} y={112} radius={5} fill="#d6d2c9" {...outline} /><Circle x={118} y={112} radius={5} fill="#d6d2c9" {...outline} />
    </Group>
    <Rect x={338} y={302} width={435} height={118} fill={cabinet} {...outline} />
    {[355, 453, 551, 649].map(x => <Rect key={x} x={x} y={316} width={82} height={86} fill="#596275" {...outline} />)}
    <Rect x={320} y={286} width={470} height={20} fill="#f5f0e5" {...outline} />
    {[323, 379, 435, 491, 547, 603, 659, 715].map(x => <Rect key={x} x={x} y={240} width={57} height={48} fill="#a46445" stroke={ink} strokeWidth={2} />)}
    <Group x={486} y={253}><Line points={[0, 39, 0, 8, 23, 8, 23, 39]} stroke={ink} strokeWidth={5} /><Line points={[-26, 39, 49, 39]} stroke={ink} strokeWidth={5} /><Line points={[7, 9, 18, -15, 32, 8]} stroke={ink} strokeWidth={5} lineCap="round" /></Group>
    <Group x={776} y={256}>
      <Rect width={118} height={165} fill="#f6f2e9" {...outline} />
      <Rect x={18} y={50} width={83} height={83} fill="#121212" {...outline} />
      <Rect x={29} y={41} width={62} height={38} fill="#d85a1f" {...outline} />
      {[17, 44, 72, 98].map(x => <Circle key={x} x={x} y={18} radius={5} fill="#f7f0df" {...outline} />)}
    </Group>
    <Group x={866} y={126}>
      <Line points={[0, 88, 40, 0, 118, 0, 150, 88]} closed fill="#f8f3df" {...outline} />
      <Line points={[12, 75, 137, 75]} stroke="#151515" strokeWidth={8} />
    </Group>
    {night && <Rect width={960} height={540} fill="#15193a" opacity={.24} listening={false} />}
  </Group>;
}

export function BackgroundArt({ asset, object }: { asset: Asset; object: SceneObject }) {
  const scene = asset.thumbnail;
  const outdoor = ["park", "street", "blank-outdoor", "sidewalk", "alley", ...exteriorScenes].includes(scene);
  const time = sceneTime(object);
  const night = time === "night";
  const sky = night ? "#28374b" : time === "sunrise" ? "#f2c4b0" : time === "sunset" ? "#df9caa" : "#bce4ef";
  const wide = object.transform.width > object.transform.height;
  if (wide) {
    const scale = Math.max(object.transform.width / 960, object.transform.height / 540);
    return <SkyColor.Provider value={sky}>
      <Group clipX={0} clipY={0} clipWidth={object.transform.width} clipHeight={object.transform.height}>
        <Group x={(object.transform.width - 960 * scale) / 2} y={(object.transform.height - 540 * scale) / 2} scaleX={scale} scaleY={scale}>
          {scene === "bedroom" ? <WideBedroom night={night} /> : scene === "kitchen" ? <WideKitchen night={night} /> : <WideScenes scene={scene} night={night} sky={sky} time={time} />}
        </Group>
      </Group>
    </SkyColor.Provider>;
  }
  const scale = Math.max(object.transform.width / 540, object.transform.height / 960);
  return <SkyColor.Provider value={sky}><Group clipWidth={object.transform.width} clipHeight={object.transform.height}><Group x={(object.transform.width - 540 * scale) / 2} y={(object.transform.height - 960 * scale) / 2} scaleX={scale} scaleY={scale}>
    {outdoor ? <>
      <Rect width={540} height={960} fill={sky} />
      <Circle x={time === "sunrise" ? 90 : 432} y={time === "sunrise" || time === "sunset" ? 390 : 122} radius={39} fill={night ? "#f2efd1" : "#ffe092"} />
      {night && [35, 112, 193, 277, 341, 489].map((x, i) => <Circle key={x} x={x} y={55 + (i * 53) % 190} radius={2} fill="#f2f5ff" />)}
      {[80, 278].map((x, i) => <Group key={x} x={x} y={145 + i * 66} opacity={night ? .15 : .8}><Ellipse radiusX={50} radiusY={17} fill="#fff" /><Circle x={-16} y={-12} radius={21} fill="#fff" /><Circle x={13} y={-17} radius={26} fill="#fff" /></Group>)}
      <Line points={[0, 465, 90, 413, 205, 459, 349, 409, 540, 450, 540, 960, 0, 960]} closed fill="#a0c993" />
      <Rect y={533} width={540} height={427} fill="#80b47d" />
    </> : <Room wall={scene === "bedroom" ? "#e5deea" : scene === "kitchen" ? "#d8864f" : scene === "classroom" ? "#e8ecdc" : "#dfebec"} floor={scene === "bedroom" ? "#bbad9c" : scene === "kitchen" ? "#eadbc5" : "#b3c4c8"} tiles={scene === "hospital" || scene === "lab" || scene === "store" || scene === "kitchen"} />}

    {scene === "bedroom" && <>
      <Window x={54} y={185} width={170} height={196} />
      <Rect x={35} y={172} width={35} height={226} fill="#9a91bc" {...outline} /><Rect x={211} y={172} width={35} height={226} fill="#9a91bc" {...outline} />
      <Line points={[28, 166, 252, 166]} stroke={ink} strokeWidth={6} />
      <Rect x={354} y={270} width={146} height={328} cornerRadius={4} fill="#ae8872" {...outline} />
      <Rect x={363} y={280} width={60} height={298} fill="#cba88d" {...outline} /><Rect x={430} y={280} width={60} height={298} fill="#cba88d" {...outline} />
      <Circle x={413} y={430} radius={4} fill={ink} /><Circle x={441} y={430} radius={4} fill={ink} />
      <Ellipse x={238} y={717} radiusX={193} radiusY={59} fill="#c7b6d6" stroke="#a493b7" strokeWidth={4} />
      <Bed />
      <Rect x={372} y={554} width={98} height={87} fill="#b79179" {...outline} /><Rect x={378} y={560} width={86} height={33} fill="#dbb89b" {...outline} /><Circle x={421} y={578} radius={4} fill={ink} />
      <Line points={[420, 549, 420, 489]} stroke={ink} strokeWidth={5} /><Ellipse x={420} y={550} radiusX={22} radiusY={5} fill={ink} /><Line points={[393, 458, 447, 458, 459, 496, 381, 496]} closed fill="#f0cd79" {...outline} />
    </>}

    {scene === "kitchen" && <>
      <Rect x={44} y={243} width={145} height={380} cornerRadius={9} fill="#f1eadc" {...outline} />
      <Line points={[44, 431, 189, 431]} stroke={ink} strokeWidth={4} />
      <Line points={[160, 315, 160, 397]} stroke={ink} strokeWidth={9} lineCap="round" />
      <Line points={[160, 475, 160, 571]} stroke={ink} strokeWidth={9} lineCap="round" />
      {[{ x: 84, y: 304, c: "#8dbbd0" }, { x: 114, y: 293, c: "#9270bb" }, { x: 105, y: 358, c: "#e5c44e" }].map(n => <Rect key={n.y} x={n.x} y={n.y} width={25} height={27} fill={n.c} {...outline} />)}
      <Window x={238} y={175} width={132} height={158} />
      <Rect x={222} y={167} width={31} height={174} fill="#263b36" {...outline} /><Rect x={356} y={167} width={31} height={174} fill="#263b36" {...outline} />
      <Line points={[216, 168, 393, 168]} stroke={ink} strokeWidth={7} lineCap="round" />
      {[201, 389].map(x => <Group key={x} x={x} y={93}><Rect width={118} height={150} fill="#475064" {...outline} /><Rect x={14} y={17} width={90} height={55} fill="#586174" {...outline} /><Rect x={14} y={88} width={90} height={45} fill="#586174" {...outline} /><Circle x={92} y={104} radius={5} fill="#d6d2c9" {...outline} /></Group>)}
      <Rect x={192} y={498} width={328} height={123} fill="#475064" {...outline} />
      {[209, 300, 391].map(x => <Rect key={x} x={x} y={511} width={75} height={87} fill="#596275" {...outline} />)}
      <Rect x={178} y={481} width={357} height={20} fill="#f5f0e5" {...outline} />
      {[186, 236, 286, 336, 386, 436].map(x => <Rect key={x} x={x} y={430} width={51} height={50} fill="#a46445" stroke={ink} strokeWidth={2} />)}
      <Group x={286} y={437}><Line points={[0, 39, 0, 8, 23, 8, 23, 39]} stroke={ink} strokeWidth={5} /><Line points={[-24, 39, 49, 39]} stroke={ink} strokeWidth={5} /><Line points={[7, 9, 18, -15, 32, 8]} stroke={ink} strokeWidth={5} lineCap="round" /></Group>
      <Group x={397} y={362}><Line points={[0, 82, 32, 0, 102, 0, 128, 82]} closed fill="#f8f3df" {...outline} /><Line points={[12, 70, 116, 70]} stroke="#151515" strokeWidth={8} /></Group>
    </>}

    {scene === "office" && <>
      <Window x={40} y={178} width={214} height={220} />
      <Rect x={335} y={195} width={151} height={114} fill="#fff" {...outline} /><Text x={350} y={211} text="PROJECT" fontSize={15} fill={ink} /><Line points={[352, 281, 376, 260, 402, 269, 426, 239, 466, 228]} stroke="#4f9d95" strokeWidth={5} />
      <Rect x={376} y={417} width={125} height={181} fill="#849ca8" {...outline} />{[426, 482, 538].map(y => <Group key={y}><Rect x={383} y={y} width={110} height={48} fill="#c1d0d6" {...outline} /><Line points={[424, y + 14, 450, y + 14]} stroke={ink} strokeWidth={4} /></Group>)}
      <Desk x={37} y={519} width={305} />
      <Rect x={89} y={409} width={151} height={89} cornerRadius={5} fill="#42555f" {...outline} /><Rect x={98} y={418} width={133} height={70} fill="#a7d8e0" /><Line points={[163, 498, 163, 516, 137, 516, 188, 516]} stroke={ink} strokeWidth={5} /><Rect x={240} y={502} width={62} height={10} fill="#e8eff0" {...outline} />
      <Group x={156} y={565}><Rect width={82} height={75} cornerRadius={14} fill="#627a87" {...outline} /><Rect x={-8} y={74} width={98} height={16} cornerRadius={6} fill="#627a87" {...outline} /><Line points={[42, 91, 42, 123, 8, 137, 42, 123, 77, 137]} stroke={ink} strokeWidth={6} /><Circle x={8} y={138} radius={7} fill={ink} /><Circle x={77} y={138} radius={7} fill={ink} /></Group>
    </>}

    {scene === "hospital" && <>
      <Window x={35} y={175} width={167} height={199} />
      <Line points={[245, 147, 520, 147]} stroke={ink} strokeWidth={5} /><Rect x={452} y={155} width={71} height={418} fill="#91c8c3" {...outline} />{[464, 484, 504].map(x => <Line key={x} points={[x, 163, x, 565]} stroke="#609d99" strokeWidth={3} />)}
      <Rect x={274} y={287} width={113} height={82} cornerRadius={5} fill="#f7fbfa" {...outline} /><Rect x={282} y={295} width={97} height={61} fill="#304d54" /><Line points={[288, 327, 305, 327, 312, 314, 319, 343, 329, 310, 338, 327, 371, 327]} stroke="#8ce0b6" strokeWidth={3} /><Line points={[330, 370, 330, 404, 305, 404]} stroke={ink} strokeWidth={5} />
      <Bed hospital />
      <Line points={[410, 363, 410, 637, 386, 649, 410, 637, 438, 649]} stroke="#5a747f" strokeWidth={5} /><Line points={[398, 366, 425, 366, 425, 382]} stroke={ink} strokeWidth={4} /><Rect x={416} y={384} width={23} height={44} cornerRadius={5} fill="#edfafa" {...outline} /><Line points={[428, 429, 443, 478, 435, 534, 337, 543]} stroke="#769cac" strokeWidth={3} tension={.3} />
    </>}

    {scene === "classroom" && <>
      <Rect x={59} y={205} width={423} height={240} fill="#b58d68" {...outline} /><Rect x={69} y={215} width={403} height={220} fill="#356557" /><Text x={94} y={245} text="A B C     1 2 3" fontSize={32} fill="#eef6dc" /><Text x={95} y={304} text="2 + 3 = 5" fontSize={27} fill="#eef6dc" /><Line points={[347, 390, 390, 309, 430, 390, 347, 390]} stroke="#e8eec9" strokeWidth={3} /><Rect x={59} y={441} width={423} height={10} fill="#ccad89" {...outline} />
      <Circle x={430} y={126} radius={31} fill="#fff" {...outline} /><Line points={[430, 105, 430, 126, 446, 136]} stroke={ink} strokeWidth={3} />
      <Desk x={320} y={541} width={167} /><Rect x={343} y={522} width={62} height={15} fill="#ce7675" {...outline} />
      {[{ x: 34, y: 651 }, { x: 303, y: 692 }].map(({ x, y }) => <Group key={x}><Desk x={x} y={y} width={190} /><Rect x={x + 42} y={y - 12} width={75} height={10} fill="#f7faf5" {...outline} /><Rect x={x + 49} y={y + 79} width={83} height={48} cornerRadius={5} fill="#d4aa76" {...outline} /><Line points={[x + 56, y + 126, x + 56, y + 170, x + 56, y + 140, x + 127, y + 140, x + 127, y + 170]} stroke={ink} strokeWidth={5} /></Group>)}
    </>}

    {scene === "park" && <>
      <Line points={[235, 540, 302, 540, 362, 679, 540, 824, 540, 960, 357, 960, 238, 726, 197, 649]} closed fill="#dfd8bd" />
      <Tree x={75} y={341} /><Tree x={454} y={350} scale={.87} />
      <Bench />
      {[{ x: 40, y: 736 }, { x: 412, y: 752 }, { x: 140, y: 835 }].map(({ x, y }) => <Group key={x}><Line points={[x, y + 16, x, y - 6]} stroke="#467a54" strokeWidth={3} /><Circle x={x} y={y - 9} radius={7} fill="#ebaaa4" /><Circle x={x} y={y - 9} radius={3} fill="#ffe6a2" /></Group>)}
    </>}

    {scene === "lab" && <>
      <Rect x={39} y={197} width={463} height={170} fill="#c4d9df" {...outline} />{[48, 200, 352].map(x => <Group key={x}><Rect x={x} y={206} width={140} height={150} fill="#eaf3f2" {...outline} /><Line points={[x + 117, 270, x + 117, 294]} stroke={ink} strokeWidth={4} /></Group>)}
      <Rect x={40} y={510} width={460} height={114} fill="#a4bbc4" {...outline} />{[50, 198, 346].map(x => <Group key={x}><Rect x={x} y={523} width={140} height={90} fill="#d9e5e7" {...outline} /><Line points={[x + 51, 538, x + 86, 538]} stroke={ink} strokeWidth={4} /></Group>)}
      <Rect x={32} y={494} width={478} height={20} fill="#526b75" {...outline} />
      <Bottle x={74} y={434} color="#72bfb0" /><Bottle x={130} y={434} color="#ba8dc4" /><Bottle x={186} y={434} color="#eac168" />
      <Group x={328} y={393}><Line points={[25, 8, 54, 41, 57, 74, 23, 91]} stroke={ink} strokeWidth={17} tension={.4} /><Line points={[6, 8, 35, 39]} stroke="#cbdce2" strokeWidth={17} /><Line points={[6, 8, 35, 39]} stroke={ink} strokeWidth={3} /><Rect x={-2} y={66} width={49} height={7} fill={ink} /><Rect x={-8} y={91} width={84} height={10} cornerRadius={4} fill="#dce7e8" {...outline} /></Group>
      <Circle x={459} y={455} radius={21} fill="#b6e1ea" {...outline} /><Line points={[445, 471, 430, 490]} stroke={ink} strokeWidth={7} />
    </>}

    {scene === "store" && <>
      {[34, 286].map(x => <Group key={x} x={x} y={236}><Rect width={218} height={350} fill="#d2dfe0" {...outline} />{[20, 118, 216].map((y, row) => <Group key={y}>{[15, 62, 109, 156].map((left, i) => <Group key={left}><Rect x={left} y={y + 15} width={33} height={61} cornerRadius={4} fill={["#d78e7e", "#83b4b6", "#d9be6d"][(i + row) % 3]} {...outline} /><Rect x={left + 4} y={y + 37} width={25} height={17} fill="#f5f3e8" /></Group>)}<Rect y={y + 81} width={218} height={10} fill="#7b919b" {...outline} /></Group>)}</Group>)}
      <Rect x={155} y={634} width={350} height={132} fill="#76a9a4" {...outline} /><Rect x={142} y={619} width={376} height={19} fill="#edf2ee" {...outline} /><Rect x={354} y={562} width={96} height={53} fill="#475d66" {...outline} /><Rect x={363} y={570} width={77} height={29} fill="#b9dad8" />
    </>}

    {scene === "street" && <>
      {[{ x: -12, h: 300, c: "#91a9b8" }, { x: 166, h: 380, c: "#b9b6c9" }, { x: 357, h: 330, c: "#b3c9bf" }].map(({ x, h, c }) => <Group key={x} x={x} y={550 - h}><Rect width={177} height={h} fill={c} {...outline} />{[30, 99].map(left => [35, 108, 181].map(y => <Rect key={`${left}-${y}`} x={left} y={y} width={43} height={48} fill={night ? "#ead998" : "#d7eff2"} {...outline} />))}<Rect x={66} y={h - 74} width={51} height={74} fill="#5f7c87" {...outline} /></Group>)}
      <Rect y={550} width={540} height={108} fill="#d8dcda" /><Rect y={650} width={540} height={18} fill="#a6b5b9" {...outline} /><Rect y={668} width={540} height={292} fill="#68757f" /><Line points={[0, 816, 540, 816]} stroke="#f2e7b2" strokeWidth={9} dash={[68, 50]} />
      <Line points={[466, 621, 466, 365, 432, 365]} stroke={ink} strokeWidth={7} /><Rect x={412} y={360} width={45} height={22} cornerRadius={5} fill="#f1dda0" {...outline} />
    </>}
    <ExtraScenes scene={scene} night={night} sky={sky} />
    <ExteriorScenes scene={scene} night={night} />
  </Group></Group></SkyColor.Provider>;
}
