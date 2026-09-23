import { Circle, Group, Line, Ellipse } from "react-konva";
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
  </Group>;
}
