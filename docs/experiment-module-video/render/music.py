"""Composes and synthesizes the soundtrack for video.html, then writes out/music.wav (48 kHz stereo).

Shape, in seconds of the film (draft 5 timeline):
  0–28.6   dark: D minor drone, a slow pulse, a sparse minor arpeggio, a tick that creeps in with the pile
  28.6–30.6 the lift: a riser, then the key turns to F major as the screen warms
  30.6–84   bright and steady: pad chords, a soft pluck, light kick
  84–116    the loop: bass, snare, hats and a lead line come in one by one
  116–125   crescendo: Sam on the call with Dana, everything in, a crash on the cut
  125–end   calm: pads and a slow arpeggio for the last two cards, then fade

Pure numpy/scipy, no samples. Run:  python music.py [--dur 131.5]
"""
import sys, numpy as np
from scipy.signal import lfilter
from scipy.io import wavfile

SR = 48000
DUR = float(sys.argv[sys.argv.index('--dur') + 1]) if '--dur' in sys.argv else 131.5
BPM = 100.0
BEAT = 60.0 / BPM
BAR = 4 * BEAT
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

def t_axis(n): return np.arange(n) / SR
def note(name_midi): return 440.0 * 2 ** ((name_midi - 69) / 12)
def lp(x, cutoff, order=1):
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(order): x = lfilter([1 - a], [1, -a], x)
    return x
def hp(x, cutoff): return x - lp(x, cutoff)
def env(n, a, d, s, r, hold=None):
    """ADSR over n samples; hold = sustain length in samples (default: n - a - d - r)."""
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    if hold is None: hold = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(max(hold, 0), s), np.linspace(s, 0, max(r, 1))])
    if len(e) < n: e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]
def add(buf_l, buf_r, x, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(i + len(x), N)
    if i >= N or j <= i: return
    x = x[:j - i] * gain
    buf_l[i:j] += x * (1 - max(pan, 0)); buf_r[i:j] += x * (1 + min(pan, 0))

# ---------- instruments ----------
def saw(f, n, detune=0.0):
    t = t_axis(n); ph = (t * f * (1 + detune)) % 1.0
    return lp(2 * ph - 1, 6000)
def pad(f, dur, gain=1.0, cutoff=900, attack=0.9, release=1.6):
    n = int((dur + release) * SR)
    x = saw(f, n, -0.004) + saw(f, n, 0.004) + 0.6 * saw(f * 2, n, 0.002) + 0.5 * np.sin(2 * np.pi * f * t_axis(n))
    x = lp(x, cutoff, 2) * env(n, attack, 0.3, 0.85, release, hold=int(dur * SR) - int((attack + 0.3) * SR))
    return x * gain * 0.22
def pluck(f, dur=0.5, gain=1.0):
    n = int(dur * SR); t = t_axis(n)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)
    bright, dark = lp(x, 2800), lp(x, 600)
    k = np.exp(-t * 6)                                   # the tone darkens as it decays
    x = bright * k + dark * (1 - k)
    return x * env(n, 0.004, 0.25, 0.25, 0.2) * gain * 0.35
def bass(f, dur, gain=1.0):
    n = int(dur * SR); t = t_axis(n)
    x = np.sin(2 * np.pi * f * t) + 0.35 * lp(np.sign(np.sin(2 * np.pi * f * t)), 400)
    return x * env(n, 0.01, 0.2, 0.6, 0.12) * gain * 0.5
def lead(f, dur, gain=1.0):
    n = int((dur + 0.3) * SR); t = t_axis(n)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 2, 0, 1)
    ph = 2 * np.pi * np.cumsum(f * vib) / SR
    x = np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)
    x = lp(x, 3000)
    return x * env(n, 0.03, 0.15, 0.8, 0.3, hold=int(dur * SR) - int(0.18 * SR)) * gain * 0.28
def kick(gain=1.0):
    n = int(0.45 * SR); t = t_axis(n)
    f = 45 + 110 * np.exp(-t * 22)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    return x * gain * 0.9
def snare(gain=1.0):
    n = int(0.22 * SR); t = t_axis(n)
    x = hp(lp(rng.standard_normal(n), 5000), 900) * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return x * gain * 0.55
def hat(gain=1.0, dec=0.06):
    n = int(0.12 * SR); t = t_axis(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / dec) * gain * 0.3
