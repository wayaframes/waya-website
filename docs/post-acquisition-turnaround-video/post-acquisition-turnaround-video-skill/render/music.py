"""Composes and synthesizes the soundtrack, then writes out/music.wav (48 kHz stereo). No samples, no licence.

Everything time-dependent lives in music-plan.json beside this file; the audio technician edits only that:
  dur            film length in seconds (the page's DUR)
  tension_end    end of the dark, tense opening (0 = no dark opening; the film starts bright)
  pulse_from     when the ticking that tightens the tension starts (e.g. when the problem piles up)
  bright_at      when the key turns major (as the screen warms); a riser leads into it
  layers         [[time, preset], ...] presets: steady, build, drive, full (each adds instruments)
  presets        optional {name: {pad, pluck, kick, bass, snare, hat, lead, vol}} extra steps for layers
  crescendo      [start, end] everything in, octave-up lead, a crash at start + 0.2 (or null)
  cresc_lead     the octave-up lead's level in the crescendo (default 1.2). It sits in the voice's range, so
                 lower it (e.g. 0.7) when the key line is spoken over the crescendo
  calm_at        pads and a slow arpeggio from here (the settle comes from the lighter instruments)
  calm_vol       loudness of the calm bed's instruments (default 0.65)
  calm_level     extra gain on everything from calm_at, ramped over 2 s (default 1.0 = none; it was a
                 fixed 0.4, which, on top of calm_vol 0.5, left the close card ~ -53 dB in the mix: silent)
  tension_gain_db  level of the dark opening against the rest, in dB (default 0)
  fade_out       seconds of fade at the very end (default 0.5; it was 3.0, which emptied the close card)
  duck           optional [[start, end, dB, ramp?], ...]: pull the whole bed down by dB there, ramps either side
                 (default 0.4 s). -15 with a 0.8 s ramp under the expert's own line keeps the bed present (-30 left a hole)
  derive         optional: take dur, the lens duck, calm_at and the last crescendo's end from out/vo-timing.txt
                 (see derive() below), so they follow the expert's own line when its length changes

The arc that worked for Waya: tense under the problem, lift as the solution appears, build through the
method, peak on the payoff, settle for the close. Mixed 10 dB under the voice, ducked 4 dB while it speaks.
Run:  python music.py [--dur 90]
"""
import sys, json, os, numpy as np
from scipy.signal import lfilter
from scipy.io import wavfile

here = os.path.dirname(os.path.abspath(__file__))
PLAN = json.load(open(os.path.join(here, 'music-plan.json'), encoding='utf-8'))

# ---------- times that follow the voice ----------
# "derive" in the plan ties the lens duck, calm_at, the payoff crescendo's end and dur to the MEASURED timing sheet
# (out/vo-timing.txt, written by vo.mjs), so they follow the expert's own line whatever its length:
#   lens: the row tagged [VINCE ...]; close: the last row; dur = max(out/vo.wav's length = the page's DUR, close end + card_hold)
#   duck = [lens start - duck_pad[0], lens end + duck_pad[1], duck_db, duck_ramp]
#   calm_at = lens start - calm_before_lens; the last crescendo ends at lens start - cresc_end_before_lens
def derive(plan):
    d = plan.get('derive')
    sheet = os.path.join(here, 'out', 'vo-timing.txt')
    if not d or not os.path.exists(sheet): return plan
    import re
    rows = []
    for line in open(sheet, encoding='utf-8'):
        m = re.match(r'\s*([\d.]+)s\s+([\d.]+)s', line)
        if m: rows.append((float(m.group(1)), float(m.group(2)), 'VINCE' in line))
    lens = next((r for r in rows if r[2]), None); close = rows[-1]
    out = dict(plan)
    close_end = close[0] + close[1]
    # the page's DUR may be derived, so read it where vo.mjs wrote it: out/vo.wav is padded to the page's window.__DUR
    page_dur = None
    try:
        sr_, data_ = wavfile.read(os.path.join(here, 'out', 'vo.wav')); page_dur = len(data_) / sr_
    except (OSError, ValueError): pass
    out['dur'] = round(max(page_dur or 0, close_end + float(d.get('card_hold', 2.6))), 2)
    if lens:
        ls, le = lens[0], lens[0] + lens[1]
        pad = d.get('duck_pad', [0.1, 0.1])
        out['duck'] = [[round(ls - pad[0], 2), round(le + pad[1], 2), float(d.get('duck_db', -15)), float(d.get('duck_ramp', 0.8))]]
        out['calm_at'] = round(ls - float(d.get('calm_before_lens', 0.24)), 2)
        if 'cresc_end_before_lens' in d and plan.get('crescendo'):
            c = [list(w) for w in plan['crescendo']] if isinstance(plan['crescendo'][0], (list, tuple)) else [list(plan['crescendo'])]
            c[-1][1] = round(ls - float(d['cresc_end_before_lens']), 2)
            out['crescendo'] = c
    print('derived from the timing sheet: dur %s, duck %s, calm_at %s, crescendo %s' % (out['dur'], out.get('duck'), out.get('calm_at'), out.get('crescendo')))
    return out
