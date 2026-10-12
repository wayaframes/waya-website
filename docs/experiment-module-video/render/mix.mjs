// Mixes the voiceover (out/vo.wav) with the soundtrack (out/music.wav), the music low and ducked a
// little under speech, and muxes the result onto the caption-free picture.
//   node mix.mjs [--music -22] [--duck 5] [--video out/waya-experiment-program-nocap.mp4]
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const MUSIC_DB = parseFloat(opt('music', '-21'));   // music level under the voice, in dB
const DUCK_DB = parseFloat(opt('duck', '5'));       // how far the music dips while the voice speaks
const VIDEO = resolve(here, opt('video', 'out/waya-experiment-program-nocap.mp4'));
const OUT = resolve(here, opt('out', 'out/waya-experiment-program-final.mp4'));
const run = (a) => { const r = spawnSync(ffmpegPath, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(r.stderr.split('\n').slice(-12).join('\n')); };

// 1. the audio bed: voice as the sidechain key, music ducked by it, then summed
const filter = [
  `[1:a]volume=${MUSIC_DB}dB[m]`,
  `[0:a]asplit=2[v][key]`,
  `[m][key]sidechaincompress=threshold=0.02:ratio=${(1 + DUCK_DB / 3).toFixed(2)}:attack=80:release=600:makeup=1[md]`,
  `[v][md]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.95[out]`,
].join(';');
run(['-y', '-i', resolve(here, 'out/vo.wav'), '-i', resolve(here, 'out/music.wav'), '-filter_complex', filter, '-map', '[out]', '-ar', '48000', resolve(here, 'out/audio-final.wav')]);
// 2. onto the picture
run(['-y', '-i', VIDEO, '-i', resolve(here, 'out/audio-final.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT]);
console.log('wrote', OUT);
