// Shoots round-2 style frames (frames2.html?f=N) to style-frame-N-<name>.png at 1920x1080.
// SVGs marked data-svg are inlined first (so their parts can be posed with real transforms).
import { launch } from '../../render/browser.mjs';
import { readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const names = { 5: 'forklift-tip', 6: 'naama-office-wide', 7: 'vince-still-card', 9: 'go-and-see-a3', 10: 'key-line-quote', 11: 'track1-vince-on-camera', 12: 'track2-wide', 13: 'dough-normal', 14: 'dough-puffed' };
const b = await launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const n of Object.keys(names)) {
  await p.goto(pathToFileURL(resolve(here, 'frames2.html')).href + '?f=' + n);
  const srcs = await p.evaluate(() => [...document.querySelectorAll('[data-svg]')].map(e => e.dataset.svg));
  const svgs = Object.fromEntries(srcs.map(s => [s, readFileSync(resolve(here, s), 'utf8')]));
  await p.evaluate(svgs => { document.querySelectorAll('[data-svg]').forEach(e => { e.innerHTML = svgs[e.dataset.svg]; }); window.__pose(); }, svgs);
  await p.evaluate(() => window.__seekVideo());
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const out = resolve(here, `style-frame-${n}-${names[n]}.png`); await p.screenshot({ path: out }); console.log('wrote', out);
}
await b.close();