def tick(gain=1.0):
    n = int(0.06 * SR); t = t_axis(n)
    return hp(rng.standard_normal(n), 3500) * np.exp(-t * 120) * gain * 0.35
def crash(gain=1.0):
    n = int(2.6 * SR); t = t_axis(n)
    return hp(rng.standard_normal(n), 4000) * np.exp(-t * 1.6) * gain * 0.35
def riser(dur):
    n = int(dur * SR); t = t_axis(n)
    noise = rng.standard_normal(n)
    out = np.zeros(n)
    # sweep the filter up by rendering in chunks
    step = SR // 20
    for k in range(0, n, step):
        c = 300 + 5000 * (k / n) ** 2
        out[k:k + step] = hp(lp(noise[k:k + step], c), c * 0.4)
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (t / dur * 1.5)) / SR) * 0.25
    return (out * 0.35 + tone) * (t / dur) ** 1.6 * 0.5

# ---------- the dark opening: 0–28.6 ----------
D2, D3, F3, A3, C4, Eb3 = note(38), note(50), note(53), note(57), note(60), note(51)
n = int(29.5 * SR); t = t_axis(n)
drone = lp(saw(D2, n) + 0.7 * saw(D2 * 2, n, 0.003) + 0.4 * saw(D2 * 1.5, n, -0.002), 260, 2)
drone *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)) * env(n, 0.25, 0.5, 1, 1.2)
drone *= np.clip(0.55 + t / 29.5 * 0.6, 0, 1.1)                    # tension climbs
add(L, R, drone, 0, gain=0.32); add(L, R, drone, 0, gain=0.32)
for b in np.arange(0.15, 28.4, 1.2):                                # slow heartbeat pulse, from the first frame
    add(L, R, kick(0.45 + 0.3 * b / 28), b)
for s in np.arange(1.0, 27.0, 1.8):                                 # sparse minor arpeggio, higher as it tightens
    f = [D3, F3, A3, C4][int(rng.integers(0, 4))]
    if rng.random() < 0.18: f = Eb3                                  # the sour note
    add(L, R, pluck(f, 0.9, 0.5 + 0.3 * s / 27), s + rng.uniform(-0.15, 0.15), pan=rng.uniform(-0.5, 0.5))
for s in np.arange(11.0, 28.5, BEAT / 2):                           # a tick creeps in with the pile
    add(L, R, tick(0.25 + 0.5 * (s - 11) / 17), s, pan=0.35 * np.sin(s * 3))
add(L, R, riser(2.6), 26.2)

# ---------- the bright section: F major, 30.6 onwards ----------
BRIGHT = 30.6
F3n, A3n, C4n, E4n, G4n, Bb3n, D4n = note(53), note(57), note(60), note(64), note(67), note(58), note(62)
CHORDS = [  # (name, pad notes (midi), bass midi)
    ('F', [53, 57, 60, 65], 41), ('C', [52, 55, 60, 64], 36), ('Dm', [50, 53, 57, 62], 38), ('Bb', [50, 53, 58, 65], 34),
]
PENTA = [65, 67, 69, 72, 74, 77, 79, 81]  # F pentatonic from F4
MOTIF = [[69, 72, 74, 72, 69, 67, 65, None], [69, 72, 74, 77, 74, 72, 69, None]]

def section(t):  # layer plan by film time
    if t < 58: return dict(pad=1, pluck=1, kick=0.5, bass=0, snare=0, hat=0, lead=0, vol=1.05)
    if t < 84: return dict(pad=1, pluck=1, kick=0.7, bass=0.8, snare=0, hat=0.5, lead=0, vol=1.15)
    if t < 104: return dict(pad=1, pluck=1, kick=0.9, bass=1, snare=0.7, hat=0.8, lead=0.9, vol=1.25)
    if t < 116.2: return dict(pad=1, pluck=1, kick=1, bass=1, snare=0.9, hat=1, lead=1, vol=1.4)
    if t < 125.0: return dict(pad=1.1, pluck=1, kick=1, bass=1, snare=1, hat=1, lead=1.2, vol=1.7)   # crescendo
    return dict(pad=0.7, pluck=0.45, kick=0, bass=0, snare=0, hat=0, lead=0, vol=0.5)               # calm

