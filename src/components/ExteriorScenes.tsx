import { Circle, Ellipse, Group, Line, Rect, Text } from "react-konva";

const edge = { stroke: "#303a40", strokeWidth: 3 };
export const exteriorScenes = ["mall-exterior", "restaurant-exterior", "parking-lot"];

function Car({ x, y, color }: { x: number; y: number; color: string }) {
  return <Group x={x} y={y}>
    <Ellipse x={55} y={100} radiusX={62} radiusY={12} fill="#26353d" opacity={.2} />
    <Rect x={0} y={24} width={110} height={68} cornerRadius={16} fill={color} {...edge} />
    <Line points={[13, 35, 26, 0, 82, 0, 98, 35]} closed fill={color} {...edge} />
    <Line points={[23, 31, 32, 7, 76, 7, 87, 31]} closed fill="#b9dae3" {...edge} />
    <Rect x={9} y={91} width={18} height={12} cornerRadius={3} fill="#303a40" /><Rect x={83} y={91} width={18} height={12} cornerRadius={3} fill="#303a40" />
    <Rect x={10} y={51} width={21} height={12} cornerRadius={3} fill="#fff0b1" {...edge} /><Rect x={79} y={51} width={21} height={12} cornerRadius={3} fill="#fff0b1" {...edge} />
    <Rect x={37} y={73} width={36} height={11} fill="#edf0ea" /><Line points={[34, 55, 76, 55]} stroke="#303a40" strokeWidth={4} />
  </Group>;
}

function Planter({ x, y }: { x: number; y: number }) {
  return <Group x={x} y={y}><Circle x={25} y={-15} radius={30} fill="#659b77" {...edge} /><Circle x={2} y={-5} radius={19} fill="#79b28b" {...edge} /><Rect x={-5} y={9} width={61} height={37} cornerRadius={3} fill="#b89b8a" {...edge} /></Group>;
}

