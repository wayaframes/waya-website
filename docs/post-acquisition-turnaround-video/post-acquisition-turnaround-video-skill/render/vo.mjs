// Builds the voiceover from the cue list in ../video.html and prints the timing sheet.
//   node vo.mjs                          -> out/vo.wav, out/vo-timing.txt (and out/video-vo.mp4 if a picture exists)
//   node vo.mjs --voice en-US-AndrewNeural --rate +5%
//
// The cue list (`const CAPS = [[start, end, 'line'], ...]` in video.html) is the one source of truth for
// what is said and when. Write names in CAPS the way they are spelled on screen; pronunciations.json beside
// this file maps them to the spelling the engine needs (edge-tts takes no phonemes). Each line is voiced on
// its own, trimmed of the engine's padding, laid at its start, and cached by its spoken text, so editing or
// reordering lines never reuses a stale clip.
//
// The timing sheet is the thing to read after a run: OVER means a line is longer than its slot, "pushed"
// means the previous line ran into it. Both must be empty before a render.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ENGINE = opt('engine', 'edge');   // edge: the neural narrator (online). sapi: the Windows built-in voice, offline, PLACEHOLDER quality, for timing tests only
const VOICE = opt('voice', 'en-US-AndrewNeural');
const RATE = opt('rate', '+5%');
if (ENGINE === 'sapi' && process.platform !== 'win32') throw new Error('--engine sapi needs Windows; use the default edge engine');
const VIDEO = resolve(here, opt('video', 'out/video-nocap.mp4'));
const outDir = resolve(here, 'out'); mkdirSync(resolve(outDir, 'vo'), { recursive: true });

const html = readFileSync(resolve(here, '../video.html'), 'utf8');
const m = html.match(/const CAPS = (\[[\s\S]*?\n  \]);/);
if (!m) throw new Error('could not find `const CAPS = [ ... ];` in video.html');
const CUES = new Function('return ' + m[1])();

// on-screen spelling -> spoken spelling, whole words only
const PRON = existsSync(resolve(here, 'pronunciations.json')) ? JSON.parse(readFileSync(resolve(here, 'pronunciations.json'), 'utf8')) : {};
const spoken = text => Object.entries(PRON).reduce((s, [w, say]) => s.replace(new RegExp(`(?<![\\w'’])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w'’])`, 'g'), say), text);

