// Measures a video for the review: run after vo.mjs, from this folder.
//   node audit.mjs [--from 0] [--to DUR] [--step 0.1] [--static 1.5] [--layout mobile]
// Writes out/audit.md and prints a summary. It does not trust anyone's report; it measures:
//  1. the timing sheet: no OVER, no pushed, air >= 0.3 s before every line
//  2. phrases inside every line (silencedetect on the line's audio), mapped to the punctuation of its text
//  3. a sweep of the page every --step seconds, diffing every visible element, to find stretches where
//     nothing visibly moves while the voice is speaking (longer than --static seconds). Motion is measured
//     against the frame where the stretch began, with a floor (--motion px, opacity .08), so a slow drift of a
//     few pixels over seconds counts as frozen: it is invisible to a viewer.
//  4. widget alignment: at every line's midpoint, the visible elements that carry data-col must share one top
//  5. silences over 2.5 s in the voice track, and whether the picture moves during them
//  6. names: no respelling (pronunciations.json values) on screen, no on-screen spelling missing from the voice map
import { launch } from './browser.mjs';
import ffmpegPath from 'ffmpeg-static';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const STEP = +opt('step', '0.1'), STATIC = +opt('static', '1.5'), MOTION = +opt('motion', '6');
const LAYOUT = opt('layout', 'desktop');   // desktop (1920x1080) or mobile (the portrait cut, 1080x1920)
const html = readFileSync(resolve(here, '../video.html'), 'utf8');
const CUES = new Function('return ' + html.match(/const CAPS = (\[[\s\S]*?\n  \]);/)[1])();
const PRON = existsSync(resolve(here, 'pronunciations.json')) ? JSON.parse(readFileSync(resolve(here, 'pronunciations.json'), 'utf8')) : {};
const out = [], fails = [];
const say = (s) => { out.push(s); };
const fail = (s) => { fails.push(s); out.push('**FAIL** ' + s); };

// ---- 1. the timing sheet ----
const sheetFile = resolve(here, 'out/vo-timing.txt');
if (!existsSync(sheetFile)) { console.error('run vo.mjs first'); process.exit(1); }
// this folder's vo.mjs predates the kit and writes no "air" column: when it is absent, air = this start − the previous line's end
const sheet = readFileSync(sheetFile, 'utf8').trim().split('\n').map((l, i, all) => {
  const m = /^\s*([\d.]+)s\s+([\d.]+)s\s+slot\s+([\d.]+)s(?:\s+air\s+(-?[\d.]+)s)?/.exec(l);
  const prev = i ? /^\s*([\d.]+)s\s+([\d.]+)s/.exec(all[i - 1]) : null;
  const air = m[4] != null ? +m[4] : (prev ? +m[1] - (+prev[1] + +prev[2]) : +m[1]);
  return { i, at: +m[1], dur: +m[2], slot: +m[3], air, over: /OVER/.test(l), pushed: /pushed/.test(l), text: CUES[i][2] };
});
say('## 1. Timing sheet');
for (const r of sheet) {
  if (r.over) fail(`line ${r.i} is longer than its slot: "${r.text.slice(0, 60)}…"`);
  if (r.pushed) fail(`line ${r.i} is pushed by the line before it`);
  if (r.i > 0 && r.air < 0.3) fail(`line ${r.i} has only ${r.air.toFixed(2)} s of air before it`);
}
say(`${sheet.length} lines; speech ends at ${(sheet.at(-1).at + sheet.at(-1).dur).toFixed(1)} s`);