export function ExteriorScenes({ scene, night }: { scene: string; night: boolean }) {
  if (!exteriorScenes.includes(scene)) return null;
  const glass = night ? "#ead59b" : "#add4e1";
  return <>
    <Rect y={478} width={540} height={482} fill="#d0d6d2" />
    {scene === "mall-exterior" && <>
      <Rect x={18} y={255} width={504} height={305} fill="#d7dfe3" {...edge} />
      <Rect x={7} y={243} width={526} height={22} fill="#698792" {...edge} />
      <Rect x={165} y={218} width={210} height={344} fill="#8daeb8" {...edge} />
      <Rect x={181} y={248} width={178} height={66} cornerRadius={5} fill={night ? "#f0dba2" : "#f0f4ee"} {...edge} /><Text x={181} y={266} width={178} align="center" text="MALL" fontSize={30} fontStyle="bold" fill="#354e60" />
      {[36, 397].map(x => <Group key={x}><Rect x={x} y={310} width={107} height={195} fill={glass} {...edge} /><Line points={[x, 401, x + 107, 401]} stroke="#607c88" strokeWidth={5} /><Line points={[x + 53, 310, x + 53, 505]} stroke="#607c88" strokeWidth={5} /></Group>)}
      <Rect x={189} y={342} width={162} height={216} fill={glass} {...edge} /><Line points={[270, 342, 270, 558]} stroke="#536c77" strokeWidth={5} /><Line points={[257, 469, 257, 497, 283, 497, 283, 469]} stroke="#536c77" strokeWidth={4} />
      <Rect x={160} y={560} width={220} height={17} fill="#a7b6ba" {...edge} /><Rect x={145} y={577} width={250} height={15} fill="#bdc9cd" {...edge} />
      <Planter x={70} y={544} /><Planter x={420} y={544} />
      {[653, 742, 843].map(y => <Line key={y} points={[0, y, 540, y]} stroke="#a5b1b1" strokeWidth={2} />)}{[90, 270, 450].map(x => <Line key={x} points={[x, 592, x + (x - 270) * .5, 960]} stroke="#a5b1b1" strokeWidth={2} />)}
      <Group x={394} y={655}><Rect width={78} height={132} fill="#4c6977" {...edge} /><Text x={6} y={17} width={66} text={"MALL\n\nSHOPS\nFOOD\nCINEMA"} align="center" fontSize={13} fill="#f8f2d9" /><Line points={[8, 132, 3, 155, 70, 155, 65, 132]} stroke="#303a40" strokeWidth={4} /></Group>
    </>}
    {scene === "restaurant-exterior" && <>
      <Rect x={36} y={270} width={468} height={305} fill="#d9bbb2" {...edge} /><Rect x={26} y={258} width={488} height={20} fill="#7c6667" {...edge} />
      <Rect x={128} y={292} width={284} height={55} cornerRadius={5} fill={night ? "#f3d7a2" : "#f4e9d5"} {...edge} /><Text x={128} y={310} width={284} align="center" text="RESTAURANT" fontSize={24} fontStyle="bold" fill="#795158" />
      <Rect x={60} y={382} width={237} height={141} fill={glass} {...edge} /><Line points={[178, 382, 178, 523]} stroke="#795158" strokeWidth={5} /><Rect x={338} y={376} width={115} height={199} fill="#607e78" {...edge} /><Rect x={348} y={388} width={95} height={118} fill={glass} {...edge} /><Circle x={431} y={539} radius={4} fill="#ffe8b4" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <Line key={i} points={[50 + i * 32, 351, 82 + i * 32, 351, 90 + i * 32, 399, 58 + i * 32, 399]} closed fill={i % 2 ? "#f3eadd" : "#b96f7c"} {...edge} />)}
      <Planter x={43} y={555} /><Planter x={456} y={555} />
      <Group x={140} y={646}><Ellipse x={0} y={10} radiusX={65} radiusY={23} fill="#f3e7ce" {...edge} /><Line points={[0, 33, 0, 110, -35, 122, 0, 110, 35, 122]} stroke="#465a5f" strokeWidth={5} />{[-87, 59].map(x => <Group key={x}><Rect x={x} y={28} width={32} height={48} cornerRadius={4} fill="#9c7378" {...edge} /><Line points={[x + 3, 76, x + 3, 120, x + 3, 87, x + 30, 87, x + 30, 120]} stroke="#465a5f" strokeWidth={4} /></Group>)}</Group>
      <Group x={360} y={630}><Line points={[0, 0, -14, 128, 99, 128, 83, 0]} closed fill="#b39175" {...edge} /><Rect x={5} y={10} width={70} height={89} fill="#3f6458" /><Text x={7} y={24} width={66} text={"TODAY\n\nSOUP\nPASTA"} fontSize={13} align="center" fill="#f7ebd1" /></Group>
      <Rect y={830} width={540} height={17} fill="#a5b1b1" {...edge} /><Rect y={847} width={540} height={113} fill="#707b82" />
    </>}
    {scene === "parking-lot" && <>
      <Rect x={18} y={306} width={504} height={221} fill="#a8bcbf" {...edge} /><Rect x={8} y={299} width={524} height={18} fill="#647d86" {...edge} />
      {[40, 141, 348, 449].map(x => <Rect key={x} x={x} y={349} width={52} height={95} fill={glass} {...edge} />)}<Rect x={223} y={399} width={93} height={128} fill={glass} {...edge} /><Text x={177} y={344} width={187} text="SHOPPING CENTER" align="center" fontSize={16} fill="#334b55" />
      <Rect y={547} width={540} height={413} fill="#78848b" /><Rect y={527} width={540} height={19} fill="#b4c3c5" {...edge} />
      {[30, 183, 357, 510].map(x => <Line key={x} points={[x, 570, x + (x < 270 ? -19 : 19), 771]} stroke="#ecebdc" strokeWidth={4} />)}<Line points={[0, 771, 540, 771]} stroke="#ecebdc" strokeWidth={4} />
      <Car x={48} y={608} color="#bd7880" /><Car x={380} y={608} color="#83a4bd" />
      <Line points={[270, 900, 270, 827, 253, 849, 270, 827, 287, 849]} stroke="#efeacb" strokeWidth={7} lineCap="round" lineJoin="round" />
      <Rect x={185} y={718} width={169} height={14} cornerRadius={4} fill="#d7c888" {...edge} />
      <Line points={[47, 578, 47, 322, 86, 322]} stroke="#384f5c" strokeWidth={7} /><Rect x={65} y={315} width={47} height={14} fill={night ? "#ffe2a0" : "#dbe6e7"} {...edge} />
      <Line points={[497, 578, 497, 322, 458, 322]} stroke="#384f5c" strokeWidth={7} /><Rect x={436} y={315} width={47} height={14} fill={night ? "#ffe2a0" : "#dbe6e7"} {...edge} />
      <Rect x={255} y={509} width={7} height={72} fill="#485d65" /><Rect x={239} y={473} width={40} height={43} cornerRadius={4} fill="#527fa3" {...edge} /><Text x={240} y={478} width={38} text="P" align="center" fontSize={29} fill="#fff" />
    </>}
  </>;
}
