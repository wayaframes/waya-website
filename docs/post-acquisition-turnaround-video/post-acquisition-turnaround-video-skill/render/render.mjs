// Renders ../video.html to an MP4 with the Chrome already installed on this machine.
//   node render.mjs                 -> out/waya-experiment-program.mp4 (1920x1080, 30 fps, 60 s)
//   node render.mjs --stills 3,12   -> out/still-3.0.png, out/still-12.0.png (for review; 12.25 -> still-12.25.png)
//   node render.mjs --fps 30 --cap 0  (cap=0 renders without the voiceover captions)
//   node render.mjs --layout mobile --clip render/out/expert-vince.webm --crf 16 --out out/video-portrait-nocap.mp4   (the 1080x1920 cut)
import { launch } from './browser.mjs';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const FPS = parseInt(opt('fps', '30'), 10);
const CAP = opt('cap', '1');
const stills = opt('stills', null);
const LAYOUT = opt('layout', 'desktop');            // desktop (1920x1080) or mobile (1080x1920)
const [VW, VH] = LAYOUT === 'mobile' ? [1080, 1920] : [1920, 1080];
const outDir = resolve(here, 'out'); mkdirSync(outDir, { recursive: true });
const CRF = opt('crf', '18');                       // x264 quality; the portrait cut uses 16 to land near the site's other files (10-16 MB)
const CLIP = opt('clip', null);                     // e.g. render/out/expert-vince.webm where this browser cannot play H.264
const url = pathToFileURL(resolve(here, '../video.html')).href + `?autoplay=0&ui=0&cap=${CAP}&layout=${LAYOUT}` + (CLIP ? `&clip=${encodeURIComponent(CLIP)}` : '');

const browser = await launch(['--disable-gpu-vsync', '--font-render-hinting=none']);
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('page error:', e.message));
await page.goto(url, { waitUntil: 'load' });
await page.evaluate(() => window.__ready);
await page.waitForTimeout(300);
const DUR = await page.evaluate(() => window.__DUR);

if (stills) {
  for (const s of stills.split(',')) {
    const t = parseFloat(s);
    await page.evaluate(t => window.__seek(t), t);
    await page.waitForTimeout(60);
    const file = resolve(outDir, `still-${LAYOUT === 'mobile' ? 'm-' : ''}${Math.round(t * 100) % 10 ? t.toFixed(2) : t.toFixed(1)}.png`);   // 0.25 s steps keep two decimals
    await page.screenshot({ path: file, type: 'png' });
    console.log('wrote', file);
  }
  await browser.close();
  process.exit(0);
}

const total = Math.round(DUR * FPS);
const outFile = resolve(here, opt('out', 'out/video-nocap.mp4'));
const ff = spawn(ffmpegPath, ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', CRF, '-preset', 'medium', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  const t = f / FPS;
  await page.evaluate(t => window.__seek(t), t);
  const png = await page.screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % (FPS * 5) === 0) console.log(`frame ${f}/${total}  t=${t.toFixed(1)}s  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exit ' + c))));
await browser.close();
writeFileSync(resolve(outDir, 'render.log'), `rendered ${total} frames at ${FPS} fps in ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
console.log('wrote', outFile);
