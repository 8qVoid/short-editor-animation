import { Circle, Ellipse, Group, Line, Rect } from "react-konva";
import type { Asset, CharacterAppearance, HairId, OutfitId, SceneObject } from "../types/editor";

const edge = { stroke: "#1f2328", strokeWidth: 7, lineJoin: "round" as const };
export const outfits: { id: OutfitId; name: string; color: string }[] = [
  { id: "casual", name: "Casual", color: "#7fa9d6" },
  { id: "business", name: "Business suit", color: "#465968" },
  { id: "luxury", name: "Luxury / rich", color: "#363242" },
  { id: "worn", name: "Worn / homeless", color: "#85816b" },
  { id: "dress", name: "Dress", color: "#bd638a" },
  { id: "lab", name: "Lab coat", color: "#e8eee8" },
  { id: "overalls", name: "Work overalls", color: "#467c92" }
];
export const hairstyles: { id: HairId; name: string }[] = [
  { id: "short", name: "Short" }, { id: "bob", name: "Bob" },
  { id: "long", name: "Long" }, { id: "ponytail", name: "Ponytail" },
  { id: "curly", name: "Curly" }, { id: "bun", name: "Bun" }, { id: "bald", name: "Bald" }
];

export function appearanceFor(asset: Asset, object: SceneObject): Required<CharacterAppearance> {
  const woman = asset.id === "char-young-woman";
  return {
    outfit: woman ? "dress" : asset.id === "char-business" ? "business" : asset.id === "char-scientist" ? "lab" : asset.id === "char-worker" ? "overalls" : "casual",
    hair: woman ? "long" : "short",
    hairColor: asset.accent ?? "#293446", clothingColor: asset.color ?? "#7fa9d6", skinColor: "#fbf4df",
    ...asset.appearance, ...object.appearance
  };
}

export function Hair({ style, color, back = false }: { style: HairId; color: string; back?: boolean }) {
  if (style === "bald") return null;
  if (back) return <Group>
    {(style === "long" || style === "bob") && <Rect x={-126} y={35} width={252} height={style === "long" ? 320 : 207} cornerRadius={[108, 108, 35, 35]} fill={color} {...edge} />}
    {style === "ponytail" && <><Ellipse x={-125} y={192} radiusX={43} radiusY={132} rotation={12} fill={color} {...edge} /><Circle x={-122} y={75} radius={15} fill="#dca461" {...edge} /></>}
    {style === "bun" && <Circle x={-68} y={24} radius={48} fill={color} {...edge} />}
  </Group>;
  if (style === "curly") return <Group>{[-94, - 50, 0, 50, 94].map((x, i) => <Circle key={x} x={x} y={i === 0 || i === 4 ?  70 :  40} radius={37} fill={color} {...edge} />)}</Group>;
  return <Group>
    <Line points={[-101,  80, - 60,  30, 0,  20,  60,  40, 100,  80]} stroke={color} strokeWidth={ 34} lineCap="round" tension={.4} />
    {style !== "short" && <Line points={[-99, 72, -72, 37, -22, 33, 35,  60, 94, 92]} stroke={color} strokeWidth={ 30} lineCap="round" tension={.4} />}
    {style === "short" && <Line points={[-73, 63, -25, 37, 28, 52]} stroke={color} strokeWidth={ 20} lineCap="round" />}
  </Group>;
}

export function Outfit({ outfit, color, seated = false }: { outfit: OutfitId; color: string; seated?: boolean }) {
  return <Group>
    {outfit === "dress" && <><Line points={[-72, 280, 72, 280, 68, 385, seated ? 117 : 139, seated ? 531 : 585, seated ? -100 : -139, seated ? 531 : 585, -68, 385]} closed fill={color} {...edge} /><Line points={[-68, 386, 68, 386]} stroke="#eee0c2" strokeWidth={13} /><Circle y={386} radius={9} fill="#d8b65e" {...edge} /></>}
    {(outfit === "business" || outfit === "luxury" || outfit === "lab") && <>
      <Line points={[-70, 269, 0, 390, 70, 269]} closed fill="#f8f6eb" {...edge} />
      <Line points={[-72, 270, -96, 335, -40, 366, -65, 398, 0, 463, 65, 398, 40, 366, 96, 335, 72, 270]} stroke={outfit === "luxury" ? "#d0ae5c" : "#263842"} strokeWidth={6} />
      {outfit !== "lab" && <Line points={[-12, 280, 12, 280, 7, 303,  20, 366, 0, 387, - 20, 366, -7, 303]} closed fill={outfit === "luxury" ? "#d6b65d" : "#ad5364"} {...edge} />}
      {[436, 480, 521].map(y => <Circle key={y} y={y} radius={5} fill={outfit === "luxury" ? "#d6b65d" : "#263842"} />)}
      <Rect x={46} y={414} width={39} height={39} stroke="#263842" strokeWidth={4} />
    </>}
    {outfit === "worn" && <><Rect x={- 70} y={416} width={53} height={ 60} rotation={-9} fill="#b29a7c" {...edge} /><Line points={[-63, 426, -28, 421, -24, 466]} stroke="#e1d4b2" strokeWidth={4} dash={[5, 5]} /><Line points={[36, 341,  70, 356,  40, 369]} stroke="#514f46" strokeWidth={5} /><Line points={[-52, 536, -31, 523, -8, 545,  19, 531,  40, 549]} stroke="#514f46" strokeWidth={5} /></>}
    {outfit === "overalls" && <><Line points={[-70, 263, -50, 385, 50, 385, 70, 263]} stroke="#2c5065" strokeWidth={ 20} /><Rect x={- 60} y={356} width={120} height={157} cornerRadius={9} fill="#38718a" {...edge} /><Rect x={-36} y={383} width={72} height={52} stroke="#b4ccd1" strokeWidth={4} /><Circle x={-45} y={373} radius={6} fill="#e3be5f" /><Circle x={45} y={373} radius={6} fill="#e3be5f" /></>}
    {outfit === "casual" && <Line points={[- 40, 268, 0, 285, 40, 268]} stroke="#fff" opacity={.6} strokeWidth={9} tension={.5} />}
  </Group>;
}