PLAN = derive(PLAN)
SR = 48000
DUR = float(sys.argv[sys.argv.index('--dur') + 1]) if '--dur' in sys.argv else float(PLAN['dur'])
BPM = float(PLAN.get('bpm', 100))
BEAT = 60.0 / BPM
BAR = 4 * BEAT
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
TENSION_END = float(PLAN.get('tension_end', 0))
PULSE_FROM = float(PLAN.get('pulse_from', TENSION_END * 0.5))
BRIGHT = float(PLAN.get('bright_at', TENSION_END + 1.6 if TENSION_END else 0))
_c = PLAN.get('crescendo')
# one window [start, end] or several [[start, end], ...]; a window that starts before bright_at is a DARK crescendo
# (D minor: the drone swells, minor pads open up, a heartbeat on every beat, a low lead), e.g. under a key line
# that lands while the picture is still dark; the others are the bright, major crescendo
CRESCS = [] if not _c else ([_c] if not isinstance(_c[0], (list, tuple)) else [list(w) for w in _c])
CRESC = CRESCS[0] if CRESCS else None
CALM = float(PLAN.get('calm_at', DUR + 1))
CRESC_LEAD = float(PLAN.get('cresc_lead', 1.2))
CALM_VOL = float(PLAN.get('calm_vol', 0.65))
CALM_LEVEL = float(PLAN.get('calm_level', 1.0))
TG = 10 ** (float(PLAN.get('tension_gain_db', 0)) / 20)
FADE_OUT = float(PLAN.get('fade_out', 0.5))
PRESETS = {
    'steady': dict(pad=1, pluck=1, kick=0.5, bass=0, snare=0, hat=0, lead=0, vol=1.05),
    'build':  dict(pad=1, pluck=1, kick=0.7, bass=0.8, snare=0, hat=0.5, lead=0, vol=1.15),
    'drive':  dict(pad=1, pluck=1, kick=0.9, bass=1, snare=0.7, hat=0.8, lead=0.9, vol=1.25),
    'full':   dict(pad=1, pluck=1, kick=1, bass=1, snare=0.9, hat=1, lead=1, vol=1.4),
}
PRESETS.update(PLAN.get('presets', {}))   # a plan may add in-between steps (same keys as above)
LAYERS = sorted(PLAN.get('layers', [[BRIGHT, 'steady']]))

def t_axis(n): return np.arange(n) / SR
def note(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, cutoff, order=1):
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(order): x = lfilter([1 - a], [1, -a], x)
    return x
def hp(x, cutoff): return x - lp(x, cutoff)
def env(n, a, d, s, r, hold=None):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    if hold is None: hold = max(n - a - d - r, 0)
    e = np.concatenate([np.linspace(0, 1, max(a, 1)), np.linspace(1, s, max(d, 1)), np.full(max(hold, 0), s), np.linspace(s, 0, max(r, 1))])
    if len(e) < n: e = np.concatenate([e, np.zeros(n - len(e))])
    return e[:n]
