const { chromium } = require('C:/Users/Mark/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'outputs', 'potion-showcase');
fs.mkdirSync(output, { recursive: true });

const transform = (x, y, width, height, extra = {}) => ({ x, y, width, height, scaleX: 1, scaleY: 1, rotation: 0, opacity: 1, flipX: false, flipY: false, ...extra });
let id = 0;
const next = label => `${label}-${++id}`;
const background = (assetId, extras = {}) => ({ id: next('background'), assetId, name: assetId, kind: 'background', transform: transform(0, 0, 1080, 1920), locked: true, hidden: false, layer: 0, ...extras });
const actor = (x, y, appearance, expression, action, extras = {}) => ({
  id: next('actor'), assetId: 'char-young-man', name: 'Alex', kind: 'character',
  transform: transform(x, y, 440, 730), locked: false, hidden: false, layer: 5,
  appearance, expression, action, pose: 'arms-down', mouth: 'auto', view: 'front', closet: [], ...extras
});
const prop = (assetId, x, y, width, height, layer = 6, extras = {}) => ({ id: next('prop'), assetId, name: assetId, kind: 'prop', transform: transform(x, y, width, height), locked: false, hidden: false, layer, ...extras });
const effect = (assetId, x, y, width, height, layer = 7, extras = {}) => ({ id: next('effect'), assetId, name: assetId, kind: 'effect', transform: transform(x, y, width, height), locked: false, hidden: false, layer, ...extras });
const title = (text, y, size = 88, extras = {}) => ({
  id: next('caption'), assetId: 'text-caption', name: text, kind: 'text',
  transform: transform(62, y, 956, 230), locked: false, hidden: false, layer: 20,
  text, fontFamily: 'Arial', fontSize: size, fontStyle: 'bold', textAlign: 'center', textColor: '#ffffff', outlineWidth: 9, ...extras
});
const key = (time, object, change = {}, action = object.action, expression = object.expression, easing = 'smooth') => ({
  time, easing, transform: { ...object.transform, ...change }, action, expression, pose: object.pose, mouth: object.mouth, view: object.view
});
const camera = (time, zoom, x = 0, y = 0, easing = 'smooth') => ({ time, easing, camera: { x, y, zoom, rotation: 0 } });
const shot = (name, duration, objects, transition = 'cut', transitionDuration = .4, cameraKeyframes) => ({
  id: next('shot'), name, duration, transition, transitionDuration, camera: { x: 0, y: 0, zoom: 1, rotation: 0 }, objects, ...(cameraKeyframes ? { cameraKeyframes } : {})
});

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1520, height: 1160 }, acceptDownloads: true, deviceScaleFactor: 1 });
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForSelector('.canvas-wrap canvas');

  const soundNames = ['Comedy Quirky Sneaky Music.mp3', 'Sound Effect TwinkleSparkle.mp3', 'Simple Whoosh.mp3', 'microwave-ding.mp3', 'pop.mp3', 'record_scratch.mp3', 'buzzer-or-wrong-answer-.mp3', 'cricket-sound.mp3', 'vine boom.mp3'];
  const durations = await page.evaluate(async names => {
    const decoded = await Promise.all(names.map(async name => {
      const audio = new Audio(`/sound-fx/${encodeURIComponent(name)}`);
      await new Promise((resolve, reject) => { audio.onloadedmetadata = resolve; audio.onerror = reject; });
      return [name, audio.duration];
    }));
    return Object.fromEntries(decoded);
  }, soundNames);

  const casual = { outfit: 'casual', hair: 'short', clothingColor: '#72a9ca' };
  const rich = { outfit: 'luxury', hair: 'short', clothingColor: '#353c52' };
  const broke = { outfit: 'worn', hair: 'short', clothingColor: '#889184' };
  const introActor = actor(315, 870, casual, 'thinking', 'walking', { view: 'three-quarter-right', pose: 'explaining' });
  introActor.keyframes = [key(0, introActor, { x: 190, opacity: 0 }), key(.6, introActor, { x: 315, opacity: 1 }, 'walking'), key(2.0, introActor, { x: 315 }, 'idle', 'happy')];
  const bottle = prop('prop-lab-bottle', 592, 1100, 200, 295);
  bottle.keyframes = [key(0, bottle, { y: 1340, opacity: 0 }), key(.8, bottle, { y: 1100, opacity: 1 }), key(1.6, bottle, { y: 1060, rotation: -12 }), key(2.1, bottle, { y: 1100, rotation: 0 })];
  const first = shot('01 - The discovery', 2.2, [background('bg-lab', { atmosphere: 'lights' }), introActor, bottle, effect('effect-glow', 500, 1010, 380, 400, 4), title('GET RICH IN\n5 SECONDS?', 175, 86)], 'zoom', .35, [camera(0, 1), camera(2.2, 1.12, 20, 70)]);

  const sipActor = actor(260, 850, casual, 'happy', 'talking', { pose: 'palms-up' });
  sipActor.keyframes = [key(0, sipActor), key(.65, sipActor, { rotation: -7 }, 'talking', 'happy'), key(1.3, sipActor, { rotation: 0 }, 'idle', 'shocked')];
  const sipBottle = prop('prop-lab-bottle', 580, 930, 220, 310);
  sipBottle.keyframes = [key(0, sipBottle), key(.55, sipBottle, { x: 500, y: 765, rotation: -30 }), key(1.3, sipBottle, { x: 580, y: 930, rotation: 0 })];
  const second = shot('02 - One sip', 1.4, [background('bg-lab', { atmosphere: 'lights' }), sipActor, sipBottle, effect('effect-glow', 470, 870, 400, 430, 4), title('ONE SIP.', 240, 116)], 'dip-black', .25, [camera(0, 1.16, 0, 70), camera(1.4, 1.42, 35, 115)]);

  const third = shot('03 - Five seconds later', .85, [background('bg-time-card'), title('5 SECONDS\nLATER...', 685, 98)], 'wipe', .3);

  const richActor = actor(320, 820, rich, 'happy', 'waving', { pose: 'palms-up', closet: ['glasses'] });
  richActor.keyframes = [key(0, richActor, { y: 900, scaleX: .84, scaleY: .84, opacity: 0 }), key(.42, richActor, { y: 820, scaleX: 1.05, scaleY: 1.05, opacity: 1 }, 'waving', 'happy'), key(1.9, richActor, { y: 820, scaleX: 1, scaleY: 1 }, 'idle', 'happy')];
  const moneyLeft = prop('prop-money', 90, 1290, 300, 220, 8);
  moneyLeft.keyframes = [key(0, moneyLeft, { y: 1500, opacity: 0 }), key(.7, moneyLeft, { y: 1290, opacity: 1 })];
  const moneyRight = prop('prop-money', 700, 1220, 280, 210, 8);
  moneyRight.keyframes = [key(0, moneyRight, { y: 1450, opacity: 0 }), key(.8, moneyRight, { y: 1220, opacity: 1 })];
  const fourth = shot('04 - It worked', 2.0, [background('bg-office', { atmosphere: 'lights' }), richActor, moneyLeft, moneyRight, effect('effect-burst', 340, 450, 420, 420, 2), title('IT WORKED?!', 210, 104)], 'slide', .35, [camera(0, 1.04), camera(2, 1.18, 0, 45)]);

  const phone = prop('prop-phone', 265, 700, 550, 760, 4);
  phone.screen = { mode: 'notification', brand: 'NOVA BANK', title: 'Payment alert', body: 'Potion plan: $999.99', accent: '#cc6252', graphValues: [24, 42, 34, 68, 54, 82] };
  phone.keyframes = [key(0, phone, { y: 1080, opacity: 0 }), key(.25, phone, { y: 700, opacity: 1 }), key(1.4, phone, { y: 700 })];
  const fifth = shot('05 - Bank alert', 1.5, [background('bg-office'), phone, title('BANK ALERT', 400, 104)], 'cut', .1, [camera(0, 1), camera(1.5, 1.12)]);

  const brokeActor = actor(305, 830, broke, 'sad', 'looking-down', { pose: 'arms-down' });
  brokeActor.keyframes = [key(0, brokeActor, { y: 810 }, 'idle', 'shocked'), key(.55, brokeActor, { y: 880, rotation: 5 }, 'looking-down', 'sad'), key(1.8, brokeActor, { y: 880, rotation: 5 }, 'idle', 'sad')];
  const sixth = shot('06 - The bill', 2.1, [background('bg-office', { timeOfDay: 'night', atmosphere: 'rain' }), brokeActor, title('BALANCE:\n-$999.99', 235, 98, { textColor: '#ffdd91' }), effect('effect-question', 680, 720, 220, 240)], 'crossfade', .3, [camera(0, 1.1), camera(2.1, 1.29, 0, 80)]);

  const finalActor = actor(300, 900, broke, 'sad', 'idle', { pose: 'arms-down' });
  const seventh = shot('07 - The punchline', 1.6, [background('bg-time-card'), finalActor, title('FREE TRIAL\nEXPIRED.', 310, 105), title('PART 2: CANCELING IT', 1450, 55, { textColor: '#b8e0c8' })], 'cut', .1, [camera(0, 1), camera(1.6, 1.08)]);

  const shots = [first, second, third, fourth, fifth, sixth, seventh];
  const total = shots.reduce((sum, item) => sum + item.duration, 0);
  const audio = (name, start, wanted, volume) => {
    const duration = Math.min(durations[name], wanted, total - start);
    return { id: next('audio'), name: name.replace('.mp3', ''), source: `/sound-fx/${encodeURIComponent(name)}`, sourceDuration: durations[name], start, trimStart: 0, duration, volume, muted: false };
  };
  const project = {
    id: next('project'), name: 'The Get Rich Potion', canvas: { width: 1080, height: 1920, fps: 30 },
    shots, activeShotId: first.id,
    audioClips: [
      audio('Comedy Quirky Sneaky Music.mp3', 0, total, .17),
      audio('Sound Effect TwinkleSparkle.mp3', .72, 1.3, .36),
      audio('Simple Whoosh.mp3', 2.2, .7, .5),
      audio('microwave-ding.mp3', 3.68, .6, .45),
      audio('pop.mp3', 4.52, .45, .55),
      audio('record_scratch.mp3', 6.65, 1.0, .65),
      audio('buzzer-or-wrong-answer-.mp3', 7.85, .7, .55),
      audio('cricket-sound.mp3', 9.45, 1.2, .3),
      audio('vine boom.mp3', 10.28, .8, .4)
    ].filter(clip => clip.duration > .05)
  };
  const projectPath = path.join(output, 'the-get-rich-potion.json');
  fs.writeFileSync(projectPath, JSON.stringify(project, null, 2));
  await page.locator('input[type="file"][accept="application/json"]').setInputFiles(projectPath);
  await page.getByText('The Get Rich Potion', { exact: true }).waitFor();
  const samples = [0.8, 2.7, 3.95, 5.2, 7.25, 8.7, 10.4];
  for (let i = 0; i < samples.length; i++) {
    const ruler = page.locator('.time-ruler');
    const bounds = await ruler.boundingBox();
    await page.mouse.click(bounds.x + samples[i] * 100, bounds.y + bounds.height / 2);
    await page.waitForTimeout(110);
    await page.locator('.canvas-wrap canvas').first().screenshot({ path: path.join(output, `editor-frame-${i + 1}.png`) });
  }
  await page.setViewportSize({ width: 1600, height: 2200 });
  await page.getByRole('button', { name: 'Go to start' }).click();
  await page.waitForTimeout(250);
  const downloadPromise = page.waitForEvent('download', { timeout: 45000 });
  await page.evaluate(async project => {
    const source = document.querySelector('.canvas-wrap canvas');
    const rendered = document.createElement('canvas');
    rendered.width = 720;
    rendered.height = 1280;
    const draw = rendered.getContext('2d', { alpha: false });
    const scale = Math.min((source.width - 48) / project.canvas.width, (source.height - 48) / project.canvas.height);
    const sourceX = Math.max(24, (source.width - project.canvas.width * scale) / 2);
    const sourceY = Math.max(24, (source.height - project.canvas.height * scale) / 2);
    let drawing = true;
    const drawFrame = () => {
      if (!drawing) return;
      draw.drawImage(source, sourceX, sourceY, project.canvas.width * scale, project.canvas.height * scale, 0, 0, rendered.width, rendered.height);
      requestAnimationFrame(drawFrame);
    };
    drawFrame();
    const context = new AudioContext();
    await context.resume();
    const destination = context.createMediaStreamDestination();
    const sourceNodes = await Promise.all(project.audioClips.map(async clip => {
      const response = await fetch(clip.source);
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      const node = context.createBufferSource();
      const gain = context.createGain();
      node.buffer = buffer;
      gain.gain.value = clip.volume;
      node.connect(gain);
      gain.connect(destination);
      return node;
    }));
    const stream = new MediaStream([...rendered.captureStream(30).getVideoTracks(), ...destination.stream.getAudioTracks()]);
    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(MediaRecorder.isTypeSupported);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3500000 });
    const chunks = [];
    const done = new Promise((resolve, reject) => {
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = event => reject(new Error(event.error?.message ?? 'Recording failed'));
      recorder.onstop = resolve;
    });
    recorder.start(250);
    const start = context.currentTime + .15;
    sourceNodes.forEach((node, i) => {
      const clip = project.audioClips[i];
      node.start(start + clip.start, clip.trimStart, clip.duration);
    });
    await new Promise(resolve => setTimeout(resolve, 150));
    document.querySelector('button[title="Play"]').click();
    await new Promise(resolve => setTimeout(resolve, Math.ceil(project.shots.reduce((sum, shot) => sum + shot.duration, 0) * 1000) + 250));
    recorder.stop();
    await done;
    drawing = false;
    stream.getTracks().forEach(track => track.stop());
    await context.close();
    const blob = new Blob(chunks, { type: mime });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'the-get-rich-potion.webm';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
  }, project);
  const download = await downloadPromise;
  const videoPath = path.join(output, 'the-get-rich-potion.webm');
  await download.saveAs(videoPath);
  const check = await browser.newPage();
  await check.goto(`file:///${videoPath.replaceAll('\\', '/')}`);
  const video = check.locator('video');
  await video.waitFor();
  const metadata = await video.evaluate(async element => {
    if (element.readyState < 1) await new Promise(resolve => element.addEventListener('loadedmetadata', resolve, { once: true }));
    element.currentTime = 5.1;
    await new Promise(resolve => element.addEventListener('seeked', resolve, { once: true }));
    return { duration: element.duration, width: element.videoWidth, height: element.videoHeight, readyState: element.readyState };
  });
  await video.screenshot({ path: path.join(output, 'video-check.png') });
  if (metadata.duration < total - .6 || metadata.width !== 720 || metadata.height !== 1280) throw new Error(`Bad video metadata: ${JSON.stringify(metadata)}`);
  if (errors.length) throw new Error(`Browser errors: ${errors.join(' | ')}`);
  console.log(JSON.stringify({ projectPath, videoPath, videoBytes: fs.statSync(videoPath).size, total, metadata, frames: samples.length }));
  await browser.close();
}

main().catch(error => { console.error(error); process.exit(1); });
