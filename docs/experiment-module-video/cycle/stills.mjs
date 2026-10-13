// Stills of the cycle module, for review.
//   node stills.mjs                      -> out/still-<t>.png, one per beat plus a few mid-chapter frames
//   node stills.mjs --times 1.5,6,12     -> only those times
//   node stills.mjs --box                -> crop each still to the 780x880 box
// Before launching it copies the fragment in cycle-markup.html into preview.html (between the
// cycle-markup markers), so the fragment stays the one source of truth.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../render/package.json'));
const { chromium } = require('playwright-core');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const BOX = args.includes('--box');
const outDir = resolve(here, 'out'); mkdirSync(outDir, { recursive: true });

// sync the fragment into the preview
const fragment = readFileSync(resolve(here, 'cycle-markup.html'), 'utf8');
const previewPath = resolve(here, 'preview.html');
const preview = readFileSync(previewPath, 'utf8');
const START = '<!-- cycle-markup:start', END = '<!-- cycle-markup:end -->';
const a = preview.indexOf(START), b = preview.indexOf(END);
if (a < 0 || b < 0) throw new Error('preview.html is missing the cycle-markup markers');
const headEnd = preview.indexOf('-->', a) + 3;
const synced = preview.slice(0, headEnd) + '\n' + fragment.trim() + '\n' + preview.slice(b);
if (synced !== preview) { writeFileSync(previewPath, synced); console.log('synced cycle-markup.html into preview.html'); }

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu-vsync', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.error('page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(pathToFileURL(previewPath).href + '?autoplay=0&ui=0', { waitUntil: 'load' });
await page.evaluate(() => window.__ready);
await page.waitForTimeout(300);
const DUR = await page.evaluate(() => window.__DUR);
const beats = await page.evaluate(() => window.__beats);
console.log('duration', DUR.toFixed(1), 's; beats', JSON.stringify(beats));

const times = opt('times', null) ? opt('times').split(',').map(Number)
  : [0.9, 2.6, 4.0, 5.8, 7.4, 9.0, 11.2, 12.3, 13.6, 16.2, 18.2, 20.6, 21.6, 24.2, 25.9, 29.2, 31.6, 34.2, 36.0, 37.4, 39.0, 41.8, 43.4, 45.2, 46.3, 47.9, 49.5].filter(t => t <= DUR);
for (const t of times) {
  await page.evaluate(t => window.__seek(t), t);
  await page.waitForTimeout(60);
  const file = resolve(outDir, `still-${t.toFixed(1)}.png`);
  await page.screenshot({ path: file, type: 'png', clip: BOX ? { x: 560, y: 90, width: 800, height: 900 } : undefined });
  console.log('wrote', file);
}
await browser.close();