def add(x, start, pan=0.0, gain=1.0):
    i = int(start * SR); j = min(i + len(x), N)
    if i >= N or j <= i or i < 0: return
    x = x[:j - i] * gain
    L[i:j] += x * (1 - max(pan, 0)); R[i:j] += x * (1 + min(pan, 0))

# ---------- instruments ----------
def saw(f, n, detune=0.0):
    t = t_axis(n); ph = (t * f * (1 + detune)) % 1.0
    return lp(2 * ph - 1, 6000)
def pad(f, dur, gain=1.0, cutoff=900, attack=0.9, release=1.6):
    n = int((dur + release) * SR)
    x = saw(f, n, -0.004) + saw(f, n, 0.004) + 0.6 * saw(f * 2, n, 0.002) + 0.5 * np.sin(2 * np.pi * f * t_axis(n))
    return lp(x, cutoff, 2) * env(n, attack, 0.3, 0.85, release, hold=int(dur * SR) - int((attack + 0.3) * SR)) * gain * 0.22
def pluck(f, dur=0.5, gain=1.0):
    n = int(dur * SR); t = t_axis(n)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2 * f * t)
    k = np.exp(-t * 6)
    return (lp(x, 2800) * k + lp(x, 600) * (1 - k)) * env(n, 0.004, 0.25, 0.25, 0.2) * gain * 0.35
def bass(f, dur, gain=1.0):
    n = int(dur * SR); t = t_axis(n)
    return (np.sin(2 * np.pi * f * t) + 0.35 * lp(np.sign(np.sin(2 * np.pi * f * t)), 400)) * env(n, 0.01, 0.2, 0.6, 0.12) * gain * 0.5
def lead(f, dur, gain=1.0):
    n = int((dur + 0.3) * SR); t = t_axis(n)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.clip(t * 2, 0, 1))) / SR
    return lp(np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph), 3000) * env(n, 0.03, 0.15, 0.8, 0.3, hold=int(dur * SR) - int(0.18 * SR)) * gain * 0.28
def kick(gain=1.0):
    n = int(0.45 * SR); t = t_axis(n)
    return np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-t * 22)) / SR) * np.exp(-t * 9) * gain * 0.9
def snare(gain=1.0):
    n = int(0.22 * SR); t = t_axis(n)
    return (hp(lp(rng.standard_normal(n), 5000), 900) * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)) * gain * 0.55
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
    n = int(dur * SR); t = t_axis(n); noise = rng.standard_normal(n); out = np.zeros(n); step = SR // 20
    for k in range(0, n, step):
        c = 300 + 5000 * (k / n) ** 2
        out[k:k + step] = hp(lp(noise[k:k + step], c), c * 0.4)
    return (out * 0.35 + np.sin(2 * np.pi * np.cumsum(110 * 2 ** (t / dur * 1.5)) / SR) * 0.25) * (t / dur) ** 1.6 * 0.5

MOTIF = [[69, 72, 74, 72, 69, 67, 65, None], [69, 72, 74, 77, 74, 72, 69, None]]

