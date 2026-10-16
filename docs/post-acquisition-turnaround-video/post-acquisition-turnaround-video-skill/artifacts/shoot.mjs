// Screenshots every artifact page in this folder (artifacts/*.html -> artifacts/<name>.png).
// Artifacts are the "real" screens a video shows: a landing page, a survey report, a spreadsheet, an email,
// a chat window. Build them as real pages with a browser frame and real-looking data, then shoot them;
// a drawn widget reads as fake. Usage:  node shoot.mjs [name ...]
// Each page may set its own viewport with <meta name="shoot" content="990x722"> (size it to how large it
// sits on the stage, so its text stays readable at 1080p); default 1440x900. Shots are 2x (crisp when the
// animation director zooms, and the portrait cut can crop from them).
// A page with states sets <meta name="variants" content="full,struck">: each variant is shot again with
// ?v=<variant> (the page adds it as a body class) to <name>-<variant>.png.
import { launch } from '../render/browser.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const only = process.argv.slice(2);
const pages = readdirSync(here).filter(f => f.endsWith('.html') && (!only.length || only.includes(f.replace(/\.html$/, ''))));
const browser = await launch();
for (const file of pages) {
  const m = readFileSync(resolve(here, file), 'utf8').match(/<meta name="shoot" content="(\d+)x(\d+)"/);
  const [width, height] = m ? [+m[1], +m[2]] : [1440, 900];
  const vm = readFileSync(resolve(here, file), 'utf8').match(/<meta name="variants" content="([^"]+)"/);
  for (const v of ['', ...(vm ? vm[1].split(',') : [])]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    await page.goto(pathToFileURL(resolve(here, file)).href + (v ? '?v=' + v : ''), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const out = file.replace(/\.html$/, '') + (v ? '-' + v : '') + '.png';
    await page.screenshot({ path: resolve(here, out), type: 'png' });
    console.log('wrote', out, `${width}x${height} @2x`);
    await page.close();
  }
}
await browser.close();
