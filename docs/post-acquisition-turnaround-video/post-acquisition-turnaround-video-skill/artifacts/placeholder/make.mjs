// Renders expert-placeholder.html to ../../assets/expert-placeholder.mp4: a 4 s seamless loop, 720x720, 25 fps.
import { launch } from '../../render/browser.mjs';
import ffmpegPath from '../../render/node_modules/ffmpeg-static/index.js';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, '../../assets/expert-placeholder.mp4'), N = 100;
const b = await launch(); const p = await b.newPage({ viewport: { width: 720, height: 720 } });
await p.goto(pathToFileURL(resolve(here, 'expert-placeholder.html')).href); await p.evaluate(() => document.fonts.ready);
const ff = spawn(ffmpegPath, ['-y', '-f', 'image2pipe', '-framerate', '25', '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-an', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let f = 0; f < N; f++) { await p.evaluate(([f, n]) => window.frame(f, n), [f, N]); ff.stdin.write(await p.screenshot({ type: 'png' })); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('wrote', out);