# ---------- the tense opening: D minor drone, heartbeat, sparse arpeggio, a tick as the problem piles up ----------
if TENSION_END > 0:
    D2, D3, F3, A3, C4, Eb3 = note(38), note(50), note(53), note(57), note(60), note(51)
    span = TENSION_END + 0.85
    n = int(span * SR); t = t_axis(n)
    drone = lp(saw(D2, n) + 0.7 * saw(D2 * 2, n, 0.003) + 0.4 * saw(D2 * 1.5, n, -0.002), 260, 2)
    drone *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)) * env(n, 0.25, 0.5, 1, 1.2) * np.clip(0.55 + t / span * 0.6, 0, 1.1)
    add(drone, 0, gain=0.64 * TG)
    for b in np.arange(0.15, TENSION_END - 0.4, 1.2): add(kick(0.45 + 0.3 * b / TENSION_END), b, gain=TG)
    for s in np.arange(1.0, TENSION_END - 1.7, 1.8):
        f = [D3, F3, A3, C4][int(rng.integers(0, 4))]
        if rng.random() < 0.18: f = Eb3
        add(pluck(f, 0.9, 0.5 + 0.3 * s / TENSION_END), s + rng.uniform(-0.15, 0.15), pan=rng.uniform(-0.5, 0.5), gain=TG)
    for s in np.arange(PULSE_FROM, TENSION_END - 0.2, BEAT / 2):
        add(tick(0.25 + 0.5 * (s - PULSE_FROM) / max(TENSION_END - PULSE_FROM, 1)), s, pan=0.35 * np.sin(s * 3), gain=TG)
    add(riser(2.6), BRIGHT - 3.85, gain=TG)
    for a, b in [w for w in CRESCS if w[0] < BRIGHT]:   # the dark crescendo
        span_c = b - a
        for m in (38, 50, 53, 57):   # D minor, opening as it goes
            x = pad(note(m), span_c, 1.1, cutoff=1400, attack=0.6, release=1.2)
            x *= np.clip(np.linspace(0.5, 1.2, len(x)), 0, 1.2)
            add(x, a, pan=rng.uniform(-0.3, 0.3), gain=TG)
        for s_ in np.arange(a, b - 0.1, BEAT): add(kick(0.9), s_, gain=TG)
        for s_ in np.arange(a, b - 0.1, BEAT / 2): add(hat(0.6, 0.05), s_, pan=0.25, gain=TG)
        k = 0
        for s_ in np.arange(a, b - 0.3, BEAT / 2):
            m = MOTIF[(k // 8) % 2][k % 8]; k += 1
            if m is not None: add(lead(note(m - 12), BEAT / 2 * 0.95, CRESC_LEAD), s_, pan=-0.15, gain=TG)

# ---------- the bright section: F major ----------
CHORDS = [('F', [53, 57, 60, 65], 41), ('C', [52, 55, 60, 64], 36), ('Dm', [50, 53, 57, 62], 38), ('Bb', [50, 53, 58, 65], 34)]
CADENCE = [('Bb', [50, 53, 58, 65], 34), ('C', [52, 55, 60, 64], 36), ('F', [53, 57, 60, 65], 41), ('F', [53, 57, 60, 65], 41)]
in_cresc = lambda t: any(a <= t < b for a, b in CRESCS if a >= BRIGHT)
def section(t):
    if t >= CALM: return dict(pad=0.7, pluck=0.45, kick=0, bass=0, snare=0, hat=0, lead=0, vol=CALM_VOL)
    if in_cresc(t): return dict(pad=1.1, pluck=1, kick=1, bass=1, snare=1, hat=1, lead=CRESC_LEAD, vol=1.7)
    cur = PRESETS['steady']
    for at, name in LAYERS:
        if t >= at: cur = PRESETS[name]
    return cur
busy_from = next((at for at, name in LAYERS if name in ('drive', 'full')), DUR + 1)

bar_i = 0; t0 = BRIGHT
while t0 < DUR:
    S = section(t0); calm = t0 >= CALM
    ch = CADENCE[bar_i % 4] if in_cresc(t0) else (('F', [53, 57, 60, 65], 41) if calm else CHORDS[bar_i % 4])
    v = S['vol']
    for m in ch[1]: add(pad(note(m), BAR, S['pad'] * v, cutoff=1500 if in_cresc(t0) or calm else 1100 if t0 >= busy_from else 700), t0, pan=rng.uniform(-0.3, 0.3))
    if S['bass']:
        for k in range(4): add(bass(note(ch[2]), BEAT * 0.9, S['bass'] * v), t0 + k * BEAT)
    if S['pluck']:
        arp = [53, 60, 65, 69] if calm else ch[1]
        for k in range(4 if calm else 8):
            add(pluck(note(arp[k % len(arp)] + (12 if k % 4 == 3 else 0)), 0.5, S['pluck'] * v * (0.9 if k % 2 == 0 else 0.6)), t0 + k * (BEAT if calm else BEAT / 2), pan=0.4 * np.sin(k))
    if S['kick']:
        for k in [0, 2]: add(kick(S['kick'] * v), t0 + k * BEAT)
        if t0 >= busy_from: add(kick(S['kick'] * v * 0.7), t0 + 3.5 * BEAT)
    if S['snare']:
        for k in [1, 3]: add(snare(S['snare'] * v), t0 + k * BEAT)
    if S['hat']:
        div = BEAT / 4 if t0 >= busy_from else BEAT / 2
        for k in np.arange(0, BAR, div): add(hat(S['hat'] * v * (1 if (k / div) % 2 == 0 else 0.6), 0.08 if in_cresc(t0) else 0.05), t0 + k, pan=0.25)
    if S['lead']:
        for k, m in enumerate(MOTIF[bar_i % 2]):
            if m is not None: add(lead(note(m + (12 if in_cresc(t0) else 0)), BEAT / 2 * 0.95, S['lead'] * v), t0 + k * BEAT / 2, pan=-0.15)
    t0 += BAR; bar_i += 1
for a, b in CRESCS:
    add(riser(1.8), a - 1.6)
    add(crash(1.0), a + 0.2)

# ---------- reverb, master ----------
def reverb(x, mix=0.22):
    y = np.zeros_like(x)
    for d, g in [(0.0297, 0.77), (0.0371, 0.80), (0.0411, 0.75), (0.0437, 0.73)]:
        n = int(d * SR); y += lfilter([1], np.concatenate([[1], np.zeros(n - 1), [-g]]), x)
    for d, g in [(0.005, 0.7), (0.0017, 0.7)]:
        n = int(d * SR); y = lfilter(np.concatenate([[-g], np.zeros(n - 1), [1]]), np.concatenate([[1], np.zeros(n - 1), [-g]]), y)
    return x * (1 - mix) + y * mix * 0.25
L = lp(hp(reverb(L), 35), 12000); R = lp(hp(reverb(R), 35), 12000)
fade = np.ones(N); fi = int(0.03 * SR); fo = int(FADE_OUT * SR)   # music is present from the first frame (a 1-frame declick)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
c0, c1 = int((CALM - 0.4) * SR), int((CALM + 1.6) * SR)
if 0 < c0 < N and CALM_LEVEL != 1.0:
    c1 = min(c1, N); fade[c0:c1] *= np.linspace(1, CALM_LEVEL, c1 - c0); fade[c1:] *= CALM_LEVEL
# duck windows: [[start, end, dB, ramp?], ...] pull the whole bed down, with ramps either side (default 0.4 s)
for dw in PLAN.get('duck', []):
    d0, d1, ddb = dw[:3]; ramp = float(dw[3]) if len(dw) > 3 else 0.4
    g = 10 ** (float(ddb) / 20); r = int(ramp * SR)
    a, b = int(d0 * SR), int(d1 * SR)
    a0, b1 = max(a - r, 0), min(b + r, N)
    if a > a0: fade[a0:a] *= np.linspace(1, g, a - a0)
    fade[a:b] *= g
    if b1 > b: fade[b:b1] *= np.linspace(g, 1, b1 - b)
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()) or 1.0
L = np.tanh(L / peak * 1.4) / np.tanh(1.4) * 0.9; R = np.tanh(R / peak * 1.4) / np.tanh(1.4) * 0.9
os.makedirs(os.path.join(here, 'out'), exist_ok=True)
wavfile.write(os.path.join(here, 'out', 'music.wav'), SR, (np.stack([L, R], axis=1) * 32767).astype(np.int16))
print('wrote out/music.wav', round(DUR, 1), 's')
