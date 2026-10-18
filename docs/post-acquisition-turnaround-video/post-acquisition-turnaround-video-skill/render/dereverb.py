# Removes room echo (reverb) from the expert's take, once, for every line vo.mjs cuts from it.
#   python dereverb.py [--in ../assets/vince-take.m4a] [--out ../assets/vince-take-clean.wav]
#
# Oren 2026-10-18 (INSTRUCTIONS #30): "When Vince is talking in the last scene there is a lot of echo, can you remove it?"
# An iPhone mic at arm's length in a furnished room: RT60 ~0.3 s, but the compressor and the +11 dB level match lift
# the tail between words, which is what reads as echo. The neural options (DeepFilterNet, resemble-enhance, voicefixer)
# do not install here (no Python 3.12 wheels / need Rust or deepspeed), so this is the classical chain, which leaves
# no vocoder artefacts:
#   1. high-pass 70 Hz
#   2. WPE (weighted prediction error, nara_wpe): linear-prediction dereverberation in the STFT domain; removes the
#      late reverb without touching the direct sound
#   3. late-reverb spectral suppression (Lebart et al.): the late reverb's power is predicted from the signal T_d
#      earlier, decayed by the measured RT60, and removed with a smoothed Wiener gain floored at -15 dB
#   4. a downward expander (2:1 below a threshold 30 dB under the loud speech, at most -14 dB, 3 ms attack, 60 ms
#      release, 30 ms hold) so what is left of the tail between words drops further
# The output is the WHOLE take, sample for sample on the same timeline as the input (no delay: the STFT is
# zero-phase centred and the expander has look-ahead), 48 kHz mono 24-bit. vo.mjs prefers it over vince-take.*.
import argparse, json, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfiltfilt, stft, istft
from scipy.ndimage import uniform_filter1d, maximum_filter1d
from nara_wpe.wpe import wpe

here = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('--in', dest='inp', default=os.path.join(here, '..', 'assets', 'vince-take.m4a'))
ap.add_argument('--out', default=os.path.join(here, '..', 'assets', 'vince-take-clean.wav'))
ap.add_argument('--rt60', type=float, default=None, help='room RT60 in s (default: measured from the take)')
ap.add_argument('--floor', type=float, default=-15.0, help='suppression gain floor, dB')
ap.add_argument('--no-expander', action='store_true')
a = ap.parse_args()

FF = os.path.join(here, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
SR = 48000
raw = subprocess.run([FF, '-v', 'error', '-i', a.inp, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(np.float64)
n = len(x)
x = sosfiltfilt(butter(4, 70, 'highpass', fs=SR, output='sos'), x)

# --- RT60 from the take: the steepest-sustained decays after word ends (10 ms frames), median slope
def env_db(sig, hop=480):
    f = len(sig) // hop
    return 10 * np.log10(np.mean(sig[:f * hop].reshape(f, hop) ** 2, axis=1) + 1e-12)
def rt60_estimate(sig):
    e = env_db(sig); slopes = []
    fl = np.percentile(e, 10)
    i = 0
    while i < len(e) - 30:
        # a word end: a frame >= 25 dB over the floor followed by a fall
        if e[i] > fl + 25 and e[i + 1] < e[i] - 1:
            j = i
            while j + 1 < len(e) and e[j + 1] < e[j] + 0.5 and e[j + 1] > fl + 5: j += 1
            drop = e[i] - e[j]
            if drop > 15 and j - i >= 4: slopes.append(drop / ((j - i) * 0.01))   # dB/s
            i = j + 1
        else: i += 1
    s = np.median(slopes) if slopes else 200.0
    return 60.0 / s, len(slopes)
rt60 = a.rt60
if rt60 is None:
    rt60, nd = rt60_estimate(x)
    rt60 = float(np.clip(rt60, 0.15, 1.0))
else: nd = 0

# --- STFT: 1024 / 256 at 48 kHz (21 ms window, 5.3 ms hop)
NFFT, HOP = 1024, 256
_, _, X = stft(x, fs=SR, nperseg=NFFT, noverlap=NFFT - HOP, boundary='even', padded=True)   # (F, T)
# 2. WPE: taps cover ~80 ms after a 16 ms delay (the direct sound and early reflections are kept)
Y = X.T[None, :, :]                          # (D=1, T, F) -> nara wants (F, D, T)
Z = wpe(np.transpose(Y, (2, 0, 1)), taps=15, delay=3, iterations=3, statistics_mode='full')
Xd = Z[:, 0, :]                              # (F, T)

# 3. late-reverb suppression on the WPE output
P = np.abs(Xd) ** 2
Td = 0.05                                    # late reverb starts 50 ms after the direct sound
k = max(1, int(round(Td * SR / HOP)))
delta = 3 * np.log(10) / rt60
Plate = np.zeros_like(P); Plate[:, k:] = np.exp(-2 * delta * Td) * P[:, :-k]
Ps = uniform_filter1d(P, 3, axis=1); Pl = uniform_filter1d(Plate, 3, axis=1)
G = np.maximum(1 - Pl / (Ps + 1e-12), 10 ** (a.floor / 20))
G = uniform_filter1d(uniform_filter1d(G, 3, axis=0), 3, axis=1)   # smooth across frequency and time: no musical noise
G = np.maximum(G, 10 ** (a.floor / 20))
_, y = istft(Xd * G, fs=SR, nperseg=NFFT, noverlap=NFFT - HOP, boundary=True)
y = y[:n] if len(y) >= n else np.pad(y, (0, n - len(y)))

# 4. downward expander with look-ahead (gain from a centred peak envelope, so onsets are never clipped)
if not a.no_expander:
    hop = 48                                  # 1 ms
    f = n // hop
    e = 10 * np.log10(np.mean(y[:f * hop].reshape(f, hop) ** 2, axis=1) + 1e-12)
    e = maximum_filter1d(e, 30)               # 30 ms hold, centred = look-ahead on attacks
    loud = np.percentile(e[e > np.percentile(e, 50)], 95)
    th = loud - 30
    gdb = np.clip((e - th) * (2 - 1), -14, 0)   # 2:1 below the threshold, at most -14 dB
    # opens at once (the centred hold already looks 15 ms ahead), closes at 14 dB per 60 ms
    rel = np.empty(f); cur = 0.0; rate = 14 / 60
    for i in range(f):
        cur = gdb[i] if gdb[i] >= cur else max(gdb[i], cur - rate)
        rel[i] = cur
    g = 10 ** (uniform_filter1d(rel, 3) / 20)
    g = np.interp(np.arange(n), np.arange(f) * hop + hop / 2, g)
    y = y * g

# match the input's peak scale (vo.mjs sets the level afterwards) and write 24-bit
y = y / (np.max(np.abs(y)) + 1e-9) * min(0.89, np.max(np.abs(x)) * 1.0 + 1e-9)
pcm = (np.clip(y, -1, 1) * (2 ** 23 - 1)).astype(np.int32)
b = pcm.astype('<i4').view(np.uint8).reshape(-1, 4)[:, :3].tobytes()
import wave
with wave.open(a.out, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(3); w.setframerate(SR); w.writeframes(b)
print(json.dumps({'out': os.path.abspath(a.out), 'seconds': round(n / SR, 3), 'rt60_s': round(rt60, 3), 'decays_measured': nd,
                  'wpe': {'taps': 15, 'delay': 3, 'iterations': 3}, 'suppression_floor_db': a.floor, 'expander': not a.no_expander}))
