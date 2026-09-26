import { useEffect, useMemo, useRef, useState } from "react";
import { Group, Layer, Line, Rect, Stage, Transformer } from "react-konva";
import type Konva from "konva";
import { assetById, assets } from "../data/assets";
import { useEditorStore } from "../store/editorStore";
import { AssetArt } from "./AssetArt";
import { SceneLighting } from "./SceneLighting";
import { Atmosphere } from "./Atmosphere";
import { cameraAt, objectAt } from "../animation";
import { ScanLine, X } from "lucide-react";

export function EditorCanvas() {
  const wrapRef = useRef<HTMLElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const sceneRef = useRef<Konva.Group>(null);
  const [stageSize, setStageSize] = useState({ width: 760, height: 760 });
  const [centerGuides, setCenterGuides] = useState({ vertical: false, horizontal: false });
  const [showSafeArea, setShowSafeArea] = useState(false);
  const playhead = useEditorStore(state => state.playhead);
  const {
    project,
    selectedIds,
    selectObject,
    updateObjectTransform,
    deleteSelected,
    addAssetToActiveShot,
    stageScale: zoomScale,
    setStageView
  } = useEditorStore();
  const fitScale = Math.max(.01, Math.min((stageSize.width - 48) / project.canvas.width, (stageSize.height - 48) / project.canvas.height));
  const stageScale = fitScale * zoomScale / .36;
  const shot = project.shots.find((item) => item.id === project.activeShotId)!;
  const shotIndex = project.shots.indexOf(shot);
  const shotStart = project.shots.slice(0, project.shots.indexOf(shot)).reduce((sum, item) => sum + item.duration, 0);
  const tick = (Math.max(0, playhead - shotStart) + (shot.animationOffset ?? 0)) * 1000;
  const camera = cameraAt(shot, tick / 1000);
  const nextShot = project.shots[shotIndex + 1];
  const transitionKind = shot.transition ?? "cut";
  const fadeLength = Math.min(shot.transitionDuration ?? .5, shot.duration);
  const shotTime = Math.max(0, playhead - shotStart);
  const transitionProgress = transitionKind !== "cut" && nextShot
    ? Math.max(0, Math.min(1, (shotTime - (shot.duration - fadeLength)) / fadeLength))
    : 0;
  const incomingTime = (nextShot?.animationOffset ?? 0) + transitionProgress * fadeLength;
  const incomingCamera = nextShot ? cameraAt(nextShot, incomingTime) : undefined;
  const incomingBackground = nextShot && [...nextShot.objects].filter(object => object.kind === "background" && !object.hidden && object.transform.opacity > 0).sort((a, b) => b.layer - a.layer)[0];
  const playing = useEditorStore(state => state.playing);
  const background = [...shot.objects].filter(object => object.kind === "background" && !object.hidden && object.transform.opacity > 0).sort((a, b) => b.layer - a.layer)[0];
  const selectedSource = selectedIds.length === 1 ? shot.objects.find(object => object.id === selectedIds[0]) : undefined;
  const selectedObject = selectedSource ? objectAt(selectedSource, tick / 1000) : undefined;
  const selectedVisible = selectedObject && !selectedObject.hidden && (selectedObject.visibleFrom === undefined || tick / 1000 >= selectedObject.visibleFrom) && (selectedObject.visibleUntil === undefined || tick / 1000 < selectedObject.visibleUntil);
  const incomingOpacity = transitionKind === "crossfade" ? transitionProgress : transitionKind === "dip-black" ? Math.max(0, (transitionProgress - .42) / .58) : 1;
  const incomingSlideX = transitionKind === "slide" ? project.canvas.width * (1 - transitionProgress) : 0;
  const incomingZoom = transitionKind === "zoom" ? 1.14 - transitionProgress * .14 : 1;
  const incomingClipWidth = transitionKind === "wipe" ? project.canvas.width * transitionProgress : project.canvas.width;
  const blackOpacity = transitionKind === "dip-black" ? (transitionProgress < .5 ? transitionProgress * 2 : (1 - transitionProgress) * 2) : 0;
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
  const deletePosition = (() => {
    if (!selectedVisible || playing || !selectedObject) return undefined;
    const t = selectedObject.transform;
    const rotation = t.rotation * Math.PI / 180;
    const cameraRotation = camera.rotation * Math.PI / 180;
    const direction = t.scaleX * (t.flipX ? -1 : 1);
    const localX = t.x + Math.cos(rotation) * t.width * direction;
    const localY = t.y + Math.sin(rotation) * t.width * direction;
    const relativeX = localX - (project.canvas.width / 2 + camera.x);
    const relativeY = localY - (project.canvas.height / 2 + camera.y);
    const screenX = project.canvas.width / 2 + camera.zoom * (relativeX * Math.cos(cameraRotation) - relativeY * Math.sin(cameraRotation));
    const screenY = project.canvas.height / 2 + camera.zoom * (relativeX * Math.sin(cameraRotation) + relativeY * Math.cos(cameraRotation));
    return { left: artboard.x + screenX * stageScale - 16, top: artboard.y + screenY * stageScale - 16 };
  })();

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
        const asset = project.customAssets?.find(item => item.id === assetId) ?? assets.find((item) => item.id === assetId);
        const stage = stageRef.current;
        if (!asset || !stage) return;
        stage.setPointersPositions(event.nativeEvent);
        const pointer = sceneRef.current?.getRelativePointerPosition();
        const x = pointer?.x;
        const y = pointer?.y;
        addAssetToActiveShot(asset, x, y);
      }}
    >
      <button className={`canvas-guide-toggle ${showSafeArea ? "active" : ""}`} aria-label="Toggle caption safe area" aria-pressed={showSafeArea} title="Caption safe area" onClick={() => setShowSafeArea(value => !value)}><ScanLine size={16} /></button>
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
            {showSafeArea && <>
              <Rect x={project.canvas.width * .08} y={project.canvas.height * .08} width={project.canvas.width * .84} height={project.canvas.height * .76} stroke="#48a99a" strokeWidth={3} dash={[20, 16]} opacity={0.8} listening={false} />
              <Rect x={project.canvas.width / 2 - 1} y={0} width={2} height={project.canvas.height} fill="#58a6a6" opacity={0.28} listening={false} />
              <Rect x={0} y={project.canvas.height / 2 - 1} width={project.canvas.width} height={2} fill="#58a6a6" opacity={0.28} listening={false} />
            </>}
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
              const asset = project.customAssets?.find(candidate => candidate.id === object.assetId) ?? assetById(object.assetId);
              if (!asset || object.hidden || (object.visibleFrom !== undefined && tick / 1000 < object.visibleFrom) || (object.visibleUntil !== undefined && tick / 1000 >= object.visibleUntil)) return null;
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
                  <Rect width={t.width} height={t.height} fill="#000" opacity={0.001} />
                  <AssetArt asset={asset} object={object} tick={tick} preview={!playing && selectedIds.includes(object.id)} />
                </Group>
              );
            })}
            <SceneLighting object={background} width={project.canvas.width} height={project.canvas.height} />
            <Atmosphere object={background} width={project.canvas.width} height={project.canvas.height} tick={tick} />
            </Group>
            </Group>
            {nextShot && incomingCamera && transitionProgress > 0 && <Group listening={false} clipWidth={incomingClipWidth} clipHeight={project.canvas.height} x={transitionKind === "wipe" ? 0 : incomingSlideX} opacity={incomingOpacity}>
              <Group x={project.canvas.width / 2} y={project.canvas.height / 2} offsetX={project.canvas.width / 2} offsetY={project.canvas.height / 2} scaleX={incomingZoom} scaleY={incomingZoom}>
              <Group x={project.canvas.width / 2} y={project.canvas.height / 2} offsetX={project.canvas.width / 2 + incomingCamera.x} offsetY={project.canvas.height / 2 + incomingCamera.y} scaleX={incomingCamera.zoom} scaleY={incomingCamera.zoom} rotation={incomingCamera.rotation}>
                {[...nextShot.objects].map(item => objectAt(item, incomingTime)).sort((a, b) => a.kind === "background" ? -1 : b.kind === "background" ? 1 : a.layer - b.layer).map(item => {
                  const asset = project.customAssets?.find(candidate => candidate.id === item.assetId) ?? assetById(item.assetId);
                  if (!asset || item.hidden || (item.visibleFrom !== undefined && incomingTime < item.visibleFrom) || (item.visibleUntil !== undefined && incomingTime >= item.visibleUntil)) return null;
                  const transform = item.transform;
                  return <Group key={`incoming-${item.id}`} x={transform.x} y={transform.y} width={transform.width} height={transform.height} scaleX={transform.scaleX * (transform.flipX ? -1 : 1)} scaleY={transform.scaleY * (transform.flipY ? -1 : 1)} rotation={transform.rotation} opacity={transform.opacity}>
                    <AssetArt asset={asset} object={item} tick={incomingTime * 1000} />
                  </Group>;
                })}
                <SceneLighting object={incomingBackground} width={project.canvas.width} height={project.canvas.height} />
                <Atmosphere object={incomingBackground} width={project.canvas.width} height={project.canvas.height} tick={incomingTime * 1000} />
              </Group>
              </Group>
            </Group>}
            {blackOpacity > 0 && <Rect width={project.canvas.width} height={project.canvas.height} fill="#050505" opacity={blackOpacity} listening={false} />}
            <Transformer
              ref={transformerRef}
              rotateEnabled
              ignoreStroke
              boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
            />
          </Group>
        </Layer>
      </Stage>
      {deletePosition && selectedObject && <button className="canvas-delete-button" style={deletePosition} aria-label={`Delete ${selectedObject.name}`} title={`Delete ${selectedObject.name}`} onPointerDown={event => event.stopPropagation()} onClick={event => { event.stopPropagation(); deleteSelected(); }}><X size={17} /></button>}
    </main>
  );
}
