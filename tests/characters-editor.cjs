const { chromium } = require('C:/Users/Mark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/tests/animation.html');
    await page.waitForSelector('.canvas-wrap canvas');
    const actorId = await page.evaluate(() => {
      const s = window.editorStore;
      const p = structuredClone(s.getState().project);
      const shot = p.shots[0];
      const actor = shot.objects.find(o => o.kind === 'character');
      actor.assetId = 'char-young-man'; actor.view = 'front'; actor.action = 'idle'; actor.pose = 'arms-down';
      actor.appearance = undefined; actor.closet = []; actor.keyframes = [];
      actor.transform = { x: 340, y: 650, width: 380, height: 690, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false };
      actor.locked = false; actor.hidden = false;
      shot.objects = shot.objects.filter(o => o.id === actor.id || o.kind === 'background');
      shot.camera = { x: 0, y: 0, zoom: 1, rotation: 0 }; shot.cameraKeyframes = [];
      p.shots = [shot]; p.activeShotId = shot.id;
      s.getState().loadProject(p); s.getState().selectObject(actor.id);
      return actor.id;
    });
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const transform = () => page.evaluate(id => window.editorStore.getState().project.shots[0].objects.find(o => o.id === id).transform, actorId);
    const original = await transform();
    for (const label of ['3/4 Left', '3/4 Right', 'Side Left', 'Side Right', 'Seated Side', 'Front', 'Side Right']) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await settle();
      assert.deepEqual(await transform(), original, `View ${label} changed object dimensions or position`);
    }
    const canvasPoint = selector => page.evaluate(({ id, selector }) => {
      const stage = window.editorKonva.stages.find(s => s.container().closest('.canvas-wrap'));
      const node = selector === 'anchor' ? stage.findOne('Transformer').findOne('.bottom-right') : stage.findOne('#' + id).findOne(selector);
      const r = node.getClientRect(), container = stage.container().getBoundingClientRect();
      return { x: container.x + r.x + r.width / 2, y: container.y + r.y + r.height / 2 };
    }, { id: actorId, selector });
    const torso = await canvasPoint('.torso');
    await page.mouse.move(torso.x, torso.y); await page.mouse.down();
    await page.mouse.move(torso.x + 40, torso.y - 25, { steps: 8 }); await page.mouse.up(); await settle();
    const moved = await transform();
    assert.ok(moved.x !== original.x && moved.y !== original.y, 'Dragging did not update position');
    assert.equal(moved.width, original.width); assert.equal(moved.height, original.height);
    const handle = await canvasPoint('anchor');
    await page.mouse.move(handle.x, handle.y); await page.mouse.down();
    await page.mouse.move(handle.x + 20, handle.y + 28, { steps: 8 }); await page.mouse.up(); await settle();
    const resized = await transform();
    assert.ok(resized.scaleX > moved.scaleX && resized.scaleY > moved.scaleY, 'Resize did not update scale');
    await page.screenshot({ path: 'outputs/character-editor-desktop.png' });
    await page.setViewportSize({ width: 390, height: 844 }); await settle();
    await page.screenshot({ path: 'outputs/character-editor-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('Passed: editor view buttons preserve transforms, canvas selection/dragging/resizing, desktop/mobile renders.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
