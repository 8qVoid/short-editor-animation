const { chromium } = require('C:/Users/Mark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  fs.mkdirSync('outputs', { recursive: true });
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1660, height: 1000 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:5173/tests/characters.html');
    await page.waitForFunction(() => Object.keys(window.characterStages || {}).length === 54);
    const settle = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const select = async (key, value) => { await page.getByLabel(key, { exact: true }).selectOption(value); await settle(); };
    const time = async value => { await page.getByLabel('Time', { exact: true }).fill(String(value)); await settle(); };
    const pixels = view => page.evaluate(view => window.characterStages[`char-young-man-${view}`].toDataURL(), view);
    const bounds = async () => {
      const failures = await page.evaluate(() => Object.entries(window.characterStages).flatMap(([id, stage]) => {
        const rect = stage.getLayers()[0].getClientRect();
        const issues = [];
        if (rect.x < -1 || rect.y < -1 || rect.x + rect.width > stage.width() + 1 || rect.y + rect.height > stage.height() + 1) issues.push(`${id}: clipped artwork ${JSON.stringify(rect)}`);
        const head = stage.findOne('.head-skin');
        if (head) {
          const skin = head.getClientRect();
          for (const name of ['near-eye', 'far-eye', 'mouth']) {
            const part = stage.findOne(`.${name}`);
            if (!part) continue;
            const r = part.getClientRect(), x = r.x + r.width / 2, y = r.y + r.height / 2;
            if (x < skin.x || x > skin.x + skin.width || y < skin.y || y > skin.y + skin.height) issues.push(`${id}: detached ${name}`);
          }
          if (skin.height < 105 || skin.height > 160) issues.push(`${id}: unexpected head size ${skin.height}`);
        }
        return issues;
      }));
      assert.deepEqual(failures, []);
    };
    await settle();
    await bounds();
    for (const id of await page.locator('[data-asset]').evaluateAll(nodes => nodes.map(n => n.dataset.asset))) {
      await page.locator(`[data-asset="${id}"]`).screenshot({ path: `outputs/views-${id}.png` });
    }
    const mirrorErrors = await page.evaluate(() => {
      const results = [];
      for (const asset of document.querySelectorAll('[data-asset]')) {
        for (const prefix of ['side', 'three-quarter']) {
          const l = asset.querySelector(`[data-view="${prefix}-left"] canvas`);
          const r = asset.querySelector(`[data-view="${prefix}-right"] canvas`);
          const a = l.getContext('2d').getImageData(0, 0, l.width, l.height).data;
          const b = r.getContext('2d').getImageData(0, 0, r.width, r.height).data;
          let difference = 0;
          for (let y = 0; y < l.height; y++) for (let x = 0; x < l.width; x++) {
            const i = (y * l.width + x) * 4, j = (y * l.width + l.width - 1 - x) * 4;
            for (let channel = 0; channel < 4; channel++) difference += Math.abs(a[i + channel] - b[j + channel]);
          }
          results.push({ id: asset.dataset.asset, view: prefix, error: difference / a.length });
        }
      }
      return results;
    });
    assert.ok(mirrorErrors.every(r => r.error < 1), JSON.stringify(mirrorErrors));
    const views = ['front', 'three-quarter-left', 'three-quarter-right', 'side-left', 'side-right'];
    for (const action of ['walking', 'running', 'talking', 'waving']) {
      await select('action', action);
      await time(0);
      const before = await Promise.all(views.map(pixels));
      await time(140);
      for (let i = 0; i < views.length; i++) assert.notEqual(await pixels(views[i]), before[i], `${action} frozen in ${views[i]}`);
      await bounds();
      await page.locator('[data-asset="char-young-man"]').screenshot({ path: `outputs/action-${action}.png` });
    }
    for (const action of ['sitting', 'looking-up', 'looking-down', 'thinking', 'idle']) {
      await select('action', action);
      await bounds();
      await page.locator('[data-asset="char-young-man"]').screenshot({ path: `outputs/action-${action}.png` });
    }
    for (const pose of ['explaining', 'point-left', 'point-right', 'palms-up', 'hands-hips', 'arms-down']) { await select('pose', pose); await bounds(); }
    for (const hair of ['short', 'bob', 'long', 'ponytail', 'curly', 'bun', 'bald', '']) { await select('hair', hair); await bounds(); }
    for (const outfit of ['casual', 'business', 'luxury', 'worn', 'dress', 'lab', 'overalls', '']) { await select('outfit', outfit); await bounds(); }
    for (const expression of ['happy', 'sad', 'angry', 'shocked', 'thinking', 'neutral']) { await select('expression', expression); await bounds(); }
    for (const mouth of ['flat', 'smile', 'frown', 'open', 'wide-open', 'talk-small', 'talk-wide', 'smirk', 'auto']) { await select('mouth', mouth); await bounds(); }
    await page.getByLabel('Accessories', { exact: true }).check();
    await settle();
    await bounds();
    await page.locator('[data-asset="char-young-man"]').screenshot({ path: 'outputs/character-accessories.png' });
    for (const action of ['looking-up', 'looking-down', 'thinking', 'waving', 'idle']) { await select('action', action); await bounds(); }
    await select('action', 'walking');
    await page.getByLabel('Preview', { exact: true }).check();
    await settle();
    const previewBefore = await pixels('side-right');
    await page.waitForTimeout(160);
    assert.notEqual(await pixels('side-right'), previewBefore, 'Paused selection preview is frozen');
    assert.deepEqual(errors, []);
    console.log('Passed: 54 asset/view renders; mirrored pairs; attached facial features; wardrobe, pose, expression and mouth bounds; action motion and paused preview.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
