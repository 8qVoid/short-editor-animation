const { chromium } = require('C:/Users/Mark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/tests/animation.html');
  await page.waitForSelector('.asset-grid');
  await page.getByRole('button', { name: 'Props', exact: true }).click();
  await page.locator('.asset-card').filter({ hasText: 'Phone' }).click();
  await page.getByLabel('Display brand').fill('NOVA BANK');
  await page.getByLabel('Display heading').fill('Payment alert');
  await page.getByLabel('Display message').fill('Subscription charge: $999.99');
  const phone = await page.evaluate(() => {
    const state = window.editorStore.getState();
    return state.project.shots[0].objects.find(object => object.assetId === 'prop-phone');
  });
  assert.equal(phone.screen.brand, 'NOVA BANK');
  assert.equal(phone.screen.body, 'Subscription charge: $999.99');
  await page.screenshot({ path: 'outputs/phone-notification-desktop.png' });
  await page.getByLabel('Display layout').selectOption('chart');
  await page.getByLabel('Display graph values').fill('12, 18, 36, 63, 95');
  await page.getByLabel('Display graph values').blur();
  assert.deepEqual(await page.evaluate(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-phone').screen.graphValues), [12, 18, 36, 63, 95]);
  await page.screenshot({ path: 'outputs/phone-chart-desktop.png' });
  await page.getByLabel('Display layout').selectOption('map');
  await page.getByLabel('Display message').fill('NOVA BANK BRANCH');
  await page.screenshot({ path: 'outputs/phone-map-desktop.png' });

  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 300;
    const context = canvas.getContext('2d');
    context.fillStyle = '#e87358'; context.fillRect(0, 0, 200, 300);
    context.fillStyle = '#2b6e71'; context.fillRect(25, 25, 150, 250);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.locator('.screen-image-actions input[type=file]').setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: Buffer.from(png, 'base64') });
  await page.waitForFunction(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-phone').screen.mode === 'image');
  assert.ok((await page.evaluate(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-phone').screen.imageData)).startsWith('data:image/'));
  await page.screenshot({ path: 'outputs/phone-image-desktop.png' });
  const saved = await page.evaluate(() => structuredClone(window.editorStore.getState().project));
  await page.evaluate(project => window.editorStore.getState().loadProject(project), saved);
  assert.equal(await page.evaluate(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-phone').screen.brand), 'NOVA BANK');

  await page.getByRole('button', { name: 'Props', exact: true }).click();
  await page.locator('.asset-card').filter({ hasText: 'Brand Sign' }).click();
  await page.getByLabel('Display brand').fill('NOVA BANK');
  await page.getByLabel('Display heading').fill('Open today');
  await page.screenshot({ path: 'outputs/brand-sign-desktop.png' });
  assert.equal(await page.evaluate(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-brand-sign').screen.title), 'Open today');

  await page.locator('.asset-card').filter({ hasText: 'Laptop' }).click();
  await page.getByLabel('Display layout').selectOption('chart');
  assert.equal(await page.evaluate(() => window.editorStore.getState().project.shots[0].objects.find(object => object.assetId === 'prop-laptop').screen.mode), 'chart');
  const legacy = await page.evaluate(() => {
    const saved = structuredClone(window.editorStore.getState().project);
    delete saved.shots[0].objects.find(object => object.assetId === 'prop-phone').screen;
    window.editorStore.getState().loadProject(saved);
    window.editorStore.getState().selectObject(saved.shots[0].objects.find(object => object.assetId === 'prop-phone').id);
    return saved;
  });
  assert.ok(legacy.shots[0].objects.some(object => object.assetId === 'prop-phone' && !object.screen));
  assert.equal(await page.getByLabel('Display layout').inputValue(), 'notification');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.screenshot({ path: 'outputs/phone-display-mobile.png' });
  assert.equal(errors.length, 0, errors.join(' | '));
  await browser.close();
  console.log('Display checks passed: phone layouts, editable content, image import, project round-trip, brand sign, and mobile panel.');
})().catch(error => { console.error(error); process.exit(1); });
