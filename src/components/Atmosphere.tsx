import { Circle, Group, Line, Ellipse, Rect } from "react-konva";
import type { SceneObject } from "../types/editor";

export function Atmosphere({ object, width, height, tick }: { object?: SceneObject; width: number; height: number; tick: number }) {
  const mode = object?.atmosphere ?? "none";
  if (mode === "none") return null;
  return <Group listening={false} clipWidth={width} clipHeight={height}>
    {mode === "dust" && Array.from({length:18},(_,i)=><Circle key={i} x={(i*173+tick*.009)%width} y={(i*257+tick*.016)%height} radius={3+i%4} fill="#fff2bf" opacity={.15+(i%4)*.07}/>)}
    {mode === "rain" && Array.from({length:55},(_,i)=>{
      const x=(i*197-tick*.14%width+width)%width,y=(i*331+tick*.55)%height;
      return <Line key={i} points={[x,y,x-12,y+38]} stroke="#c9ebff" strokeWidth={3} opacity={.3}/>;
    })}
    {mode === "breeze" && <>
      {[0,1,2].map(i=><Group key={i} x={((tick*.018+i*width*.43)%(width+280))-140} y={height*(.07+i*.045)} opacity={.24}><Ellipse radiusX={100} radiusY={24} fill="white"/><Ellipse x={-25} y={-17} radiusX={43} radiusY={29} fill="white"/></Group>)}
      {[0,1,2,3].map(i=><Ellipse key={i} x={(i*241+tick*.06)%width} y={height*.65+Math.sin(tick*.002+i)*50+i*55} radiusX={10} radiusY={4} rotation={tick*.035+i*60} fill="#709b57" opacity={.7}/>)}
    </>}
    {mode === "clouds" && [0, 1, 2].map(i => <Group key={i} x={((tick * .012 + i * width * .48) % (width + 260)) - 130} y={height * (.12 + i * .085)} opacity={.58}>
      <Ellipse radiusX={74} radiusY={22} fill="#fffdf5" /><Ellipse x={-30} y={-12} radiusX={37} radiusY={28} fill="#fffdf5" /><Ellipse x={24} y={-16} radiusX={43} radiusY={32} fill="#fffdf5" />
    </Group>)}
    {mode === "traffic" && [0, 1].map(i => {
      const carWidth = Math.max(72, width * .16);
      const x = ((tick * .08 + i * width * .58) % (width + carWidth * 2)) - carWidth;
      const y = height * (.79 + i * .045);
      return <Group key={i} x={x} y={y}>
        <Rect x={-carWidth / 2} y={-22} width={carWidth} height={24} cornerRadius={7} fill={i ? "#d28a61" : "#668d9b"} stroke="#26343a" strokeWidth={3} />
        <Line points={[-carWidth * .25, -22, -carWidth * .12, -34, carWidth * .2, -34, carWidth * .34, -22]} closed fill="#b8d9df" stroke="#26343a" strokeWidth={3} />
        <Circle x={-carWidth * .25} y={2} radius={7} fill="#283137" /><Circle x={carWidth * .25} y={2} radius={7} fill="#283137" />
      </Group>;
    })}
    {mode === "lights" && Array.from({ length: 12 }, (_, i) => <Rect key={i} x={width * (.12 + (i % 4) * .22)} y={height * (.28 + Math.floor(i / 4) * .14)} width={width * .045} height={height * .035} fill="#ffe5a0" opacity={.32 + (Math.sin(tick * .002 + i * 2.1) + 1) * .16} />)}
  </Group>;
}
