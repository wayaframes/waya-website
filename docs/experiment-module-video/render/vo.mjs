// Builds the voiceover from the caption cues in ../video.html, then muxes it onto the rendered MP4.
//   node vo.mjs                      -> out/vo.wav + out/waya-experiment-program-vo.mp4
//   node vo.mjs --voice en-US-AndrewNeural --rate -8%
// Each cue is spoken as its own clip (edge-tts, Microsoft's neural voices), laid at the cue's start
// time. If a clip runs past the next cue, the next one is pushed back and the overrun is reported,
// so the timing sheet below is the thing to read after a run.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const VOICE = opt('voice', 'en-US-AndrewNeural');
const RATE = opt('rate', '+5%');
const VIDEO = resolve(here, opt('video', 'out/waya-experiment-program-nocap.mp4'));
const outDir = resolve(here, 'out'); mkdirSync(resolve(outDir, 'vo'), { recursive: true });

// the cues, read from the page so there is one source of truth
const html = readFileSync(resolve(here, '../video.html'), 'utf8');
const m = html.match(/const CAPS = (\[[\s\S]*?\n  \]);/);
if (!m) throw new Error('could not find the CAPS array in video.html');
const CUES = new Function('return ' + m[1])();

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')}\n${r.stderr}`); return r; };
const duration = f => { const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' }); const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr); return (+d[1]) * 3600 + (+d[2]) * 60 + (+d[3]); };

// 1. one clip per cue
const clips = [];
CUES.forEach(([start, end, text], i) => {
  const mp3 = resolve(outDir, 'vo', `cue-${String(i).padStart(2, '0')}.mp3`);
  const wav = mp3.replace(/\.mp3$/, '.wav');
  if (!existsSync(wav) || args.includes('--fresh')) {
    for (let attempt = 1; ; attempt++) { // the service occasionally returns nothing; try again
      try { run('python', ['-m', 'edge_tts', '--voice', VOICE, '--rate=' + RATE, '--text', text, '--write-media', mp3]); break; }
      catch (e) { if (attempt >= 4) throw e; console.log(`retry ${attempt} for cue ${i}`); }
    }
    // trim the silence the synthesizer pads at both ends, so a cue starts speaking on its cue
    run(ffmpegPath, ['-y', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.12,areverse', '-ar', '48000', '-ac', '2', wav]);
  }
  clips.push({ i, start, end, text, wav, dur: duration(wav) });
});

// 2. lay them out; push a cue back if the previous clip runs over it
let cursor = 0; const GAP = 0.18;
const rows = [];
for (const c of clips) {
  c.at = Math.max(c.start, cursor);
  const pushed = c.at - c.start, slot = c.end - c.start, over = c.dur - slot;
  cursor = c.at + c.dur + GAP;
  rows.push(`${c.at.toFixed(2).padStart(6)}s  ${c.dur.toFixed(2)}s  slot ${slot.toFixed(1)}s ${over > 0 ? `OVER +${over.toFixed(1)}` : '      '} ${pushed > 0.05 ? `pushed +${pushed.toFixed(1)}` : '          '}  ${c.text}`);
}
const DURM = /const DUR = ([\d.]+);/.exec(html); const total = Math.max(DURM ? +DURM[1] : 75, cursor);
console.log(rows.join('\n'));
console.log(`\nvoice ${VOICE} rate ${RATE}; speech ends at ${cursor.toFixed(1)}s`);

// 2b. Na'ama's clips: the page declares clip(<el>, '<file>', <start>, <max>); their audio joins the voice track at <start>
const CLIPREF = /clip\(\$\('[^']+'\),\s*'([^']+)',\s*([\d.]+),\s*([\d.]+)\)/g;
for (const m of html.matchAll(CLIPREF)) {
  const file = resolve(here, '..', m[1]), start = +m[2], max = +m[3];
  if (!existsSync(file)) { console.log('clip not present yet:', m[1]); continue; }
  if (!/Audio:/.test(spawnSync(ffmpegPath, ['-i', file], { encoding: 'utf8' }).stderr)) { console.log('clip is muted, picture only:', m[1]); continue; }
  const wav = resolve(outDir, 'vo', 'clip-' + m[1].replace(/[^a-z0-9]+/gi, '-') + '.wav');
  run(ffmpegPath, ['-y', '-i', file, '-t', String(max), '-vn', '-ar', '48000', '-ac', '2', wav]);
  const d = duration(wav);
  clips.push({ i: clips.length, start, end: start + d, text: '[Naama clip: ' + m[1] + ']', wav, dur: d, at: start });
  console.log(`clip ${m[1]} at ${start}s, ${d.toFixed(2)}s`);
}
clips.sort((a, b) => a.at - b.at);

// 3. mix: every clip delayed to its start, over the film's length of silence
const inputs = clips.flatMap(c => ['-i', c.wav]);
const delays = clips.map((c, k) => `[${k}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[a${k}]`).join(';');
const mix = clips.map((c, k) => `[a${k}]`).join('') + `amix=inputs=${clips.length}:normalize=0:duration=longest,apad=whole_dur=${total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
const voWav = resolve(outDir, 'vo.wav');
run(ffmpegPath, ['-y', ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '[out]', '-ar', '48000', voWav]);
writeFileSync(resolve(outDir, 'vo-timing.txt'), rows.join('\n') + '\n');
console.log('wrote', voWav);

// 4. mux onto the caption-free video
if (existsSync(VIDEO)) {
  const out = resolve(outDir, 'waya-experiment-program-vo.mp4');
  run(ffmpegPath, ['-y', '-i', VIDEO, '-i', voWav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out]);
  console.log('wrote', out);
} else console.log('no video at', VIDEO, '- render it with: node render.mjs --cap 0');
