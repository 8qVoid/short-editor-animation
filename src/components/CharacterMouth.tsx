import { Ellipse, Line } from "react-konva";

const stroke = "#1f2328";

function mouthFromExpression(expression = "neutral") {
  if (expression === "happy") return "smile";
  if (expression === "sad") return "frown";
  if (expression === "angry") return "flat";
  if (expression === "shocked") return "wide-open";
  if (expression === "thinking") return "smirk";
  return "talk-small";
}

export function MouthShape({ mouth, expression }: { mouth?: string; expression?: string }) {
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
