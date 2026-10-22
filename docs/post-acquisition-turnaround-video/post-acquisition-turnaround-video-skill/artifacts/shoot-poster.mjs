// Shoots the poster card (artifacts/poster-card.html) in both layouts and makes the two poster JPGs.
//   node artifacts/shoot-poster.mjs
// PNGs at stage size (deviceScaleFactor 1): render/out/poster-landscape.png (1920x1080),
// render/out/poster-portrait.png (1080x1920). JPGs, lanczos-downscaled by ffmpeg:
// render/out/post-acquisition-turnaround-video-skill-poster.jpg (1280x720) and
// render/out/post-acquisition-turnaround-video-skill-portrait-poster.jpg (720x1280).
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const VF = join(HERE, '..');
const OUT = join(VF, 'render', 'out');
mkdirSync(OUT, { recursive: true });

// browser.mjs resolves playwright-core from render/node_modules
const { launch } = await import(pathToFileURL(join(VF, 'render', 'browser.mjs')).href);

const PAGE = pathToFileURL(join(HERE, 'poster-card.html')).href;
const SHOTS = [
  { name: 'landscape', query: '', w: 1920, h: 1080, jpg: 'post-acquisition-turnaround-video-skill-poster.jpg', jw: 1280, jh: 720 },
  { name: 'portrait', query: '?layout=portrait', w: 1080, h: 1920, jpg: 'post-acquisition-turnaround-video-skill-portrait-poster.jpg', jw: 720, jh: 1280 },
];

const FFMPEG = process.env.FFMPEG || '/usr/bin/ffmpeg';
const browser = await launch();
try {
  for (const s of SHOTS) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(PAGE + s.query, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // every face the card uses must actually be loaded, or the shot silently falls back
    const missing = await page.evaluate(async () => {
      const want = ['700 40px "Space Grotesk"', '400 40px "Plus Jakarta Sans"', '500 40px "Plus Jakarta Sans"'];
      const out = [];
      for (const f of want) { await document.fonts.load(f); if (!document.fonts.check(f)) out.push(f); }
      return out;
    });
    if (missing.length) throw new Error('fonts not loaded: ' + missing.join(', '));
    // nothing may overflow the stage
    const clip = await page.evaluate(() => {
      const W = innerWidth, H = innerHeight, bad = [];
      for (const el of document.querySelectorAll('#stage *')) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (r.left < 0 || r.top < 0 || r.right > W || r.bottom > H) bad.push(el.className.baseVal ?? el.className);
      }
      return bad;
    });
    if (clip.length) throw new Error(s.name + ': clipped elements: ' + clip.join(', '));
    const png = join(OUT, `poster-${s.name}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: s.w, height: s.h } });
    await ctx.close();
    const jpg = join(OUT, s.jpg);
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', png,
      '-vf', `scale=${s.jw}:${s.jh}:flags=lanczos+accurate_rnd+full_chroma_int`,
      '-q:v', '3', '-pix_fmt', 'yuvj420p', jpg]);
    console.log(`${s.name}: ${png} (${s.w}x${s.h}) -> ${jpg} (${s.jw}x${s.jh}, ${(statSync(jpg).size / 1024).toFixed(1)} KB)`);
  }
} finally {
  await browser.close();
}