// ---- 2. phrases inside each line ----
const silences = (file, db, d) => {
  const r = spawnSync(ffmpegPath, ['-i', file, '-af', `silencedetect=noise=${db}dB:d=${d}`, '-f', 'null', '-'], { encoding: 'utf8' });
  const s = [...r.stderr.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]), e = [...r.stderr.matchAll(/silence_end: ([\d.]+)/g)].map(m => +m[1]);
  return s.map((a, k) => [a, e[k] ?? Infinity]);
};
const phrases = sheet.map(r => {
  const f = resolve(here, `out/vo/cue-${String(r.i).padStart(2, '0')}.wav`);
  const gaps = existsSync(f) ? silences(f, -35, 0.12) : [];
  const spans = []; let p = 0;
  for (const [a, b] of gaps) { if (a > p + 0.05) spans.push([p, a]); p = b; }
  if (p < r.dur - 0.05) spans.push([p, r.dur]);
  const parts = r.text.split(/(?<=[,;:.?!])\s+/);
  return spans.map((s, k) => ({ line: r.i, t0: r.at + s[0], t1: r.at + s[1], text: spans.length === parts.length ? parts[k] : `(phrase ${k + 1}/${spans.length})` }));
}).flat();
say('\n## 2. Phrases (time on the film, text matched by punctuation where the counts agree)');
for (const ph of phrases) say(`- ${ph.t0.toFixed(2)}–${ph.t1.toFixed(2)}  [${ph.line}] ${ph.text}`);

