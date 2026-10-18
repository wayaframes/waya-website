// Mixes the voiceover (out/vo.wav) with the soundtrack (out/music.wav), the music low and ducked a
// little under speech, and muxes the result onto the caption-free picture.
//   node mix.mjs [--music -13] [--duck 4] [--video out/video-nocap.mp4] [--out out/video-final.mp4]
// --music  the music's level against music.wav, in dB (applied everywhere). Default -13 for this video (review fix 6):
//          music.wav rises ~7.7 dB from the tension to the results, so -10 left the results only 7-9 dB under the voice;
//          -13 with music-plan.json tension_gain_db 4.5 keeps the problem section where it was
// --duck   how many dB the music dips while the voice speaks. The compressor's ratio is derived from the
//          voice as it actually sits: the script measures the voice's speaking level (power mean of the 50 ms
//          windows above -45 dBFS in vo.wav), takes how far that is over the sidechain threshold (over_dB),
//          and sets ratio = 1 / (1 - duck / over_dB), so the gain reduction at the speaking level is --duck.
//          (It used to be 1 + duck / 3, which assumed the voice sat 3 dB over the threshold; a loudnormed voice
//          sits ~16 dB over, so --duck 4 gave a ~9 dB duck and audible pumping between lines.)
//          If the voice is less than 2 x duck over the threshold, the threshold is lowered to speech - 3 x duck.
// --bus    'on' (default) or 'off'. COMPRESSION (Oren 2026-10-18, "compress the volume of the video"):
//          1. the VOICE alone is compressed before the duck (2.5:1, soft knee, threshold 6 dB under its speaking
//             level, 5 ms attack), so loud and soft words, and Vince against the narrator, even out; make-up gain
//             restores its speaking level, so the music still sits where --music puts it and the duck (keyed by the
//             compressed voice, ratio derived from the same speaking level) is still --duck dB. The music is never
//             compressed, so nothing pumps: compressing the summed mix instead deepened the duck by ~2 dB.
//          2. the mix gets ONE static gain to --lufs integrated and a peak limiter 0.5 dB under --tp. (loudnorm is
//             not used: whenever its gain would lift a peak past the ceiling it falls back to dynamic gain riding.)
//          The script prints integrated LUFS, loudness range (LRA) and true peak before and after.
// --lufs   integrated loudness target (default -16).  --tp  true-peak ceiling in dBTP (default -1.5).
// --wav    where the audio mix is written (default out/audio-final.wav).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const MUSIC_DB = parseFloat(opt('music', '-13'));   // music level under the voice, in dB
const DUCK_DB = parseFloat(opt('duck', '4'));       // how far the music dips while the voice speaks
const VIDEO = resolve(here, opt('video', 'out/video-nocap.mp4'));
const OUT = resolve(here, opt('out', 'out/video-final.mp4'));
const VO = resolve(here, 'out/vo.wav');
const BUS = opt('bus', 'on') !== 'off';
const LUFS = parseFloat(opt('lufs', '-16')), TP = parseFloat(opt('tp', '-1.5'));
const WAV = resolve(here, opt('wav', 'out/audio-final.wav'));
const run = (a) => { const r = spawnSync(ffmpegPath, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr.split('\n').slice(-12).join('\n')); };
const dB = x => 20 * Math.log10(x);