const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} ${a.join(' ')}\n${r.stderr}`); return r; };
const duration = f => { const r = spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' }); const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(r.stderr); return (+d[1]) * 3600 + (+d[2]) * 60 + (+d[3]); };

// 1. one clip per cue, cached by voice + rate + spoken text
const clips = [];
// A cue marked 'VINCE' as its 4th element is the expert's own recorded line (this video: line 17, the lens line).
// Until his audio exists it is voiced by the narrator as a PLACEHOLDER and flagged in the timing sheet. Once
// ../assets/vince-lens.wav exists (his line B, cut from the take, any length), it replaces the narrator there:
// high-passed, lightly de-noised, and matched to the narrator's mean level. The narrator is then never heard
// on that line. The widget clip itself must stay muted (no audio stream) or his voice would double.
//
// LIP SYNC (review fix 3): his audio is cut from the take at exactly VINCE_LENS_OFFSET (read from video.html), the
// same second the widget seeks the clip to at the line's start, so voice and mouth share one number. There is NO
// leading-silence trim (a trim would shift the voice against the picture by however much room tone it removed);
// the cut gets a 15 ms fade in and a 40 ms fade out so it does not click. Source, first that exists:
//   1. --vince-take <file>, or assets/vince-take.(wav|m4a|mp4|mov): the take's audio, on the SAME timebase as the
//      widget clip (if the widget clip was trimmed from the take, trim this the same way)
//   2. the widget clip itself (EXPERT_SRC in video.html) if it still has an audio stream (the page plays it muted)
//   3. assets/vince-lens.wav, already cut by hand so that its first sample IS VINCE_LENS_OFFSET in the clip
// From a take, the line ends at the first pause of >= 0.45 s after its first 1.5 s (he says line B, then pauses), or
// at --vince-max seconds (default: the slot + 2 s). --vince-len <s> sets the length by hand instead.
// LEVEL (review fix 11): matched on SPEECH ONLY, the same gate mix.mjs uses (power mean of 50 ms windows above
// -45 dBFS), to the narrator's gated level, so his pauses do not pull the match and over-boost him.
const PAGE_NUM = k => { const r = new RegExp(`const ${k} = (-?[\\d.]+);`).exec(html); return r ? +r[1] : null; };
const PAGE_STR = k => { const r = new RegExp(`const ${k} = '([^']+)';`).exec(html); return r ? r[1] : null; };
const hasAudio = f => existsSync(f) && /Audio:/.test(spawnSync(ffmpegPath, ['-i', f], { encoding: 'utf8' }).stderr);
const vinceSource = () => {
  if (opt('vince-take')) return { file: resolve(here, '..', opt('vince-take')), take: true };
  for (const ext of ['wav', 'm4a', 'mp4', 'mov']) { const f = resolve(here, '..', `assets/vince-take.${ext}`); if (hasAudio(f)) return { file: f, take: true }; }
  const src = PAGE_STR('EXPERT_SRC');
  if (src && !/placeholder/.test(src) && hasAudio(resolve(here, '..', src))) return { file: resolve(here, '..', src), take: true };
  const cut = resolve(here, '..', opt('vince', 'assets/vince-lens.wav'));
  return existsSync(cut) ? { file: cut, take: false } : null;
};
const gatedDb = f => {
  const p = spawnSync(ffmpegPath, ['-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  const s = new Float32Array(p.stdout.buffer, p.stdout.byteOffset, p.stdout.length >> 2); const es = [];
  for (let i = 0; i + 800 <= s.length; i += 800) { let e = 0; for (let k = i; k < i + 800; k++) e += s[k] * s[k]; es.push(e / 800); }
  // gate: above -45 dBFS AND within 25 dB of the loud windows (95th percentile), so a room-tone floor above -45 dBFS
  // in a real recording is not counted as speech
  const p95 = [...es].sort((a, b) => a - b)[Math.floor(es.length * 0.95)] || 0;
  const g = Math.max(10 ** (-4.5), p95 * 10 ** (-2.5)); const on = es.filter(e => e > g);
  return on.length ? 10 * Math.log10(on.reduce((a, b) => a + b, 0) / on.length) : -120;
};
CUES.forEach(([start, end, text, who], i) => {
  const vsrc = who === 'VINCE' ? vinceSource() : null;
  if (vsrc) {
    const wav = resolve(outDir, 'vo', 'vince-lens.wav'), raw = resolve(outDir, 'vo', 'vince-lens-raw.wav'), win = resolve(outDir, 'vo', 'vince-lens-window.wav');
    // --vince-offset <s> overrides the page's VINCE_LENS_OFFSET (for voicing before the page is updated); they must agree
    // before a render, or his voice and mouth are out of sync
    const PAGE_OFF = PAGE_NUM('VINCE_LENS_OFFSET');
    const OFF = opt('vince-offset') != null ? +opt('vince-offset') : (PAGE_OFF ?? 0);
    if (PAGE_OFF !== OFF) console.log(`WARNING: voicing Vince from ${OFF} s (--vince-offset) but video.html says VINCE_LENS_OFFSET = ${PAGE_OFF}: set the page to ${OFF} before rendering, or lip sync breaks`);
    let len = opt('vince-len') ? +opt('vince-len') : null;
    if (vsrc.take) {
      const max = +opt('vince-max', String(end - start + 2));
      run(ffmpegPath, ['-y', '-ss', OFF.toFixed(3), '-i', vsrc.file, '-t', max.toFixed(3), '-vn', '-ar', '48000', '-ac', '2', win]);
      if (len == null) {
        const sd = spawnSync(ffmpegPath, ['-i', win, '-af', 'silencedetect=noise=-40dB:d=0.45', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
        const pause = [...sd.matchAll(/silence_start: ([\d.]+)/g)].map(m => +m[1]).find(t => t > 1.5);
        len = pause != null ? pause + 0.12 : max;
      }
      console.log(`Vince's line: ${vsrc.file} from ${OFF.toFixed(3)} s (VINCE_LENS_OFFSET) for ${len.toFixed(2)} s`);
    } else {
      run(ffmpegPath, ['-y', '-i', vsrc.file, '-vn', '-ar', '48000', '-ac', '2', win]);
      len = len ?? duration(win);
      console.log(`Vince's line: ${vsrc.file} (pre-cut; its first sample must be VINCE_LENS_OFFSET ${OFF} s in the clip), ${len.toFixed(2)} s`);
    }
    const fo = Math.max(len - 0.04, 0).toFixed(3);
    // CLEAN + COMPRESS (Oren 2026-10-18, "compress the volume"): high-pass, a light de-noise set from the take's own
    // room tone (the quietest 10% of 50 ms windows, so the gate never eats soft consonants), then a gentle compressor
    // whose threshold sits 6 dB under his speech-gated level, so his louder and softer words even out and he sits
    // as steady as the narrator. The level match below runs after it.
    const env = (() => { const p = spawnSync(ffmpegPath, ['-v', 'error', '-i', win, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
      const x = new Float32Array(p.stdout.buffer, p.stdout.byteOffset, p.stdout.length >> 2); const es = [];
      for (let i = 0; i + 800 <= x.length; i += 800) { let e = 0; for (let k = i; k < i + 800; k++) e += x[k] * x[k]; es.push(10 * Math.log10(e / 800 + 1e-12)); }
      return es.sort((a, b) => a - b); })();
    const floorDb = env[Math.floor(env.length * 0.1)] ?? -60;
    const nf = Math.min(-25, Math.max(-80, floorDb + 6)).toFixed(0);
    const cth = 10 ** ((gatedDb(win) - 6) / 20);
    const chain = `atrim=0:${len.toFixed(3)},highpass=f=80,afftdn=nr=10:nf=${nf},acompressor=threshold=${cth.toFixed(5)}:ratio=3:attack=5:release=120:knee=4:makeup=1,afade=t=in:st=0:d=0.015,afade=t=out:st=${fo}:d=0.04`;
    console.log(`Vince's clean-up: room tone ${floorDb.toFixed(1)} dBFS -> afftdn nf ${nf}; compressor 3:1 from ${(20 * Math.log10(cth)).toFixed(1)} dBFS`);
    run(ffmpegPath, ['-y', '-i', win, '-af', chain, '-ar', '48000', '-ac', '2', raw]);
    const narr = clips.filter(c => !c.who);
    const ref = narr.length ? 10 * Math.log10(narr.reduce((s, c) => s + 10 ** (gatedDb(c.wav) / 10), 0) / narr.length) : -18;
    // two passes: the limiter that catches his peaks takes a little off the level, so correct once more
    let gain = ref - gatedDb(raw);
    for (let pass = 0; pass < 2; pass++) {
      run(ffmpegPath, ['-y', '-i', raw, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=0.95:level=0`, wav]);
      gain += ref - gatedDb(wav);
    }
    console.log(`Vince's level: speech-gated ${gatedDb(raw).toFixed(1)} dBFS -> ${gatedDb(wav).toFixed(1)} dBFS (narrator ${ref.toFixed(1)} dBFS, gain ${gain.toFixed(1)} dB)`);
    run(ffmpegPath, ['-y', '-loglevel', 'error', '-i', wav, '-c', 'copy', resolve(outDir, 'vo', `cue-${String(i).padStart(2, '0')}.wav`)]);
    clips.push({ i, start, end, text, wav, dur: duration(wav), who: 'VINCE (own voice)' });
    return;
  }
  const say = spoken(text);
  const key = createHash('sha1').update(`${ENGINE}|${VOICE}|${RATE}|${say}`).digest('hex').slice(0, 12);
  const mp3 = resolve(outDir, 'vo', `${key}.${ENGINE === 'sapi' ? 'raw.wav' : 'mp3'}`), wav = resolve(outDir, 'vo', `${key}.wav`);
  if (!existsSync(wav) || args.includes('--fresh')) {
    if (ENGINE === 'sapi') {
      // the text and the path travel as environment variables, so no quoting can break the command
      const ps = "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; $s.Rate = 1; $s.SetOutputToWaveFile($env:VO_OUT); $s.Speak($env:VO_TEXT); $s.Dispose()";
      const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8', env: { ...process.env, VO_TEXT: say, VO_OUT: mp3 } });
      if (r.status !== 0) throw new Error('Windows speech failed on cue ' + i + '\n' + r.stderr);
    } else {
      for (let attempt = 1; ; attempt++) {   // the free service sometimes returns nothing, or a 403 for a few minutes
        try { run('python', ['-m', 'edge_tts', '--voice', VOICE, '--rate=' + RATE, '--text', say, '--write-media', mp3]); break; }
        catch (e) { if (attempt >= 4) throw new Error(`edge-tts failed 4 times on cue ${i}. If every line fails with 403, first upgrade the package (python -m pip install --upgrade edge-tts); an old edge-tts gets 403 on everything. If the newest still fails, the service is blocking this machine: wait and retry. To test timing meanwhile, run with --engine sapi (placeholder voice, never for delivery).\n` + e.message); console.log(`retry ${attempt} for cue ${i}`); }
      }
    }
    run(ffmpegPath, ['-y', '-i', mp3, '-af', 'silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.12,areverse', '-ar', '48000', '-ac', '2', wav]);
  }
  // a stable per-index copy, so other tools (audit.mjs) can find cue N's audio
  run(ffmpegPath, ['-y', '-loglevel', 'error', '-i', wav, '-c', 'copy', resolve(outDir, 'vo', `cue-${String(i).padStart(2, '0')}.wav`)]);
  clips.push({ i, start, end, text, wav, dur: duration(wav), who: who === 'VINCE' ? 'VINCE PLACEHOLDER (narrator; swap for assets/vince-lens.wav)' : '' });
});

// 2. lay them out; a line that runs past the next start pushes it, and both are reported
let cursor = 0, prevEnd = 0; const GAP = 0.18;
const rows = [];
for (const c of clips) {
  c.at = Math.max(c.start, cursor);
  const pushed = c.at - c.start, slot = c.end - c.start, over = c.dur - slot, air = c.at - prevEnd;
  cursor = c.at + c.dur + GAP; prevEnd = c.at + c.dur;
  rows.push(`${c.at.toFixed(2).padStart(7)}s  ${c.dur.toFixed(2).padStart(5)}s  slot ${slot.toFixed(1).padStart(4)}s  air ${air.toFixed(2).padStart(5)}s ${over > 0 ? `OVER +${over.toFixed(1)}` : '       '} ${pushed > 0.05 ? `pushed +${pushed.toFixed(1)}` : '           '}  ${c.who ? `[${c.who}] ` : ''}${c.text}`);
}
// the film's length: the page's own window.__DUR (DUR may be derived, e.g. CLOSE + CLOSE_SAID + CARD_HOLD), read in a
// headless browser as render.mjs does; if no browser starts, an uncommented literal `const DUR = 78.5;`
async function pageDur() {
  try {
    const { launch } = await import('./browser.mjs');
    const b = await launch();
    try { const pg = await b.newPage(); await pg.goto(pathToFileURL(resolve(here, '../video.html')).href + '?autoplay=0&ui=0&cap=0&audio=0'); const d = await pg.evaluate(() => window.__DUR); if (typeof d === 'number' && d > 0) return d; }
    finally { await b.close(); }
  } catch (e) { console.log('could not read window.__DUR (' + e.message.split('\n')[0] + '); falling back to a literal const DUR'); }
  const m = /^\s*const DUR = ([\d.]+);/m.exec(html); return m ? +m[1] : null;
}
const PAGE_DUR = await pageDur();
if (PAGE_DUR == null) console.log('WARNING: no DUR found on the page; the voice track ends with the speech');
const total = Math.max(PAGE_DUR ?? cursor, cursor);
console.log(rows.join('\n'));
console.log(`\n${ENGINE === 'sapi' ? 'PLACEHOLDER Windows voice (timing test only; re-voice with the default engine before delivery)' : `voice ${VOICE} rate ${RATE}`}; speech ends at ${prevEnd.toFixed(1)}s; film ${total.toFixed(1)}s`);

// 3. clips with sound declared on the page as clip($('id'), 'file', [[start, end], ...], len) join the track
for (const cm of html.matchAll(/clip\(\$\('[^']+'\),\s*'([^']+)',\s*\[\[([\d.]+)/g)) {
  const file = resolve(here, '..', cm[1]), start = +cm[2];
  if (!existsSync(file)) { console.log('clip not present yet:', cm[1]); continue; }
  if (!/Audio:/.test(spawnSync(ffmpegPath, ['-i', file], { encoding: 'utf8' }).stderr)) continue;   // muted clips are picture only
  const wav = resolve(outDir, 'vo', 'clip-' + cm[1].replace(/[^a-z0-9]+/gi, '-') + '.wav');
  run(ffmpegPath, ['-y', '-i', file, '-vn', '-ar', '48000', '-ac', '2', wav]);
  clips.push({ wav, at: start, dur: duration(wav) });
  console.log(`clip audio ${cm[1]} at ${start}s`);
}

// 4. the voice track, the film's length
const inputs = clips.flatMap(c => ['-i', c.wav]);
const delays = clips.map((c, k) => `[${k}:a]adelay=${Math.round(c.at * 1000)}|${Math.round(c.at * 1000)}[a${k}]`).join(';');
const mix = clips.map((c, k) => `[a${k}]`).join('') + `amix=inputs=${clips.length}:normalize=0:duration=longest,apad=whole_dur=${total},loudnorm=I=-16:TP=-1.5:LRA=11[out]`;
run(ffmpegPath, ['-y', ...inputs, '-filter_complex', `${delays};${mix}`, '-map', '[out]', '-ar', '48000', resolve(outDir, 'vo.wav')]);
writeFileSync(resolve(outDir, 'vo-timing.txt'), rows.join('\n') + '\n');
console.log('wrote out/vo.wav and out/vo-timing.txt');
// Vince's own line, checked in the finished voice track: lip sync needs it on its planned start, and its speech-gated
// level within 1 dB of the narrator's
const vc = clips.find(c => c.who === 'VINCE (own voice)');
if (vc) {
  if (vc.at - vc.start > 0.01) console.log(`WARNING: Vince's line is pushed ${(vc.at - vc.start).toFixed(2)} s: the widget seeks VINCE_LENS_OFFSET to ${vc.start}, so his mouth and voice are out of sync. Move the line before it.`);
  const tmp = resolve(outDir, 'vo', 'check.wav');
  const seg = (a, b) => { run(ffmpegPath, ['-y', '-loglevel', 'error', '-ss', a.toFixed(3), '-t', (b - a).toFixed(3), '-i', resolve(outDir, 'vo.wav'), tmp]); return gatedDb(tmp); };
  const v = seg(vc.at, vc.at + vc.dur);
  const nv = clips.filter(c => !c.who && c.at != null).map(c => 10 ** (seg(c.at, c.at + c.dur) / 10));
  const n = 10 * Math.log10(nv.reduce((a, b) => a + b, 0) / nv.length);
  console.log(`in vo.wav: Vince speaks at ${v.toFixed(1)} dBFS, the narrator at ${n.toFixed(1)} dBFS (${Math.abs(v - n) <= 1 ? 'within' : 'OUTSIDE'} +-1 dB)`);
}

if (existsSync(VIDEO)) {
  run(ffmpegPath, ['-y', '-i', VIDEO, '-i', resolve(outDir, 'vo.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', resolve(outDir, 'video-vo.mp4')]);
  console.log('wrote out/video-vo.mp4 (voice only; mix.mjs adds the music)');
}