bar_i = 0; t0 = BRIGHT
while t0 < DUR:
    S = section(t0); ch = CHORDS[bar_i % 4]
    calm = t0 >= 125.0
    # crescendo cadence: last two bars before the calm resolve IV–V–I
    if 116.2 <= t0 < 125.0:
        ch = [('Bb', [50, 53, 58, 65], 34), ('C', [52, 55, 60, 64], 36), ('F', [53, 57, 60, 65], 41), ('F', [53, 57, 60, 65], 41)][bar_i % 4]
    if calm: ch = ('F', [53, 57, 60, 65], 41)
    v = S['vol']
    for m in ch[1]:
        add(L, R, pad(note(m), BAR, S['pad'] * v, cutoff=700 if t0 < 58 else 1100 if t0 < 116 else 1500), t0, pan=rng.uniform(-0.3, 0.3))
    if S['bass']:
        for k in range(4): add(L, R, bass(note(ch[2]), BEAT * 0.9, S['bass'] * v), t0 + k * BEAT)
    if S['pluck']:
        arp = ch[1] if not calm else [53, 60, 65, 69]
        for k in range(8 if not calm else 4):
            m = arp[k % len(arp)] + (12 if k % 4 == 3 else 0)
            add(L, R, pluck(note(m), 0.5, S['pluck'] * v * (0.9 if k % 2 == 0 else 0.6)), t0 + k * (BEAT / 2 if not calm else BEAT), pan=0.4 * np.sin(k))
    if S['kick']:
        for k in [0, 2]: add(L, R, kick(S['kick'] * v), t0 + k * BEAT)
        if t0 >= 104: add(L, R, kick(S['kick'] * v * 0.7), t0 + 3.5 * BEAT)
    if S['snare']:
        for k in [1, 3]: add(L, R, snare(S['snare'] * v), t0 + k * BEAT)
    if S['hat']:
        div = BEAT / 2 if t0 < 104 else BEAT / 4
        for k in np.arange(0, BAR, div): add(L, R, hat(S['hat'] * v * (1 if (k / div) % 2 == 0 else 0.6), 0.05 if t0 < 116 else 0.08), t0 + k, pan=0.25)
    if S['lead']:
        mot = MOTIF[bar_i % 2]
        up = 12 if t0 >= 116.2 else 0
        for k, m in enumerate(mot):
            if m is None: continue
            add(L, R, lead(note(m + up), BEAT / 2 * 0.95, S['lead'] * v), t0 + k * BEAT / 2, pan=-0.15)
    t0 += BAR; bar_i += 1

add(L, R, crash(1.0), 116.5)
add(L, R, riser(1.8), 114.6)        # into the cut

# ---------- reverb (Schroeder), master ----------
def reverb(x, mix=0.22):
    y = np.zeros_like(x)
    for d, g in [(0.0297, 0.77), (0.0371, 0.80), (0.0411, 0.75), (0.0437, 0.73)]:
        n = int(d * SR); y += lfilter([1], np.concatenate([[1], np.zeros(n - 1), [-g]]), x)
    for d, g in [(0.005, 0.7), (0.0017, 0.7)]:
        n = int(d * SR); y = lfilter(np.concatenate([[-g], np.zeros(n - 1), [1]]), np.concatenate([[1], np.zeros(n - 1), [-g]]), y)
    return x * (1 - mix) + y * mix * 0.25
L = reverb(L); R = reverb(R)
L = lp(hp(L, 35), 12000); R = lp(hp(R, 35), 12000)
# master fade: in over 1 s, out over the last 3 s; and the calm: settle to 40% across the cut at 125 s
fade = np.ones(N); fi = int(0.12 * SR); fo = int(3.0 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
c0, c1 = int(124.4 * SR), int(126.4 * SR)
if c1 < N:
    fade[c0:c1] *= np.linspace(1, 0.4, c1 - c0); fade[c1:] *= 0.4
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
L /= peak; R /= peak
# soft clip to tame transients, then leave headroom
L = np.tanh(L * 1.4) / np.tanh(1.4) * 0.9; R = np.tanh(R * 1.4) / np.tanh(1.4) * 0.9
out = np.stack([L, R], axis=1)
wavfile.write('out/music.wav', SR, (out * 32767).astype(np.int16))
print('wrote out/music.wav', round(DUR, 1), 's')
