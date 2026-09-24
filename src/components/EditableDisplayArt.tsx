import { useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Line, Rect, Text } from "react-konva";
import { defaultScreen } from "../data/screenContent";
import type { SceneObject, ScreenContent } from "../types/editor";

const ink = "#23343b";

function ScreenSurface({ screen, x, y, width, height, phone = false }: { screen: ScreenContent; x: number; y: number; width: number; height: number; phone?: boolean }) {
  const [image, setImage] = useState<HTMLImageElement>();
  useEffect(() => {
    if (!screen.imageData) { setImage(undefined); return; }
    let active = true;
    const loaded = new window.Image();
    loaded.onload = () => { if (active) setImage(loaded); };
    loaded.onerror = () => { if (active) setImage(undefined); };
    loaded.src = screen.imageData;
    return () => { active = false; };
  }, [screen.imageData]);

  const scale = Math.min(width / 300, height / (phone ? 490 : 300));
  const pad = Math.max(10, width * .07);
  const top = phone ? 32 * scale : 15 * scale;
  const headingSize = Math.max(12, 36 * scale);
  const bodySize = Math.max(9, 20 * scale);
  const brandSize = Math.max(9, 17 * scale);
  const accent = screen.accent || "#238b85";
  const values = screen.graphValues?.length >= 2 ? screen.graphValues : [24, 42, 34, 68, 54, 82];
  const chartTop = height * .43;
  const chartHeight = height * .37;
  const chartWidth = width - pad * 2;
  const max = Math.max(100, ...values);
  const chartPoints = values.flatMap((value, index) => [pad + chartWidth * index / (values.length - 1), chartTop + chartHeight * (1 - Math.max(0, value) / max)]);
  const imageRatio = image ? image.naturalWidth / image.naturalHeight : 1;
  const screenRatio = width / height;
  const crop = image && (imageRatio > screenRatio
    ? { x: (image.naturalWidth - image.naturalHeight * screenRatio) / 2, y: 0, width: image.naturalHeight * screenRatio, height: image.naturalHeight }
    : { x: 0, y: (image.naturalHeight - image.naturalWidth / screenRatio) / 2, width: image.naturalWidth, height: image.naturalWidth / screenRatio });

  return <Group x={x} y={y} clipX={0} clipY={0} clipWidth={width} clipHeight={height}>
    <Rect width={width} height={height} fill={screen.mode === "image" && image ? "#ffffff" : "#f7faf9"} />
    {screen.mode === "image" && image
      ? <KonvaImage image={image} crop={crop} width={width} height={height} listening={false} />
      : <>
        <Rect width={width} height={Math.max(5, 8 * scale)} fill={accent} />
        {screen.mode === "map" && <>
          <Rect y={height * .21} width={width} height={height * .79} fill="#e5f1e8" />
          <Rect x={width * .06} y={height * .28} width={width * .22} height={height * .17} fill="#b8d7c0" cornerRadius={7 * scale} />
          <Rect x={width * .72} y={height * .65} width={width * .24} height={height * .2} fill="#b8d7c0" cornerRadius={7 * scale} />
          <Line points={[0, height * .48, width * .32, height * .51, width * .65, height * .32, width, height * .36]} stroke="#ffffff" strokeWidth={24 * scale} lineCap="round" lineJoin="round" />
          <Line points={[width * .2, height, width * .35, height * .72, width * .61, height * .58, width * .66, height * .22]} stroke="#ffffff" strokeWidth={19 * scale} lineCap="round" lineJoin="round" />
          <Line points={[width * .28, height * .78, width * .43, height * .69, width * .59, height * .59, width * .69, height * .48]} stroke={accent} strokeWidth={6 * scale} dash={[8 * scale, 6 * scale]} lineCap="round" />
          <Circle x={width * .69} y={height * .46} radius={18 * scale} fill={accent} stroke="#ffffff" strokeWidth={4 * scale} />
          <Circle x={width * .69} y={height * .46} radius={5 * scale} fill="#ffffff" />
        </>}
        <Text x={pad} y={top} width={width - pad * 2} text={screen.brand || "YOUR BRAND"} fontFamily="Arial" fontStyle="bold" fontSize={brandSize} fill={accent} wrap="none" ellipsis />
        <Text x={pad} y={top + 31 * scale} width={width - pad * 2} height={height * .2} text={screen.mode === "notification" ? "Notifications" : screen.title || "Your title"} fontFamily="Arial" fontStyle="bold" fontSize={headingSize} lineHeight={1.05} fill={ink} ellipsis />
        {screen.mode === "chart" && <>
          {[0, 1, 2, 3].map(i => <Line key={i} points={[pad, chartTop + chartHeight * i / 3, width - pad, chartTop + chartHeight * i / 3]} stroke="#d5e1de" strokeWidth={2 * scale} />)}
          <Line points={chartPoints} stroke={accent} strokeWidth={7 * scale} lineCap="round" lineJoin="round" />
          {values.map((value, i) => <Circle key={i} x={chartPoints[i * 2]} y={chartPoints[i * 2 + 1]} radius={5 * scale} fill="#ffffff" stroke={accent} strokeWidth={3 * scale} />)}
          <Text x={pad} y={height * .84} width={width - pad * 2} text={screen.body} fontSize={bodySize} fill="#52636a" ellipsis />
        </>}
        {screen.mode === "notification" && <>
          <Rect x={pad} y={height * .34} width={width - pad * 2} height={height * .43} cornerRadius={12 * scale} fill="#ffffff" stroke="#d5e3e0" strokeWidth={2 * scale} shadowColor="#40545a" shadowBlur={10 * scale} shadowOpacity={.1} />
          <Rect x={pad + 14 * scale} y={height * .37} width={7 * scale} height={height * .33} fill={accent} cornerRadius={4 * scale} />
          <Text x={pad + 32 * scale} y={height * .39} width={width - pad * 2 - 45 * scale} text={screen.title} fontFamily="Arial" fontStyle="bold" fontSize={Math.max(10, 25 * scale)} fill={ink} wrap="word" ellipsis />
          <Text x={pad + 32 * scale} y={height * .52} width={width - pad * 2 - 45 * scale} height={height * .2} text={screen.body} fontFamily="Arial" fontSize={bodySize} lineHeight={1.2} fill="#53656b" ellipsis />
        </>}
        {screen.mode === "text" && <Text x={pad} y={height * .38} width={width - pad * 2} height={height * .43} text={screen.body} fontFamily="Arial" fontSize={Math.max(12, 28 * scale)} lineHeight={1.25} fill="#4e6065" ellipsis />}
        {screen.mode === "map" && <Rect x={pad} y={height * .85} width={width - pad * 2} height={height * .12} fill="#ffffff" cornerRadius={8 * scale} />}
        {screen.mode === "map" && <Text x={pad * 1.4} y={height * .87} width={width - pad * 2.8} text={screen.body || "Destination"} fontFamily="Arial" fontStyle="bold" fontSize={bodySize} fill={ink} ellipsis />}
      </>}
    {phone && <>
      <Text x={pad} y={8 * scale} text="9:41" fontFamily="Arial" fontStyle="bold" fontSize={13 * scale} fill={ink} />
      <Rect x={width - 38 * scale} y={12 * scale} width={23 * scale} height={9 * scale} stroke={ink} strokeWidth={2 * scale} cornerRadius={2 * scale} />
      <Rect x={width - 35 * scale} y={15 * scale} width={16 * scale} height={3 * scale} fill={ink} />
    </>}
  </Group>;
}

