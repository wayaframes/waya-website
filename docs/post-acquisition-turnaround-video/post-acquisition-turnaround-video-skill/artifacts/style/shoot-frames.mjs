// Shoots the style frames (frames.html?f=N) to style-frame-N-<name>.png at 1920x1080.
import { launch } from '../../render/browser.mjs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const names = { 1: 'opening-dark', 2: 'key-line', 3: 'two-tracks-demo', 4: 'results-cream' };
const b = await launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
for (const n of [1, 2, 3, 4]) {
  await p.goto(pathToFileURL(resolve(here, 'frames.html')).href + '?f=' + n);
  await p.evaluate(() => window.__ready); await p.waitForTimeout(200);
  const out = resolve(here, `style-frame-${n}-${names[n]}.png`); await p.screenshot({ path: out }); console.log('wrote', out);
}
await b.close();
