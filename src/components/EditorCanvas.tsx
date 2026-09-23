import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import { assetById, assets } from "../data/assets";
import { useEditorStore } from "../store/editorStore";
import { AssetArt } from "./AssetArt";
import { SceneLighting } from "./SceneLighting";
import { Atmosphere } from "./Atmosphere";
import { cameraAt, objectAt } from "../animation";

export function EditorCanvas() {
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const sceneRef = useRef<Konva.Group>(null);
  const [stageSize, setStageSize] = useState({ width: 760, height: 760 });
  const [centerGuides, setCenterGuides] = useState({ vertical: false, horizontal: false });
  const playhead = useEditorStore(state => state.playhead);
  const {
    project,
    selectedIds,
    selectObject,
    updateObjectTransform,
    addAssetToActiveShot,
    stageScale: zoomScale,
    setStageView
  } = useEditorStore();
  const fitScale = Math.max(.01, Math.min((stageSize.width - 48) / project.canvas.width, (stageSize.height - 48) / project.canvas.height));
  const stageScale = fitScale * zoomScale / .36;
  const shot = project.shots.find((item) => item.id === project.activeShotId)!;
  const shotStart = project.shots.slice(0, project.shots.indexOf(shot)).reduce((sum, item) => sum + item.duration, 0);
  const tick = (Math.max(0, playhead - shotStart) + (shot.animationOffset ?? 0)) * 1000;
  const camera = cameraAt(shot, tick / 1000);
  const playing = useEditorStore(state => state.playing);
  const background = [...shot.objects].filter(object => object.kind === "background" && !object.hidden && object.transform.opacity > 0).sort((a, b) => b.layer - a.layer)[0];
  const snapToCenter = (node: Konva.Node, object: typeof shot.objects[number]) => {
    const snapDistance = 18;
    const width = object.transform.width * Math.abs(node.scaleX());
    const height = object.transform.height * Math.abs(node.scaleY());
    const centerX = node.x() + width / 2;
    const centerY = node.y() + height / 2;
    const vertical = Math.abs(centerX - project.canvas.width / 2) <= snapDistance;
    const horizontal = Math.abs(centerY - project.canvas.height / 2) <= snapDistance;
    if (vertical) node.x(project.canvas.width / 2 - width / 2);
    if (horizontal) node.y(project.canvas.height / 2 - height / 2);
    setCenterGuides({ vertical, horizontal });
  };
  const artboard = useMemo(
    () => ({
      x: Math.max(24, (stageSize.width - project.canvas.width * stageScale) / 2),
      y: Math.max(24, (stageSize.height - project.canvas.height * stageScale) / 2)
    }),
    [project.canvas.height, project.canvas.width, stageScale, stageSize.height, stageSize.width]
  );

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setStageSize({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;
    const nodes = playing ? [] : selectedIds.filter(id => !shot.objects.find(o => o.id === id)?.locked).map((id) => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, shot.objects, playing, playhead]);


  return (
    <main
      ref={wrapRef}
      className="canvas-wrap"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const assetId = event.dataTransfer.getData("asset/id");
        const asset = assets.find((item) => item.id === assetId);
        const stage = stageRef.current;
        if (!asset || !stage) return;
        stage.setPointersPositions(event.nativeEvent);
        const pointer = sceneRef.current?.getRelativePointerPosition();
        const x = pointer?.x;
        const y = pointer?.y;
        addAssetToActiveShot(asset, x, y);
      }}
    >
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onWheel={(event) => {
          event.evt.preventDefault();
          const scaleBy = 1.06;
          const newScale = event.evt.deltaY > 0 ? zoomScale / scaleBy : zoomScale * scaleBy;
          setStageView(Math.max(0.18, Math.min(0.75, newScale)), { x: 0, y: 0 });
        }}
        onMouseDown={(event) => {
          if (event.target === event.target.getStage()) selectObject(undefined);
        }}
      >
        <Layer>
          <Rect width={stageSize.width} height={stageSize.height} fill="#202326" />
          <Group x={artboard.x} y={artboard.y} scaleX={stageScale} scaleY={stageScale}>
            <Rect
              x={-18}
              y={-18}
              width={project.canvas.width + 36}
              height={project.canvas.height + 36}
              fill="#0f1113"
              opacity={0.45}
              cornerRadius={12}
              listening={false}
            />
            <Rect width={project.canvas.width} height={project.canvas.height} fill="#f5f0e3" stroke="#111" strokeWidth={4} />
            <Rect x={project.canvas.width * .05} y={project.canvas.height * .05} width={project.canvas.width * .9} height={project.canvas.height * .9} stroke="#e76650" strokeWidth={3} dash={[20, 16]} opacity={0.75} listening={false} />
            <Rect x={project.canvas.width / 2 - 1} y={0} width={2} height={project.canvas.height} fill="#58a6a6" opacity={0.35} listening={false} />
            <Rect x={0} y={project.canvas.height / 2 - 1} width={project.canvas.width} height={2} fill="#58a6a6" opacity={0.35} listening={false} />
            {centerGuides.vertical && (
              <Line points={[project.canvas.width / 2, 0, project.canvas.width / 2, project.canvas.height]} stroke="#22c7ff" strokeWidth={5} dash={[18, 14]} opacity={0.85} listening={false} />
            )}
            {centerGuides.horizontal && (
              <Line points={[0, project.canvas.height / 2, project.canvas.width, project.canvas.height / 2]} stroke="#22c7ff" strokeWidth={5} dash={[18, 14]} opacity={0.85} listening={false} />
            )}
            <Group clipWidth={project.canvas.width} clipHeight={project.canvas.height}>
            <Group ref={sceneRef} x={project.canvas.width / 2} y={project.canvas.height / 2} offsetX={project.canvas.width / 2 + camera.x} offsetY={project.canvas.height / 2 + camera.y} scaleX={camera.zoom} scaleY={camera.zoom} rotation={camera.rotation}>
            {[...shot.objects].map(o => objectAt(o, tick / 1000)).sort((a, b) => {
              if (a.kind === "background" && b.kind !== "background") return -1;
              if (a.kind !== "background" && b.kind === "background") return 1;
              return a.layer - b.layer;
            }).map((object) => {
              const asset = assetById(object.assetId);
              if (!asset || object.hidden) return null;
              const t = object.transform;
              return (
                <Group
                  key={object.id}
                  id={object.id}
                  x={t.x}
                  y={t.y}
                  width={t.width}
                  height={t.height}
                  scaleX={t.scaleX * (t.flipX ? -1 : 1)}
                  scaleY={t.scaleY * (t.flipY ? -1 : 1)}
                  rotation={t.rotation}
                  opacity={t.opacity}
                  draggable={!object.locked && !playing}
                  onClick={(event) => {
                    event.cancelBubble = true;
                    selectObject(object.id, event.evt.shiftKey);
                  }}
                  onTap={(event) => {
                    event.cancelBubble = true;
                    selectObject(object.id);
                  }}
                  onDragMove={(event) => snapToCenter(event.target, object)}
                  onDragEnd={(event) => {
                    snapToCenter(event.target, object);
                    setCenterGuides({ vertical: false, horizontal: false });
                    updateObjectTransform(object.id, { x: event.target.x(), y: event.target.y() });
                  }}
                  onTransformEnd={(event) => {
                    const node = event.target;
                    updateObjectTransform(object.id, {
                      x: node.x(),
                      y: node.y(),
                      rotation: node.rotation(),
                      scaleX: Math.abs(node.scaleX()),
                      scaleY: Math.abs(node.scaleY())
                    });
                  }}
                >
                  <AssetArt asset={asset} object={object} tick={tick} />
                </Group>
              );
            })}
            <SceneLighting object={background} width={project.canvas.width} height={project.canvas.height} />
            <Atmosphere object={background} width={project.canvas.width} height={project.canvas.height} tick={tick} />
            </Group>
            </Group>
            <Transformer
              ref={transformerRef}
              rotateEnabled
              ignoreStroke
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
            />
          </Group>
        </Layer>
      </Stage>
    </main>
  );
}