export function EditableDisplayArt({ object }: { object: SceneObject }) {
  const w = object.transform.width;
  const h = object.transform.height;
  const screen = { ...defaultScreen(object.assetId)!, ...object.screen };
  if (object.assetId === "prop-phone") {
    const x = w * .095, y = h * .015, bodyW = w * .81, bodyH = h * .97;
    const inset = Math.min(bodyW, bodyH) * .055;
    return <Group>
      <Rect x={x - 5} y={h * .22} width={7} height={h * .1} fill="#65737b" cornerRadius={3} />
      <Rect x={x + bodyW - 2} y={h * .29} width={7} height={h * .12} fill="#65737b" cornerRadius={3} />
      <Rect x={x} y={y} width={bodyW} height={bodyH} fill="#263238" stroke="#111b20" strokeWidth={Math.max(5, w * .018)} cornerRadius={Math.min(bodyW, bodyH) * .105} />
      <Rect x={x + inset} y={y + inset} width={bodyW - inset * 2} height={bodyH - inset * 2} fill="#f7faf9" cornerRadius={Math.min(bodyW, bodyH) * .075} />
      <ScreenSurface screen={screen} x={x + inset} y={y + inset} width={bodyW - inset * 2} height={bodyH - inset * 2} phone />
      <Rect x={w * .41} y={y + 5} width={w * .18} height={h * .025} fill="#263238" cornerRadius={h * .01} />
      <Circle x={w * .63} y={y + h * .017} radius={h * .005} fill="#576e75" />
      <Rect x={w * .4} y={h * .945} width={w * .2} height={h * .008} fill="#263238" cornerRadius={4} />
    </Group>;
  }
  if (object.assetId === "prop-laptop") {
    const inset = Math.min(w, h) * .06;
    return <Group>
      <Rect x={w * .08} y={h * .04} width={w * .84} height={h * .78} fill="#2c3941" stroke="#1f292e" strokeWidth={Math.max(4, w * .012)} cornerRadius={w * .018} />
      <ScreenSurface screen={screen} x={w * .08 + inset} y={h * .04 + inset} width={w * .84 - inset * 2} height={h * .78 - inset * 1.6} />
      <Circle x={w * .5} y={h * .065} radius={Math.max(2, w * .005)} fill="#718a91" />
      <Line points={[w * .03, h * .85, w * .97, h * .85, w * .9, h * .94, w * .1, h * .94]} closed fill="#7e9098" stroke="#26343b" strokeWidth={Math.max(4, w * .012)} lineJoin="round" />
      <Line points={[w * .44, h * .88, w * .56, h * .88]} stroke="#42535b" strokeWidth={Math.max(3, w * .008)} lineCap="round" />
    </Group>;
  }
  return <Group>
    <Rect x={w * .04} y={h * .05} width={w * .92} height={h * .83} fill="#24343a" stroke="#15242a" strokeWidth={Math.max(5, w * .014)} cornerRadius={Math.min(w, h) * .035} />
    <ScreenSurface screen={screen} x={w * .065} y={h * .08} width={w * .87} height={h * .77} />
    <Rect x={w * .41} y={h * .88} width={w * .18} height={h * .055} fill="#506168" />
    <Rect x={w * .32} y={h * .94} width={w * .36} height={h * .025} fill="#354950" cornerRadius={4} />
  </Group>;
}
