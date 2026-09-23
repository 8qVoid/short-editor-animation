import { Ellipse, Group, Line, Rect } from "react-konva";
import type { SceneObject } from "../types/editor";

export function sceneTime(object: SceneObject) {
  return object.timeOfDay ?? (object.assetId === "bg-night" ? "night" : "day");
}

export function SceneLighting({ object, width, height }: { object?: SceneObject; width: number; height: number }) {
  if (!object) return null;
  const time = sceneTime(object);
  if (time === "day") return null;
  const night = time === "night";
  const dawn = time === "sunrise";
  // Wide scenes place their lamp pools with the fixtures in their own layout.
  if (width > height) return <Group listening={false} clipWidth={width} clipHeight={height}>
    <Rect width={width} height={height} fill={night ? "#15243e" : dawn ? "#f8c493" : "#bd6177"} opacity={night ? .32 : .19} />
    {!night && <Line points={dawn ? [0, height * .2, width * .18, height * .2, width * .75, height, width * .4, height] : [width, height * .2, width * .82, height * .2, width * .25, height, width * .6, height]} closed fill={dawn ? "#ffe7b5" : "#ffb56f"} opacity={.14} />}
  </Group>;
  const outdoor = ["bg-street", "bg-night", "bg-sidewalk", "bg-alley", "bg-park", "bg-blank-outdoor", "bg-mall-exterior", "bg-restaurant-exterior", "bg-parking-lot"].includes(object.assetId);
  const lamps = object.assetId === "bg-parking-lot" ? [88, 459] : object.assetId === "bg-restaurant" ? [131, 384] : object.assetId === "bg-alley" ? [263] : object.assetId === "bg-sidewalk" || object.assetId === "bg-street" || object.assetId === "bg-night" ? [435] : [];
  return <Group listening={false} scaleX={width / 540} scaleY={height / 960} clipX={0} clipY={0} clipWidth={540} clipHeight={960}>
    <Rect width={540} height={960} fill={night ? "#15243e" : dawn ? "#f8c493" : "#bd6177"} opacity={night ? (outdoor ? .48 : .32) : .19} />
    {!night && <Line points={dawn ? [0, 185, 180, 185, 540, 820, 310, 960] : [540, 185, 360, 185, 0, 820, 230, 960]} closed fill={dawn ? "#ffe7b5" : "#ffb56f"} opacity={.14} />}
    {night && lamps.map(x => <Group key={x}><Line points={[x - 12, outdoor ? 322 : 170, x + 12, outdoor ? 322 : 170, x + 100, 680, x - 100, 680]} closed fill="#ffe3a0" opacity={.12} /><Ellipse x={x} y={680} radiusX={99} radiusY={22} fill="#ffe5ac" opacity={.18} /></Group>)}
    {night && object.assetId === "bg-bedroom" && <Ellipse x={420} y={496} radiusX={85} radiusY={125} fill="#ffd489" opacity={.16} />}
  </Group>;
}
