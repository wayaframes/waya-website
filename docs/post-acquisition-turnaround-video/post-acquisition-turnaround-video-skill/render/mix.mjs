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
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
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
const run = (a) => { const r = spawnSync(ffmpegPath, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr.split('\n').slice(-12).join('\n')); };
const dB = x => 20 * Math.log10(x);

// 0. the voice's speaking level: decode vo.wav to mono float, 50 ms RMS windows, power mean of the voiced ones
const pcm = spawnSync(ffmpegPath, ['-v', 'error', '-i', VO, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
if (pcm.status !== 0) throw new Error('could not decode out/vo.wav: ' + pcm.stderr);
const s = new Float32Array(pcm.stdout.buffer, pcm.stdout.byteOffset, pcm.stdout.length >> 2);
const WIN = 800; let pow = 0, nv = 0;
for (let i = 0; i + WIN <= s.length; i += WIN) {
  let e = 0; for (let k = i; k < i + WIN; k++) e += s[k] * s[k]; e /= WIN;
  if (e > 10 ** (-45 / 10)) { pow += e; nv++; }
}
if (!nv) throw new Error('out/vo.wav has no speech above -45 dBFS');
const SPEECH_DB = 10 * Math.log10(pow / nv);
let THRESH = 0.02, over = SPEECH_DB - dB(THRESH);
if (over < 2 * DUCK_DB) { THRESH = 10 ** ((SPEECH_DB - 3 * DUCK_DB) / 20); over = 3 * DUCK_DB; }
const RATIO = DUCK_DB > 0 ? 1 / (1 - DUCK_DB / over) : 1;
console.log(`voice speaks at ${SPEECH_DB.toFixed(1)} dBFS, ${over.toFixed(1)} dB over the ${dB(THRESH).toFixed(1)} dBFS threshold; ratio ${RATIO.toFixed(3)} for a ${DUCK_DB} dB duck`);

// 1. the audio bed: voice as the sidechain key, music ducked by it, then summed
const filter = [
  `[1:a]volume=${MUSIC_DB}dB[m]`,
  `[0:a]asplit=2[v][key]`,
  `[m][key]sidechaincompress=threshold=${THRESH.toFixed(5)}:ratio=${RATIO.toFixed(3)}:attack=80:release=600:makeup=1[md]`,
  // the limiter holds peaks at -1 dBFS; level=0 turns off its auto-level, which otherwise scales the output
  // by 1/limit and lets peaks reach ~0 dBFS (before the AAC encode adds its own overshoot)
  `[v][md]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.891:level=0[out]`,
].join(';');
run(['-y', '-i', VO, '-i', resolve(here, 'out/music.wav'), '-filter_complex', filter, '-map', '[out]', '-ar', '48000', resolve(here, 'out/audio-final.wav')]);
// 2. onto the picture (an audio-only test mix when there is no picture yet)
if (!existsSync(VIDEO)) { console.log('no picture yet (' + VIDEO + '); wrote the audio-only mix out/audio-final.wav'); process.exit(0); }
run(['-y', '-i', VIDEO, '-i', resolve(here, 'out/audio-final.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT]);
console.log('wrote', OUT);
