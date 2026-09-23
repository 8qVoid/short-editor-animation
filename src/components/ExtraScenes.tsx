import { Circle, Ellipse, Group, Line, Rect, Text } from "react-konva";

const edge = { stroke: "#303a40", strokeWidth: 3 };
export function ExtraScenes({ scene, night, sky }: { scene: string; night: boolean; sky: string }) {
  const glass = night ? "#f2d693" : "#a7dbe7";
  return <>
    {scene === "sidewalk" && <>
      <Rect y={430} width={540} height={530} fill="#8db68a" />
      {[25, 300].map(x => <Group key={x} x={x} y={255}><Rect width={205} height={246} fill={x === 25 ? "#d8acac" : "#b9c8dd"} {...edge} /><Line points={[-13, 0, 103, -82, 218, 0]} closed fill="#697a83" {...edge} />{[20, 124].map(left => <Group key={left}><Rect x={left} y={38} width={60} height={77} fill={glass} {...edge} /><Line points={[left + 30, 38, left + 30, 115]} stroke="#fff" strokeWidth={4} /></Group>)}<Rect x={77} y={148} width={53} height={98} fill="#658f88" {...edge} /><Circle x={119} y={201} radius={4} fill="#f5ddb2" /></Group>)}
      <Rect y={566} width={540} height={223} fill="#d6d9d4" />{[0, 135, 270, 405].map(x => <Line key={x} points={[x, 566, x - 50, 789]} stroke="#a5aeab" strokeWidth={2} />)}<Line points={[0, 672, 540, 672]} stroke="#a5aeab" strokeWidth={2} /><Rect y={789} width={540} height={18} fill="#9fabaf" {...edge} /><Rect y={807} width={540} height={153} fill="#69747b" />
      <Line points={[462, 603, 462, 306, 425, 306]} stroke="#39474c" strokeWidth={8} /><Rect x={407} y={305} width={47} height={20} fill={night ? "#ffe9a1" : "#eff3ed"} {...edge} />
      <Rect x={32} y={486} width={20} height={97} fill="#937152" {...edge} /><Circle x={42} y={434} radius={60} fill="#73a982" {...edge} /><Rect x={164} y={507} width={7} height={65} fill="#4d656e" /><Rect x={143} y={482} width={47} height={34} cornerRadius={6} fill="#628ba2" {...edge} />
    </>}
    {scene === "alley" && <>
      <Rect y={310} width={540} height={650} fill="#8a9499" /><Line points={[183, 511, 358, 511, 540, 960, 0, 960]} closed fill="#a7a9a5" />
      <Line points={[0, 86, 183, 310, 183, 590, 0, 822]} closed fill="#b18f86" {...edge} /><Line points={[540, 64, 358, 310, 358, 590, 540, 822]} closed fill="#87959e" {...edge} />
      {[225, 295, 365, 435, 505, 575, 645].map(y => <Line key={y} points={[0, y, 183, y * .56 + 260]} stroke="#836f6b" strokeWidth={2} />)}
      <Rect x={222} y={373} width={95} height={155} fill="#546770" {...edge} /><Rect x={239} y={398} width={60} height={50} fill={glass} {...edge} />
      <Line points={[34, 235, 34, 618, 60, 655]} stroke="#53626a" strokeWidth={12} /><Line points={[401, 216, 401, 574]} stroke="#495d68" strokeWidth={8} />
      <Group x={47} y={617}><Rect width={127} height={98} cornerRadius={5} fill="#587f73" {...edge} /><Rect x={-7} y={-10} width={141} height={19} fill="#3e6156" {...edge} /><Circle x={20} y={106} radius={9} fill="#303a40" /><Circle x={106} y={106} radius={9} fill="#303a40" /></Group>
      <Rect x={403} y={671} width={70} height={65} fill="#bfa07b" {...edge} /><Line points={[438, 671, 438, 736]} stroke="#8e765c" strokeWidth={5} /><Ellipse x={295} y={801} radiusX={62} radiusY={15} fill="#809ca7" />
      <Line points={[165, 276, 262, 306, 370, 276]} stroke="#39434a" strokeWidth={3} tension={.4} /><Rect x={246} y={303} width={34} height={16} fill="#f4d58e" {...edge} />
    </>}
    {scene === "restaurant" && <>
      <Rect y={418} width={540} height={159} fill="#75908c" />{[25, 140, 255, 370, 485].map(x => <Rect key={x} x={x} y={437} width={92} height={120} stroke="#536e6a" strokeWidth={2} />)}
      <Rect x={35} y={197} width={196} height={189} fill={sky} {...edge} /><Line points={[133, 197, 133, 386, 133, 290, 35, 290, 231, 290]} stroke="#f8eee2" strokeWidth={7} />
      <Rect x={305} y={243} width={159} height={139} fill="#375b53" stroke="#bd9273" strokeWidth={10} /><Text x={329} y={264} text="MENU" fontSize={22} fill="#f9f3db" />{[309, 331, 353].map(y => <Line key={y} points={[328, y, 439, y]} stroke="#d8e6cf" strokeWidth={3} />)}
      {[{ x: 63, y: 587 }, { x: 306, y: 699 }].map(({ x, y }) => <Group key={x} x={x} y={y}>
        <Ellipse x={89} y={144} radiusX={113} radiusY={20} fill="#303a40" opacity={.12} />
        {[-17, 159].map(left => <Group key={left}><Rect x={left} y={24} width={48} height={64} cornerRadius={7} fill="#bd747e" {...edge} /><Line points={[left + 6, 86, left + 6, 148, left + 6, 100, left + 43, 100, left + 43, 148]} stroke="#39434a" strokeWidth={5} /></Group>)}
        <Line points={[42, 24, 42, 128, 137, 128, 137, 24]} stroke="#66564c" strokeWidth={7} /><Ellipse x={90} y={23} radiusX={99} radiusY={27} fill="#faf4e5" {...edge} /><Ellipse x={53} y={20} radiusX={22} radiusY={9} stroke="#8facae" strokeWidth={2} /><Ellipse x={131} y={20} radiusX={22} radiusY={9} stroke="#8facae" strokeWidth={2} /><Rect x={83} y={-2} width={14} height={21} fill="#8ab6b2" {...edge} /><Line points={[90, 0, 90, -20]} stroke="#4c885e" strokeWidth={3} /><Circle x={90} y={-23} radius={8} fill="#dd9eac" />
      </Group>)}
      {[131, 384].map(x => <Group key={x}><Line points={[x, 0, x, 142]} stroke="#303a40" strokeWidth={3} /><Line points={[x - 20, 142, x + 20, 142, x + 37, 169, x - 37, 169]} closed fill="#d5ad68" {...edge} /></Group>)}
    </>}
    {scene === "gym" && <>
      <Rect x={30} y={222} width={478} height={266} fill="#9ebdc9" {...edge} />{[190, 350].map(x => <Line key={x} points={[x, 222, x, 488]} stroke="#e6eff0" strokeWidth={5} />)}<Line points={[49, 462, 201, 241, 240, 241, 88, 462]} closed fill="#d2e5e9" opacity={.5} />
      <Text x={185} y={145} text="FITNESS" fontSize={30} fontStyle="bold" fill="#487b78" />
      <Group x={42} y={442}><Line points={[5, 35, 5, 171, 185, 171, 185, 35]} stroke="#394c58" strokeWidth={9} />{[44, 99].map(y => <Group key={y}><Line points={[0, y + 22, 190, y + 22]} stroke="#6e858f" strokeWidth={9} />{[20, 76, 132].map(x => <Group key={x}><Line points={[x, y, x + 35, y]} stroke="#3e4d57" strokeWidth={6} /><Rect x={x} y={y - 14} width={10} height={28} fill="#425969" {...edge} /><Rect x={x + 26} y={y - 14} width={10} height={28} fill="#425969" {...edge} /></Group>)}</Group>)}</Group>
      <Group x={294} y={507}><Line points={[15, 163, 40, 30, 126, 30, 151, 163]} stroke="#4c626e" strokeWidth={8} /><Line points={[10, 53, 153, 53]} stroke="#343f49" strokeWidth={6} />{[18, 132].map(x => <Rect key={x} x={x} y={27} width={14} height={53} cornerRadius={3} fill="#52616c" {...edge} />)}<Rect x={38} y={116} width={90} height={17} cornerRadius={5} fill="#c6757a" {...edge} /><Line points={[51, 133, 51, 174, 115, 174, 115, 133]} stroke="#3d535d" strokeWidth={6} /></Group>
      <Line points={[56, 744, 242, 744, 284, 866, 71, 866]} closed fill="#75aaa5" {...edge} /><Circle x={415} y={809} radius={45} fill="#a997c4" {...edge} /><Line points={[393, 781, 378, 813, 394, 842]} stroke="#c8badd" strokeWidth={4} tension={.5} />
    </>}
  </>;
}