// ---- 3–6. the picture ----
const browser = await launch();
const page = await browser.newPage({ viewport: LAYOUT === 'mobile' ? { width: 1080, height: 1920 } : { width: 1920, height: 1080 } });
page.on('pageerror', e => fail('page error: ' + e.message));
await page.goto(pathToFileURL(resolve(here, '../video.html')).href + `?autoplay=0&ui=0&cap=0&layout=${LAYOUT}`);
await page.evaluate(() => window.__ready);
const DUR = await page.evaluate(() => window.__DUR);
const FROM = +opt('from', '0'), TO = +opt('to', String(DUR));
const snap = () => page.evaluate(() => {
  const st = document.getElementById('stage'); const sr = st.getBoundingClientRect(); const k = st.offsetWidth / sr.width;
  const vis = e => { let o = 1; for (let n = e; n && n !== st.parentNode; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; } return o; };
  let h = 0; const add = s => { for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; };
  const els = [];   // [index, left, top, width, height, effective opacity, dash offset, look]: compared with a floor
  [...st.querySelectorAll('*')].forEach((e, i) => {
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.opacity === '0') return;
    const r = e.getBoundingClientRect(), o = vis(e);
    add(`${cs.opacity}${cs.transform}${cs.filter}${cs.backgroundColor}${cs.color}${cs.strokeDashoffset}${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)},${Math.round(r.height)}${e.children.length ? '' : (e.textContent || '').slice(0, 24)}`);
    if (o > 0.02) els.push([i, r.left * k, r.top * k, r.width * k, r.height * k, o, parseFloat(cs.strokeDashoffset) || 0, `${cs.backgroundColor}${cs.color}${cs.filter}${e.children.length ? '' : (e.textContent || '').slice(0, 24)}`]);
  });
  for (const v of st.querySelectorAll('video')) if (v.style.display !== 'none') { add('v' + v.currentTime.toFixed(1)); els.push([-1, v.currentTime, 0, 0, 0, 1, 0, 'video']); }
  const cols = [...st.querySelectorAll('[data-col]')].map(e => ({ id: e.id || e.className, col: e.dataset.col, o: vis(e), top: Math.round((e.getBoundingClientRect().top - sr.top) * k) })).filter(c => c.o > 0.95);
  return { h, els, cols, text: st.innerText };
});
const frames = [];
for (let t = FROM; t <= TO + 1e-6; t += STEP) { await page.evaluate(t => window.__seek(t), t); frames.push({ t: +t.toFixed(2), ...(await snap()) }); }
// static stretches under speech
say('\n## 3. Static stretches while the voice speaks (> ' + STATIC + ' s)');
const speaking = t => sheet.some(r => t >= r.at && t <= r.at + r.dur);
// a visible change between two frames: an element appears or leaves, moves or resizes by MOTION px, fades by .08,
// draws a line by MOTION px of dash, changes colour or text, or a video plays on
const differs = (a, b) => {
  if (a.els.length !== b.els.length) return true;
  return a.els.some((x, j) => { const y = b.els[j];
    return x[0] !== y[0] || x[7] !== y[7] || Math.abs(x[5] - y[5]) > 0.08 || Math.abs(x[6] - y[6]) > MOTION ||
      (x[0] === -1 ? x[1] !== y[1] : [1, 2, 3, 4].some(q => Math.abs(x[q] - y[q]) > MOTION)); });
};
let runStart = null, n3 = 0, anchor = frames[0];
for (let i = 1; i <= frames.length; i++) {
  const same = i < frames.length && !differs(anchor, frames[i]);
  if (!same && i < frames.length) anchor = frames[i];
  if (same && runStart === null) runStart = frames[i - 1].t;
  if ((!same || i === frames.length) && runStart !== null) {
    const end = frames[i - 1].t, len = end - runStart;
    if (len > STATIC) {
      const voiced = frames.filter(f => f.t >= runStart && f.t <= end && speaking(f.t)).length * STEP;
      if (voiced > STATIC) { n3++; fail(`nothing moves ${runStart.toFixed(1)}–${end.toFixed(1)} s (${len.toFixed(1)} s) while the voice says: "${phrases.filter(p => p.t1 > runStart && p.t0 < end).map(p => p.text).join(' ')}"`); }
    }
    runStart = null;
  }
}
if (!n3) say('none');
// alignment at each line's midpoint
say('\n## 4. Widget alignment (elements with data-col, at each line\'s midpoint)');
let n4 = 0;
for (const r of sheet) {
  const mid = r.at + r.dur / 2; const f = frames.reduce((a, b) => Math.abs(b.t - mid) < Math.abs(a.t - mid) ? b : a);
  if (f.cols.length >= 2) {
    const tops = f.cols.map(c => c.top), spread = Math.max(...tops) - Math.min(...tops);
    if (spread > 2) { n4++; fail(`at ${f.t} s the widgets are not top-aligned: ${f.cols.map(c => `${c.id}@${c.top}`).join(', ')}`); }
    else say(`- ${f.t} s: ${f.cols.map(c => c.id).join(', ')} at top ${tops[0]}`);
  }
}
// silences
say('\n## 5. Silences over 2.5 s in the voice track');
const vs = silences(resolve(here, 'out/vo.wav'), -40, 2.5).filter(([a]) => a < DUR - 0.5);
for (const [a, b0] of vs) {
  const b = Math.min(b0, DUR); const fr = frames.filter(f => f.t >= a && f.t <= b);
  const moves = fr.some((f, k) => k && differs(fr[0], f));
  (moves ? say : fail)(`${a.toFixed(1)}–${b.toFixed(1)} s (${(b - a).toFixed(1)} s): the picture ${moves ? 'moves' : 'is frozen'}`);
}
if (!vs.length) say('none');
// names
say('\n## 6. Names');
const shown = new Set(frames.map(f => f.text).join('\n').split(/\s+/));
for (const [w, sp] of Object.entries(PRON)) {
  if ([...shown].some(x => x.includes(sp))) fail(`the respelling "${sp}" appears on screen; the screen must say "${w}"`);
  if (CUES.some(c => c[2].includes(sp))) fail(`a cue contains the respelling "${sp}"; write "${w}" in the cue and let pronunciations.json respell it`);
}
say('checked ' + Object.keys(PRON).length + ' pronunciations');
await browser.close();
writeFileSync(resolve(here, LAYOUT === 'mobile' ? 'out/audit-mobile.md' : 'out/audit.md'), `# Audit\n\n${fails.length ? `**${fails.length} failing checks**` : '**All checks pass**'}\n\n` + out.join('\n') + '\n');
console.log(fails.length ? `${fails.length} FAIL\n- ` + fails.join('\n- ') : 'all checks pass');
console.log(`wrote out/${LAYOUT === 'mobile' ? 'audit-mobile' : 'audit'}.md`);