// 0. the voice's speaking level: decode to mono float, 50 ms RMS windows, power mean of the voiced ones
const speechDb = (f, ss, t) => {
  const pcm = spawnSync(ffmpegPath, ['-v', 'error', ...(ss != null ? ['-ss', ss.toFixed(3), '-t', t.toFixed(3)] : []), '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
  if (pcm.status !== 0) throw new Error('could not decode ' + f + ': ' + pcm.stderr);
  const s = new Float32Array(pcm.stdout.buffer, pcm.stdout.byteOffset, pcm.stdout.length >> 2);
  const WIN = 800; let pow = 0, nv = 0;
  for (let i = 0; i + WIN <= s.length; i += WIN) {
    let e = 0; for (let k = i; k < i + WIN; k++) e += s[k] * s[k]; e /= WIN;
    if (e > 10 ** (-45 / 10)) { pow += e; nv++; }
  }
  if (!nv) throw new Error(f + ' has no speech above -45 dBFS');
  return 10 * Math.log10(pow / nv);
};
const SPEECH_DB = speechDb(VO);
// 0b. the voice compressed on its own, make-up gain back to the same speaking level
let VOICE = VO;
// The expert's own lines (rows marked [VINCE (own voice)] in vo-timing.txt) BYPASS this compressor (coordinator,
// 2026-10-18): vo.mjs dereverbs, compresses and expands them, and a second compressor with a 150 ms release lifted the
// room tail between his words ~6 dB again (INSTRUCTIONS #30, "a lot of echo"). The switch happens 0.15 s outside
// his speech, in the air between lines, so it cannot click; the bypassed span gets a fixed gain that keeps his
// speaking level where the compressed track would have put it. The narrator's sound and the duck are unchanged.
const SPANS = existsSync(resolve(here, 'out/vo-timing.txt'))
  ? [...readFileSync(resolve(here, 'out/vo-timing.txt'), 'utf8').matchAll(/^\s*([\d.]+)s\s+([\d.]+)s.*\[VINCE \(own voice\)\]/gm)].map(m => [+m[1] - 0.15, +m[1] + +m[2] + 0.15])
  : [];
if (BUS) {
  VOICE = resolve(here, 'out/vo-comp.wav');
  const vc = `acompressor=threshold=${(10 ** ((SPEECH_DB - 6) / 20)).toFixed(5)}:ratio=2.5:attack=5:release=150:knee=6:makeup=1`;
  run(['-y', '-i', VO, '-af', vc, '-ar', '48000', VOICE]);
  const mk = SPEECH_DB - speechDb(VOICE);
  if (SPANS.length) {
    // the compressed track's level over his spans, after make-up, against the untouched voice there
    const lv = (f, extra) => 10 * Math.log10(SPANS.reduce((acc, [a, b]) => acc + 10 ** (speechDb(f, a, b - a) / 10), 0) / SPANS.length) + extra;
    const byp = lv(VOICE, mk) - lv(VO, 0);
    const w = SPANS.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
    run(['-y', '-i', VO, '-filter_complex', `[0:a]asplit=2[a][b];[a]${vc},volume=${mk.toFixed(2)}dB,volume='1-(${w})':eval=frame[c];[b]volume=${byp.toFixed(2)}dB,volume='${w}':eval=frame[o];[c][o]amix=inputs=2:normalize=0[out]`, '-map', '[out]', '-ar', '48000', VOICE]);
    console.log(`expert's own lines bypass the voice compressor: ${SPANS.map(([a, b]) => a.toFixed(2) + '-' + b.toFixed(2)).join(', ')} (gain ${byp.toFixed(1)} dB)`);
  } else run(['-y', '-i', VO, '-af', `${vc},volume=${mk.toFixed(2)}dB`, '-ar', '48000', VOICE]);
  console.log(`voice compressor 2.5:1 from ${(SPEECH_DB - 6).toFixed(1)} dBFS, make-up ${mk.toFixed(1)} dB -> speaking level ${speechDb(VOICE).toFixed(1)} dBFS`);
}
let THRESH = 0.02, over = SPEECH_DB - dB(THRESH);
if (over < 2 * DUCK_DB) { THRESH = 10 ** ((SPEECH_DB - 3 * DUCK_DB) / 20); over = 3 * DUCK_DB; }
const RATIO = DUCK_DB > 0 ? 1 / (1 - DUCK_DB / over) : 1;
console.log(`voice speaks at ${SPEECH_DB.toFixed(1)} dBFS, ${over.toFixed(1)} dB over the ${dB(THRESH).toFixed(1)} dBFS threshold; ratio ${RATIO.toFixed(3)} for a ${DUCK_DB} dB duck`);

// 1. the audio bed: voice as the sidechain key, music ducked by it, then summed
const filter = [
  `[1:a]volume=${MUSIC_DB}dB[m]`,
  `[0:a]asplit=2[v][key]`,
  `[m][key]sidechaincompress=threshold=${THRESH.toFixed(5)}:ratio=${RATIO.toFixed(3)}:attack=80:release=600:makeup=1[md]`,
  // latency=1: the limiter's look-ahead would otherwise delay the whole mix ~5 ms against the picture (measured)
  // the limiter holds peaks at -1 dBFS; level=0 turns off its auto-level, which otherwise scales the output
  // by 1/limit and lets peaks reach ~0 dBFS (before the AAC encode adds its own overshoot)
  `[v][md]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.891:level=0:latency=1[out]`,
].join(';');
const RAW = BUS ? WAV.replace(/\.wav$/, '-precomp.wav') : WAV;
run(['-y', '-i', VOICE, '-i', resolve(here, 'out/music.wav'), '-filter_complex', filter, '-map', '[out]', '-ar', '48000', RAW]);
// loudness (EBU R128): integrated LUFS, loudness range, true peak
const r128 = f => { const e = spawnSync(ffmpegPath, ['-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const sum = e.slice(e.lastIndexOf('Summary:')); const g = re => { const m = re.exec(sum); return m ? +m[1] : NaN; };
  return { I: g(/I:\s+(-?[\d.]+) LUFS/), LRA: g(/LRA:\s+(-?[\d.]+) LU/), TP: g(/Peak:\s+(-?[\d.]+) dBFS/) }; };
const fmt = m => `${m.I.toFixed(1)} LUFS, LRA ${m.LRA.toFixed(1)} LU, true peak ${m.TP.toFixed(1)} dBTP`;
if (BUS) {
  const before = r128(RAW);
  // then ONE static gain to the loudness target and a peak limiter 0.5 dB under the true-peak ceiling (loudnorm's
  // linear mode falls back to dynamic gain riding whenever the gain would lift a peak past --tp, which pumps; a
  // static gain into a fast limiter only touches the few peaks). Two passes, since the limiter takes a little off.
  let gain = 0, after;
  for (let pass = 0; pass < 3; pass++) {
    run(['-y', '-i', RAW, '-af', `volume=${gain.toFixed(2)}dB,alimiter=limit=${(10 ** ((TP - 0.5) / 20)).toFixed(4)}:attack=1:release=50:level=0:latency=1`, '-ar', '48000', WAV]);
    after = r128(WAV); if (Math.abs(after.I - LUFS) < 0.15) break; gain += LUFS - after.I;
  }
  console.log(`mix gain ${gain.toFixed(1)} dB to ${LUFS} LUFS, limiter at ${(TP - 0.5).toFixed(1)} dBFS`);
  if (after.TP > TP) console.log(`WARNING: true peak ${after.TP.toFixed(1)} dBTP is over the ${TP} dBTP ceiling`);
  console.log(`loudness before the gain (voice already compressed; --bus off gives the uncompressed baseline): ${fmt(before)}`);
  console.log(`loudness after:  ${fmt(after)}`);
} else console.log(`loudness: ${fmt(r128(WAV))} (bus compression off)`);
// 2. onto the picture (an audio-only test mix when there is no picture yet)
if (!existsSync(VIDEO)) { console.log('no picture yet (' + VIDEO + '); wrote the audio-only mix ' + WAV); process.exit(0); }
run(['-y', '-i', VIDEO, '-i', WAV, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT]);
console.log('wrote', OUT);
