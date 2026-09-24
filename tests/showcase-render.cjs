const { chromium } = require('C:/Users/Mark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

const output = path.resolve(__dirname, '..', 'outputs', 'potion-showcase');
const project = JSON.parse(fs.readFileSync(path.join(output, 'the-get-rich-potion.json'), 'utf8'));
const frames = path.join(output, 'frames');
fs.mkdirSync(frames, { recursive: true });
const fps = 20;
const total = project.shots.reduce((sum, shot) => sum + shot.duration, 0);
const count = Math.ceil(total * fps);

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 2200 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/tests/animation.html');
  await page.waitForSelector('.canvas-wrap canvas');
  await page.evaluate(value => window.editorStore.getState().loadProject(value), project);
  await page.waitForTimeout(200);
  for (let i = 0; i < count; i++) {
    const data = await page.evaluate(async time => {
      window.editorStore.getState().seek(time);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const source = document.querySelector('.canvas-wrap canvas');
      const width = 1080;
      const height = 1920;
      const scale = Math.min((source.width - 48) / width, (source.height - 48) / height);
      const x = Math.max(24, (source.width - width * scale) / 2);
      const y = Math.max(24, (source.height - height * scale) / 2);
      const output = document.createElement('canvas');
      output.width = 720;
      output.height = 1280;
      output.getContext('2d').drawImage(source, x, y, width * scale, height * scale, 0, 0, 720, 1280);
      return output.toDataURL('image/png');
    }, i / fps);
    fs.writeFileSync(path.join(frames, `frame-${String(i).padStart(4, '0')}.png`), Buffer.from(data.slice(data.indexOf(',') + 1), 'base64'));
    if (i % 50 === 0) console.log(`Rendered ${i + 1}/${count}`);
  }
  if (errors.length) throw new Error(errors.join(' | '));
  await browser.close();
  console.log(`Rendered ${count} frames at ${fps} FPS`);
}

main().catch(error => { console.error(error); process.exit(1); });
