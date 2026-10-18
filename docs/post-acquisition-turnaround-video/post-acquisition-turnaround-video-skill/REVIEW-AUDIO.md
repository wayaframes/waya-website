# Audio and sync review: landscape cut (2026-10-16)

Reviewer: the audio technician, independently (I did not build this cut). Everything below is measured.
- **Cut:** `render/out/video-final.mp4`, 78.50 s, 1920x1080 at 30 fps, AAC 48 kHz stereo.
- **Sources:** `video.html` (CAPS and timeline constants), `render/out/vo-timing.txt`, `render/out/words.json`,
  `render/out/vo/cue-NN.wav`, `render/out/music.wav`, `render/out/audio-final.wav`, `music-plan.json`.

**How it was measured:**
- `node render/audit.mjs` gives **all checks pass**.
- A second page sweep at 0.05 s steps reads each element's opacity (≥ 0.5 counts as on) and position. It runs the
  static check twice, once with the expert `<video>` counted as motion and once without it, because `audit.mjs`
  counts the playing widget clip as motion.
- Per-frame luma contrast of the MP4 at every transition, to find blank frames.
- Speech-gated levels in 50 ms windows: voice from `vo.wav`; music from the ducked bed, rebuilt with the same
  sidechain settings `mix.mjs` logged (threshold −34.0 dBFS, ratio 1.265).

**Verdict:** the voice track, the per-word picture sync and the loudness are good. **Four things must be fixed before
delivery:**
- the lens-to-close hole: about 1 s of digital silence over a frozen frame, then a blank frame;
- the close constants that do not follow the lens line;
- the lip-sync plumbing for Vince's own audio;
- the music in the results section, which sits too close to the voice.

## Acceptance items with an audio or timing check

| # | Item | Result | Evidence |
|---|---|---|---|
| 2 | 60–90 s | **PASS** | ffprobe 78.50 s |
| 4 | about 1:20 | **PASS** | 78.50 s; speech ends 75.92 s; the card holds 2.58 s |
| 11 | Lens line in Vince's own voice, clip muted elsewhere | **OPEN** (placeholder, as planned) | Line 17 is the narrator, flagged `[VINCE PLACEHOLDER]` in the timing sheet. The widget `<video>` is `muted`. The plumbing has gaps: fixes 2–4 |
| 12 | Na'ama said NAH-AH-MAH | **PASS** (by spelling) | `words.json` line 9 has "Nah-ah-mah" at 42.89; no respelling on screen (audit §6) |
| 15 | Line 1 = "Vince, now a Waya co-founder, …" | **PASS** | Voiced word for word, 0.60–6.68 |
| HR 16–17 | No OVER, no pushed, air ≥ 0.4 s | **PASS** | Air ranges from 0.60 s to 1.75 s on every line |
| HR 18 | Every visual within 0.7 s of its phrase | **FAIL ×1** | Fill-rate chip, +1.23 s (fix 7). Every other visual is within ±0.55 s (table below) |
| HR 13 | Nothing static > 1.5 s under speech | **PASS with the widget / FAIL without it** | 22.35–24.40 (2.05 s) and 27.10–28.70 (1.60 s): only the widget clip moves (fix 8) |
| HR 13 | Dead air between scenes ≤ 0.5 s; no blank frame before the close | **FAIL** | 70.95–72.0 at ≤ −60 dBFS over a static frame; blank frames 72.33–72.73 (fix 1) |
| HR 21 | Music present throughout; 10 dB under and ducked 4 dB; close about 20 dB under | **PARTIAL** | Duck measured 3.0–4.0 dB per line (pass). Music is effectively absent under the lens (−57 dBFS, fix 5). In the results it is only 7.3–9.1 dB under the voice (fix 6). Close card 16.9 dB under (pass) |
| — | No clipping | **PASS** | True peak −1.0 dBFS; sample peak −1.00 dBFS; −16.2 LUFS integrated; LRA 2.9 LU |
| — | Voice even across lines | **PASS** | Speaking level per line −13.6 to −15.5 dBFS (1.9 dB spread); cue mean −21.2 to −24.0 dB |

## Audio-side fixes applied (2026-10-16, production mode, at the producer's request)

**What changed:**
- **Files:** only `render/music-plan.json`, `render/music.py`, `render/vo.mjs` and `render/mix.mjs`.
- **Rebuilt:** `out/vo.wav` (placeholder; the timing sheet is byte-identical), `out/music.wav`, and the audio-only test
  mix `out/audio-final.wav`.
- **Not run:** the final picture mix. `video-final.mp4` is still the old mix.

| Fix | Status | What changed | Measured after |
|---|---|---|---|
| 1 (audio side) | **done** | The lens duck runs from the line's start − 0.1 to its **measured** end + 0.1 (67.34–70.99), then ramps back over 0.8 s | Lens → close gap 70.9–72.6: mix −42.6 dBFS at worst (71.0), −33 to −36 by 71.5–72.25. Before: ≤ −60 dBFS for 1 s. **No hole.** (The frozen frame and blank frames are the picture side, still open) |
| 2 | **done** | `music.py` `derive()` reads `out/vo-timing.txt`. `dur` = max(page DUR, close end + 2.6); `duck` and `calm_at` come from the row tagged VINCE; the payoff crescendo ends 0.64 s before the lens. The plan's static values are only a fallback | Today: dur 78.52, duck [67.34, 70.99, −15, 0.8], calm_at 67.2, crescendo 2 ends 66.8 |
| 3 | **done, tested on a synthetic take** | `vo.mjs` cuts his line from the take at exactly `VINCE_LENS_OFFSET` (read from video.html). There is no leading trim. Fades are 15 ms in and 40 ms out. The end is the first ≥ 0.45 s pause after 1.5 s, or `--vince-len`. Sources, in order: `--vince-take`, `assets/vince-take.*` (same timebase as the clip), EXPERT_SRC if it has audio, the pre-cut `assets/vince-lens.wav`. It warns if his line gets pushed, which would break lip sync | Synthetic take (room tone above −42 dBFS): the cut starts at the offset (first 30 ms ≤ −44 dB, the fade-in) and its length was found at 3.46 s |
| 5 | **done** (producer-approved) | Duck −15 dB with a 0.8 s ramp instead of −30 / 0.4 s; the payoff crescendo ends at 66.8 | Under the lens the bed is −44 dBFS, 28.9 dB under the voice (was 41.5, silent). The peak settles from −19.4 (66.5) to −33.4 (67.25), 14 dB over 0.75 s (was 23 dB in 0.5 s) |
| 6 | **done** | `mix.mjs` default `--music -13`; `tension_gain_db` 4.5. That alone left the results about 10 dB under, so the `drive`/`full` presets were also set to vol 0.85 (were 1.25/1.4) in the plan | Under speech: results lines 12–16 are 13.2–13.9 dB under; line 12 (drive) is 14.2; the problem section is 12.8–18.9 (was 13.2–19.5); the key line 10.2 (was 10.5); the close card 19.3 dB under (was 16.9). Mix −16.2 LUFS, peak −1.1 dBFS |
| 11 (level) | **done, tested** | Vince is matched on speech-gated level (≥ −45 dBFS and within 25 dB of the 95th-percentile window, so room tone is not counted), in two passes because of the limiter. `vo.mjs` prints his level against the narrator's in `vo.wav` | Synthetic take: Vince −14.5 dBFS, narrator −14.4 dBFS in `vo.wav` (within ±1) |
| 4 | **PENDING the clip** | — | Vince's word onsets go into `words.json[16]`, then the animation director updates `SEPARATE`, `FROM_CAUSE`, `BOTH` and 70.26. Re-run `vo.mjs`, `music.py`, `mix.mjs` and the audit |

**Note on the arc after fix 6:** drive and full now sit at about the build's level (bed −27.6 to −28.1 dBFS). The
build through the method is carried by the instruments coming in (bass, snare, hats, lead) rather than by loudness.
The peak on "profitable" still lifts about 5.5 dB above the results.

**When Vince's clip arrives:**
1. Set `EXPERT_SRC` and `VINCE_LENS_OFFSET` (and `EXPERT_IN`) in `video.html`.
2. `node vo.mjs` (it finds his audio itself; add `--vince-take <file>` if the audio is a separate file on the same
   timebase).
3. Move the close line in CAPS to his measured end + 0.7.
4. `node vo.mjs` again.
5. `python music.py`, which follows on its own.
6. `node mix.mjs`.
7. Fix 4, then `node audit.mjs`.

## Fix list (in priority order)

1. **70.89–72.75: dead air and a blank frame between the lens and the close.** Rules 13 and 21.
   - **Measured:**
     - Voice silence 70.80–72.65 (1.85 s).
     - The mix sits at ≤ −60 dBFS from 70.95 to 72.0: the −30 dB duck runs to 72.0 (+0.4 s ramp) after the
       placeholder has finished.
     - Picture static 70.60–72.00 (1.40 s).
     - Then the cream-to-charcoal fade passes through blank frames 72.33–72.73: luma range ≤ 27/255, and flat at 0
       from 72.37 to 72.50. The lens has gone; the wordmark is not up yet.
   - **Cause:** `L17END = CAPS[16][1]` is the end of the 4.5 s slot reserved for Vince (71.94), not the measured end
     of the line (70.89). The duck window `[67.3, 72.0, -30]` is fixed in the plan.
   - **Fix:**
     - Key the lens out, the background fade and the duck end to the line's measured end. For the placeholder that
       means `CAPS[16][1] = 70.95`, close line at 71.60 (0.65 s air), duck `[67.3, 71.05, …]`.
     - Overlap the close with the lens instead of fading through an empty frame. Start the background fade at
       CLOSE − 0.6 and keep the lens cards up until CLOSE − 0.25, so they cross the wordmark's rise (CLOSE − 0.15).
       Check stills at CLOSE − 0.4 … CLOSE + 0.2 for a frame with nothing on it.
     - When Vince's audio arrives, apply the same rule to his measured end.
2. **The close constants do not follow the lens line (plumbing).**
   - `TALK = 72.69`, `LEAN = 75.24` and `DUR = 78.5` are absolute. So are `music-plan.json`'s `dur`, `duck` and
     `calm_at`.
   - `vo.mjs` moves the close audio when Vince's line runs long: it pushes past 5.02 s and reports OVER past 4.5 s.
     The buttons, the URL and the film length would stay where they are, out of sync with "Talk to us" and "Lean AI".
   - **Fix:**
     - Derive them from the close line: `TALK = CLOSE + 0.05`, `LEAN = CLOSE + 2.60` (the narrator's measured
       offsets), `DUR = CLOSE + 3.28 + 2.6`.
     - Write the music plan's `duck`, `calm_at` and `dur` from the same numbers.
     - Re-voice and re-audit after any change to line 17.
3. **Lip sync for Vince's own audio (plumbing).**
   - **How it works now:** for the `VINCE` cue, `vo.mjs` strips the leading audio of `assets/vince-lens.wav` below
     −42 dBFS and lays the first sound at 67.44. The widget seeks `expert-vince.mp4` so that `VINCE_LENS_OFFSET` (set
     by hand) lands at 67.44.
   - **The risk:** a phone or room recording often has room tone above −42 dBFS. Then nothing is trimmed and his
     voice lands late by the length of the lead-in. If it is trimmed, the trim has to equal exactly the offset someone
     typed by hand.
   - **Fix:**
     - Cut `vince-lens.wav` from the take's own audio starting exactly at `VINCE_LENS_OFFSET`, on the same timebase as
       the mp4.
     - For the `VINCE` cue, skip the leading `silenceremove` (keep the trailing one). Add `afade` in 15 ms and out
       40 ms so the cut does not click.
     - Verify with one still per 0.1 s across the line against the waveform (mouth open on "Separate" at 67.44 ± 1
       frame).
4. **The lens picture is timed to the narrator's words, not Vince's.**
   - `SEPARATE 67.49`, `FROM_CAUSE 68.66`, `BOTH 69.97` and `both` at 70.26 come from the placeholder.
   - `words.json` will have no word times for his recording, because edge-tts word boundaries do not exist for it.
   - **Fix:** take his word onsets (whisper word timestamps, or by ear on the waveform), write them into
     `words.json[16]`, and update the four constants and `L17END`. The audit's phrase split on `cue-16.wav` then
     checks them.
5. **The music drops out under the lens, and the peak is cut off.**
   - **Measured:**
     - The music falls from −18.4 dBFS (66.75) to −41.5 dBFS (67.25): 23 dB in 0.5 s, straight after the peak on
       "profitable".
     - It then sits at −50 to −67 dBFS through the lens: 41.5 dB under the voice, which means silent.
     - Rule 21 says the music is present throughout. The script asked for it "ducked fully" under Vince.
   - **Fix:**
     - Duck −15 dB instead of −30. That keeps the bed about 25–28 dB under him, inaudible behind speech but no hole.
     - End the crescendo at 66.8 and start the duck ramp at 66.5 with a 0.8 s ramp, so the peak settles rather than
       cuts.
     - **Producer to confirm** with the employee, since the script said "fully".
6. **The music is too close to the voice in the results.**
   - **Measured:** speech-gated, the bed is 7.3–9.1 dB under the voice on lines 11–15 (48.3–66.1). Against that:

     | Section | Bed under the voice |
     |---|---|
     | Problem | 13–19.5 dB |
     | Key line | 10.5 dB |
     | Two tracks | 10.4–10.8 dB |

   - **Target:** about 14 dB (10 under, ducked 4).
   - **Cause:** `music.wav` itself rises 7.7 dB from tension (−16.5 dBFS) to full (−8.8 dBFS), and `mix.mjs` applies a
     flat −10 dB.
   - **Fix:** re-mix with `node mix.mjs --music -13`, and raise `tension_gain_db` from 1.5 to 4.5 in
     `music-plan.json` so the problem section stays where it is. The results land about 10.5–12 dB under, and the arc
     is still audible. Alternatively, lower the `drive`/`full` layer gains 3–4 dB in `music.py`. Re-measure.
7. **10.62–12.50: the fill-rate chip is late and too short.** Rules 14 and 18.
   - "Fill rate ~75%" (`chipFill`) comes on at 11.85, which is +1.23 s after "three items in four" (10.62). It is on
     screen only 0.65 s (11.85–12.50).
   - **Fix:** `win($('chipFill'), THREE_IN_FOUR + 0.3, 12.3, …)`, which is on at about 11.1 and readable for 1.4 s.
8. **The picture is frozen except for the widget clip.** Rule 13.
   - **22.35–24.40 (2.05 s),** under "October twenty-second, Vince found the cause". The script's gap analysis "filling
     in" is not animated; the one-pager sits still until `hlCrews` at 24.55. Fix: write in the root-cause cell on
     "found the cause" (23.46–23.96), for example a row typing in or a highlight drawing across it.
   - **27.10–28.70 (1.60 s),** under "had changed. The warehouse system's". Fix: start the `hlWms` move to the
     886-location panel at 28.35 instead of `LOGIC` 28.72 (still within 0.4 s of "logic"), or add a slow scroll on the
     location table.
   - Both pass `audit.mjs` only because the widget `<video>` counts as motion.
9. **Advisory: "Profitable" is alone for only 1.45 s** (65.65–67.10). If the payoff is treated as a key line (rule 8,
   2.5 s), hold it to about 68.1 and slide the lens and close +1.0 s. Fix 1 frees about 1.0 s, so the film stays at
   about 78.5 s.
10. **Advisory: section-break air is 1.10 s** before lines 2, 6 and 13 (the plan had 0.5 s), and 0.70 s elsewhere. The
    picture moves through every one of these gaps, so none is dead air. If fix 9 needs time, take 0.3 s from each.
11. **Advisory for the swap-in.**
    - `EXPERT_IN` is `{0, 0, 0}`, so the three muted appearances would all show the first seconds of the take,
      including its 3–4 s of quiet. Set them to three different beats.
    - Measured widget windows:

      | Window | Time | Length |
      |---|---|---|
      | A | 0.65–7.43 | 6.8 s |
      | B | 21.95–30.02 | 8.1 s |
      | C | 36.31–52.30 | 16.0 s |
      | D | 67.14–71.99 | 4.9 s |

      That is about 36 s in all (`VINCE-RECORDING.md` says 35), so a 50 s take still covers it with 30% margin.
    - `vo.mjs` matches Vince's level by whole-file mean volume, pauses included, so a slower read gets over-boosted.
      Match on the speech-gated level instead (the 50 ms windows over −45 dBFS that `mix.mjs` uses). The target is
      −14.9 dBFS ± 1 dB.

## Phrase-by-visual table

- Phrases are from silencedetect inside each line (`audit.mjs` §2); word times are from `words.json`.
- "On" is the first sweep frame where the element's effective opacity is ≥ 0.5.
- Δ = on − the naming word's start.

| Line | Phrase (time) | Naming word | Visual | On | Δ | OK |
|---|---|---|---|---|---|---|
| 1 | "Vince, now a Waya co-founder," 0.60–2.60 | Vince 0.65 | expert widget + name card | 0.85 | +0.20 | ✓ |
| 1 | "was at Cheetah Technologies," 2.94–4.23 | Cheetah 3.17 | eyebrow; warehouse draws from 3.27 | 3.45 | +0.28 | ✓ |
| 1 | "a food distributor that had bought three others." 4.40–6.68 | three 5.90 | 3 acquired buildings / chip "+3 regional" | 6.05 / 6.45 | +0.15 / +0.55 | ✓ |
| 2 | "When the rebuilt warehouse went live," 7.78–10.56 | rebuilt 8.02 / went 9.08 | racking draws / go-live stamp | 8.02 / 9.20 | 0.00 / +0.12 | ✓ |
| 2 | "customers got three items in four." 10.74–11.89 | three 10.62 / four 11.43 | pick list / SHORT row | 10.55 / 11.60 | −0.07 / +0.17 | ✓ |
| 2 | same | three 10.62 | chip "Fill rate ~75%" | 11.85 | **+1.23** | **✗ fix 7** |
| 3 | "Pallets of fresh food rotted out back." 12.59–14.66 | Pallets 12.64 / rotted 13.77 | dumpster + forklift / pallet tips | 12.65–12.80 / 13.77 | ≤ +0.16 / 0.00 | ✓ |
| 3 | same | fresh 13.07 | chip "Shrink 28%" | 13.30 | +0.23 | ✓ |
| 4 | "Frozen pizza dough sat out" 15.36–16.77 | Frozen 15.41 / sat 16.27 | box / label / chip | 15.60 / 15.95 / 16.50 | +0.19 / +0.54 / +0.23 | ✓ |
| 4 | "until the yeast woke up." 16.96–18.08 | yeast 17.27 | box swells (puff) | 17.40 | +0.13 | ✓ |
| 5 | "It was burning about a million dollars a month." 18.78–20.80 | burning 19.04 / million 19.64 | counter (climbs 19.04→20.87) / sub | 18.95 / 19.80 | −0.09 / +0.16 | ✓ |
| 6 | "On October twenty-second," 21.90–23.10 | On 21.95 / October 22.06 | widget (COO card) / gap analysis | 22.15 / 22.20 | +0.20 / +0.14 | ✓ |
| 6 | "Vince found the cause." 23.44–24.42 | — | nothing new; static outside the widget 22.35–24.40 | — | — | **fix 8** |
| 6 | "Not the crews." 24.85–25.59 | Not 24.85 | "Crews?" highlight / strike | 24.55 / 25.00 | −0.30 / +0.15 | ✓ |
| 7 | "The building had changed." 26.29–27.26 | changed 26.83 | system screen / outline on the new rows | 26.50 / 27.00 | — / +0.17 | ✓ |
| 7 | "The warehouse system's logic never did." 27.77–29.72 | logic 28.72 | outline → 886 panel; caption swaps | 28.72 | 0.00 | ✓ (1.6 s still before it, fix 8) |
| 8 | "The crews fixed the building" 30.42–31.30 (approx.) | The 30.47 | key line 1 (widget gone at 30.20) | 30.65 | +0.18 | ✓ |
| 8 | "by day," | by 31.70 | sun | 31.85 | +0.15 | ✓ |
| 8 | "and the system undid it" | and 32.52 | key line 2 | 32.75 | +0.23 | ✓ |
| 8 | "by night." –34.31 | by 33.80 | sun → moon | 33.80–34.05 | 0.00 | ✓ (both lines on 3.0–5.1 s) |
| 9 | "So: two tracks, at once." 36.01–37.89 | So 36.06 / two 36.67 | title, widget, tracker / lane labels | 36.45–36.75 / 36.90 | +0.39 / +0.23 | ✓ |
| 10 | "Track one," 38.59–39.27 | Track 38.64 | lane-1 ring | 38.80 | +0.16 | ✓ |
| 10 | "by hand:" 39.62–40.10 | by 39.58 | count sheet | 39.80 | +0.22 | ✓ |
| 10 | "the whole company counting stock in the freezer," 40.49–42.49 | whole 40.54 / counting 41.15 | highlight / columns fill 41.15–41.87 | 40.70 / 41.15 | +0.16 / 0.00 | ✓ |
| 10 | "and Na'ama sleeping at the warehouse." 42.77–44.73 | Na'ama 42.89 | Na'ama on the cot (z's loop) | 43.20 | +0.31 | ✓ |
| 11 | "Track two rebuilt the system's logic." 45.43–47.58 | Track 45.48 / rebuilt 46.06 / logic 47.03 | slotting screen / zone highlight / one-row highlight | 45.70 / 46.20 / 47.20 | +0.22 / +0.14 / +0.17 | ✓ |
| 11 | (end) | — | tracker turns | 47.70 | — | ✓ |
| 12 | "Then barcode checks that stop mistakes," 48.28–50.30 | barcode 48.50 / stop 49.41 | scanner / "scan blocked" | 48.80 / 49.55 | +0.30 / +0.14 | ✓ |
| 12 | "and daily standard work." 50.57–51.70 | daily 50.66 | standard-work sheet | 50.95 | +0.29 | ✓ |
| 13 | "Customers got ninety-nine items in a hundred." 52.80–55.27 | Customers 52.85 / ninety-nine 53.52 | full pick list / card number | 52.90 / 53.70 | +0.05 / +0.18 | ✓ |
| 14 | "Lost stock fell to two percent," 55.97–57.49 | Lost 56.02 / two 56.85 | card 2 / number | 56.20 / 57.00 | +0.18 / +0.15 | ✓ |
| 14 | "order errors to three." 57.89–59.07 | order 57.89 / three 58.59 | card 3 / number | 58.05 / 58.75 | +0.16 / +0.16 | ✓ |
| 15 | "The burn fell to two hundred sixty thousand a month by March." 59.77–62.85 | burn 59.89 / thousand ends 61.75 / by 62.14 | counter runs down / lands $260K / "Mar 2023" | 59.95 / 61.75 / 62.35 | +0.06 / 0.00 / +0.21 | ✓ |
| 16 | "By October twenty twenty-three," 63.55–64.99 | October 63.74 | "Oct 2023" | 63.95 | +0.21 | ✓ |
| 16 | "it was profitable." 65.28–66.14 | profitable 65.46 | "Profitable" | 65.65 | +0.19 | ✓ (alone 1.45 s, fix 9) |
| 17 | "Separate the symptom from the cause," 67.44–69.22 | Separate 67.49 / the (cause) 68.66 | title, widget, cards / cards part / ≠ | 67.35–67.40 / 67.49 / 68.85 | −0.09 / 0.00 / +0.19 | ✓ (narrator timing, fix 4) |
| 17 | "then work both at once." 69.54–70.89 | both 69.97 / at 70.26 | arrows draw / "Work both at once" | 69.97 / 70.45 | 0.00 / +0.19 | ✓ |
| 18 | "Talk to us," 72.64–73.30 | Talk 72.69 | wordmark (from 72.49) / "Schedule a Call" | 72.75 / 72.95 | +0.06 / +0.26 | ✓ (blank frames just before, fix 1) |
| 18 | "or run the same methods yourself with Lean AI." 73.68–75.92 | Lean 75.24 | "See Lean AI" / url | 75.45 / 75.90 | +0.21 | ✓ |

**No visual under the wrong line.** Every element that is on screen starts inside, or within 0.4 s before, the line
that names it.

## Silences in the voice track (50 ms windows < −45 dBFS, > 0.45 s) and what the picture does

| Silence | Length | Picture | OK |
|---|---|---|---|
| 0.00–0.60 | 0.60 | opening; widget rises 0.65 | ✓ |
| 6.60–7.80 | 1.20 | acquired buildings settle; widget leaves; warehouse moves left | ✓ |
| 11.80–12.60 | 0.80 | crossfade to the forklift | ✓ |
| 14.55–15.40 | 0.85 | crossfade; blank 15.30–15.47 (0.17 s) | ✓ |
| 18.00–18.80 | 0.80 | dough out, burn counter in | ✓ |
| 20.70–21.90 | 1.20 | counter stops 20.87, fades 21.55; widget in 21.95 | ✓ (0.7 s still) |
| 25.50–26.30 | 0.80 | gap analysis out, system screen in | ✓ |
| 29.65–30.45 | 0.80 | to charcoal, key line rises | ✓ |
| 34.30–36.05 | 1.75 | planned key-line hold (still 34.20–35.50), then fade; blank 35.93–36.33 (0.40 s) | ✓ planned |
| 37.80–38.60 | 0.80 | widget plays; rest still 37.20–38.60 (1.4 s) | ✓ |
| 44.65–45.45 | 0.80 | z's loop; slotting screen in | ✓ |
| 47.50–48.30 | 0.80 | tracker turns | ✓ |
| 51.70–52.80 | 1.10 | demo frame out 52.30, pick list in | ✓ |
| 55.15–56.00, 59.00–59.80, 62.75–63.55 | 0.8 each | card swaps | ✓ |
| 66.05–67.45 | 1.40 | planned "Profitable" hold; lens in from 67.14 (overlap, no blank) | ✓ |
| **70.80–72.65** | **1.85** | **still 70.60–72.00; mix ≤ −60 dBFS; blank 72.33–72.73** | **✗ fix 1** |
| 75.85–78.50 | 2.65 | close card; halo pulses every 1.4 s; music −31.7 dBFS | ✓ |

## Mix levels

- **Voice speaking level (vo.wav):** −14.9 dBFS.
- **Duck per line (raw music − 10 dB − ducked):** 3.0–4.0 dB. Target 4.

| Section | Bed (dBFS) | Bed under the voice in speech |
|---|---|---|
| Tension, lines 1–7 | −29.4 | 13.2–19.5 dB |
| Key-line crescendo | −23.2 | 10.5 dB |
| Two tracks, build | −25.1 | 10.4–10.8 dB |
| Drive / results | −22.6 / −21.7 | **7.3–9.1 dB** (fix 6) |
| Peak after "profitable" | −16.1 at 66.5 | in the hold, no speech |
| Lens (duck −30) | −57.0 | **41.5 dB, silent** (fix 5) |
| Close line | −35.1 | 21.0 dB |
| Close card | −31.7 | 16.9 dB under the voice level (target about 20; audible, acceptable) |

- **Final:** −16.2 LUFS, true peak −1.0 dBFS, LRA 2.9 LU. No clipping.

## Round 2: re-review of the re-rendered cut (2026-10-16)

**What was reviewed:**
- `render/out/video-final.mp4`: 78.52 s, rendered with fixes 1, 2, 7, 8, 9 and 11 applied in `video.html`. The
  coordinator ran `vo.mjs`, `music.py` and `mix.mjs` with their defaults.

**How it was measured:**
- `node audit.mjs`: all checks pass.
- A fresh page sweep at 0.05 s steps.
- A pixel scan of the MP4 itself at 10 fps, with the widget region masked while the widget is up.
- Per-frame full-resolution contrast at every transition.
- Speech-gated levels on the MP4's own audio track.

### Tooling fix made this round (`render/vo.mjs`, `render/music.py`)

- **The problem:** `DUR` on the page is now derived (`CLOSE + CLOSE_SAID + CARD_HOLD`). `vo.mjs` read it with
  `/const DUR = ([\d.]+);/`, which matched only the comment `// const DUR = 78.52;`. It would have gone stale silently
  as soon as the close moved.
- **`vo.mjs` now** reads the page's own `window.__DUR` in headless Chromium, as `render.mjs` and `audit.mjs` already
  do. If no browser starts, it falls back to an *uncommented* literal `const DUR = n;`, and it warns if it finds neither.
- **`music.py`'s `derive()`** now takes the film length from `out/vo.wav`, which `vo.mjs` pads to the page's DUR,
  instead of a second regex on the page.
- **Verified:** the browser path is taken, and `vo.wav` and `music.wav` are bit-identical (same md5) to the
  coordinator's run.

### Prior items

| # | Result | Measured |
|---|---|---|
| 1 audio: no hole at the lens → close | **PASS** | Bed between the lens and the close (70.9–72.6) is −42.6 dBFS at worst (71.0), −33 to −36 dBFS after. Before: ≤ −60 dBFS |
| 1 picture: no frozen frame | **PASS** | The lens group's slow push moves the frame. No static run ≥ 1.0 s after 70.0 (sweep), none ≥ 1.2 s in the MP4 |
| 1 picture: no blank frame before the close | **FAIL (minor)** | 2 near-blank frames, 72.467–72.500 (max deviation 7/255, then 4/255). Before: 72.33–72.73, about 12 frames. The lens group finishes fading at CLOSE − 0.16 = 72.48, exactly as the wordmark starts at CLOSE − 0.15, so they hand off instead of overlapping. **Fix:** end the lens fade at CLOSE + 0.05 (`[CLOSE + 0.05, { opacity: 0 }]`) so it crosses the wordmark's first 0.2 s. Or start the wordmark at CLOSE − 0.3 |
| 1 voice gap before the close | **noted** | Voice silence is still 1.85 s (70.80–72.65), because the close line stays at 72.64 to keep Vince's 4.5 s slot. It is no longer dead air: the music is audible and the picture moves. It shrinks to ≤ 0.7 s once his line fills the slot; re-time the close to his measured end + 0.7 then |
| 2 constants follow the lens line | **PASS** | `TALK = CLOSE + 0.05` and `LEAN = CLOSE + 2.60` give 72.69 and 75.24, matching words.json exactly. DUR is derived. The music plan derives dur 78.52 / duck [67.34, 70.99, −15, 0.8] / calm_at 67.2 |
| 3 Vince lip-sync plumbing | **PASS (ready)** | Tested on a synthetic take in round 1; waiting for the clip |
| 4 Vince's word timings | **PENDING** | Waiting for the clip |
| 5 music under the lens | **PASS** | Bed −44.4 dBFS, 28.9 dB under the voice; the peak settles 14 dB over 0.75 s |
| 6 results about 14 dB under | **PASS** | Lines 12–16: 13.2–14.2 dB under (speech-gated). Problem section 12.8–18.9; key line 10.2; overall 14.4 under speech; duck 3.3–3.9 dB |
| 7 fill-rate chip | **PASS** | On 11.15, +0.53 s after "three" (10.62); on screen 1.35 s |
| 8 frozen under speech (widget masked) | **PASS** | 22.4–23.8, 1.4 s: the root-cause cell reveals on "found" (23.68, Δ 0.00). 27.10–28.30, 1.2 s: `HL_MOVE` 28.35 is −0.37 s from "logic" |
| 9 "Profitable" alone | **unchanged (advisory)** | `prof` is still on screen 65.70–67.15, 1.45 s (`PROF_OUT = L17 − 0.45`). Not a timing failure; a 2.5 s hold would need the lens line +1.05 s. Producer's call |
| 10 section-break air | **unchanged (advisory)** | 1.10 s before lines 2, 6 and 13; the picture moves through all of them |
| 11 swap-in | **PASS** | `EXPERT_IN = {intro: 4, rootCause: 18, tracks: 30}`; speech-gated level matching is in `vo.mjs` |

### Phrase-by-visual table: what changed since round 1

- **Only these rows moved.** Every other row of the round-1 table re-measured identically, to within 0.05 s.
- **No visual is more than 0.7 s off its phrase,** and **none is under the wrong line.**

| Line | Phrase | Word | Visual | On | Δ |
|---|---|---|---|---|---|
| 2 | "customers got three items in four." | three 10.62 | chip "Fill rate ~75%" | 11.15 | +0.53 ✓ (was +1.23) |
| 3 | "Pallets of fresh food rotted out back." | Pallets 12.64 | dumpster / forklift | 12.80 / 12.95 | +0.16 / +0.31 ✓ |
| 6 | "Vince found the cause." | found 23.68 | root-cause cell reveals (clip-path, 0.8 s) | 23.68 | 0.00 ✓ (was nothing) |
| 7 | "The warehouse system's logic never did." | logic 28.72 | outline → 886 panel; caption swaps | 28.35 | −0.37 ✓ |
| 16 | "it was profitable." | profitable 65.46 | "Profitable" | 65.70 | +0.24 ✓ |
| 17 | "Separate the symptom …" | Separate 67.49 | Symptom / Cause cards | 67.55 / 67.60 | +0.06 / +0.11 ✓ (narrator timing; fix 4 pending) |
| 17 | (after the line) | end 70.89 | widget out / title out / cards out | 71.35 / 71.45 / 72.35 | the lens is held under a slow push |
| 18 | "Talk to us," | Talk 72.69 | wordmark / Schedule a Call | 72.75 / 72.95 | +0.06 / +0.26 ✓ |
| 18 | "… with Lean AI." | Lean 75.24 | See Lean AI | 75.45 | +0.21 ✓ |

### Frozen stretches, blank frames and dead air (MP4, widget masked)

**Static ≥ 1.2 s:**

| Stretch | Length | Under speech | Note |
|---|---|---|---|
| 0.7–3.1 | 2.4 s | 2.5 s | Under "Vince, now a Waya co-founder, was at". The widget **is** the subject here (rule 11: it plays video), so this is accepted |
| 22.4–23.8 | 1.4 s | — | — |
| 34.1–35.4 | 1.3 s | — | Planned key-line hold |
| 37.2–38.6 | 1.4 s | — | — |

None of these is over 1.5 s of speech outside the widget.

**Blank or near-blank frames:**

| Stretch | Length | Note |
|---|---|---|
| 0.0–0.6 | 0.6 s | Dark cold open under the music, before the first word. Observation only |
| 15.3–15.4 | 0.17 s | — |
| 18.7 | 1 frame | — |
| 21.9 | 1 frame | — |
| 30.4 | 1 frame | — |
| 35.93–36.23 | 0.3 s | Key line → two tracks, under "So" (36.06); title at 36.45, Δ +0.39 |
| 52.6 | 1 frame | — |
| 63.60–63.77 | 0.17 s | — |
| **72.467–72.500** | **2 frames** | **Item 1 (minor)** |

All are within the 0.8 s blank-crossfade limit. Only the close has the stricter no-blank rule.

**Dead air:** the voice silences are unchanged (0.8–1.2 s between lines; 1.75, 1.40 and 1.85 s at the planned holds and
Vince's slot). Each one now has audible music, −26 dBFS on average in the gaps, and moving picture.

### Levels on the final MP4

| Measure | Value | Target | Result |
|---|---|---|---|
| Loudness | −16.3 LUFS, LRA 3.0 LU | — | ✓ |
| Peak | −1.1 dBFS true peak | no clipping | ✓ |
| Voice speaking level | −14.9 dBFS | even across lines | 1.9 dB spread ✓ |
| Music under speech, results | 13.2–14.2 dB under | ~14 | ✓ |
| Close card | 19.3 dB under the voice level (bed −34.1 dBFS) | ~20 | ✓ audible |
| Lens | 28.9 dB under the voice | ducked, not silent | ✓ |
| Key line | 10.2 dB under | ≥ 10 | ✓ (the crescendo with its lowered lead) |

### Round 2 open items

1. **72.467–72.500:** 2 near-blank frames between the lens and the wordmark. Overlap the fades (fix in the item 1
   row above). This is in `video.html`, so it is the animation director's.
2. **Fix 4 (pending the clip):** Vince's word times. Then re-time the close to his measured end + 0.7, and re-run
   `vo.mjs` → `music.py` → `mix.mjs` → `audit.mjs`.
3. **Advisory, the producer's call:** "Profitable" held 1.45 s (item 9).

## Round 3: Vince's real take wired in (2026-10-18)

**What was reviewed:**
- `render/out/video-final.mp4`: 78.52 s, 1920x1080 at 30 fps, AAC 48 kHz.
- The lens line is now his own voice: take 100.34 → 103.84 s, "You need to separate the symptom from the root
  cause.", at film 67.44–70.94.
- The widget plays `assets/expert-vince.mp4` on the take's timeline (`VINCE_LENS_OFFSET` 100.34; `EXPERT_IN` 9.30 /
  42.20 / 66.20).
- The voice is compressed in `mix.mjs`.

**How it was measured:**
- `node audit.mjs`: all checks pass.
- A fresh page sweep at 0.05 s steps.
- A pixel scan of the MP4 at 10 fps with the widget masked.
- Full-resolution blank-frame check from 70 to 73 s.
- Speech-gated levels on `vo.wav`, `vo-comp.wav` and the MP4's audio.
- Lip sync measured along the whole chain: the iPhone original (`Downloads/IMG_9128.MOV`) → the clip and the take
  audio → the film.

### Lip sync on the lens line: **PASS**, net offset ≈ 3 ms (well under 1 frame, 33 ms)

Each link was measured by cross-correlation: 10 ms audio-energy envelopes for sound, frame-difference motion series
and per-frame pixel matching for picture.

| Link | Measured | Meaning |
|---|---|---|
| `vince-take.m4a` vs the MOV's audio (95–105 s) | 0 ms (corr 1.00) | The take audio is on the original's timeline |
| `expert-vince.mp4` vs the MOV's picture (95–105 s) | +1 frame (corr 0.98) | The clip shows the MOV's content about 33 ms late |
| His voice in the film vs `take(t + 32.90)` (67.0–71.6) | +30 ms (corr 0.93) | The voice is about 30 ms late. The offset is already present in `vo-comp.wav`, so it comes from `vo.mjs`'s cut of the m4a, not from the mix or the encode |
| The widget's picture in the film vs `clip(t + 32.90)` | median 0 frames (pixel match, 106 frames) | The page seeks exactly: `expertClip.currentTime` read in the page at 67.14 / 67.44 / 68.00 / 69.16 / 70.38 / 70.94 / 71.50 is 100.040 / 100.340 / 100.900 / 102.060 / 103.280 / 103.840 / 104.400, equal to t + 32.90 to the millisecond |

- **Net:** the mouth shows MOV(t + 32.867) and the voice plays MOV(t + 32.870), so they are in sync within about
  3 ms.
- **The catch:** this is two roughly 1-frame lags cancelling each other. If either is re-cut (the clip re-encoded,
  or the audio cut changed), re-measure, because one of them alone would be a 1-frame offset. That is still within
  1 frame, so not a failure.
- **The edges of the line are clean:**
  - At 67.14–67.44 the widget shows 100.04–100.34, the quiet before "You". No mouthing ahead of the voice.
  - At 70.94–71.54 it shows 103.84–104.44, the pause before "and attack the latter". The widget is gone (71.54)
    before he would start that phrase.

### No audio in the clip, no doubling: **PASS**

- `expert-vince.mp4` has one video stream and no audio stream. The page's `<video>` is also `muted`.
- `vo.mjs` lays the take audio once: the timing sheet tags the row `[VINCE (own voice)]`, and the narrator
  placeholder is not voiced.
- In the film, the autocorrelation of the audio over his line (lags 15–600 ms) peaks at 0.118, which means no echo
  or second copy.

### His level vs the narrator: **PASS**

| Track | Vince | Narrator |
|---|---|---|
| `vo.wav` (before compression) | −15.0 dBFS | −13.6 to −15.5 dBFS |
| `vo-comp.wav` (after the voice compressor) | −14.9 dBFS | −13.9 to −15.6 dBFS |

He sits in the middle of the narrator's range.

**Final loudness:** −16.0 LUFS, LRA 2.8 LU, true peak −2.1 dBTP. No clipping.

### Line 17 phrase-by-visual (new anchors)

His phrases (silencedetect on `cue-16.wav`) and words (`VINCE-TRANSCRIPT.md`, film = take − 32.90):

| Phrase | Word | Visual | On | Δ | OK |
|---|---|---|---|---|---|
| "You need to separate" 67.44–68.60 | You 67.44 / separate 67.80 | widget (his face, lip-synced) + "The Waya lens" | 67.35 | −0.09 | ✓ |
| same | — | right half empty until the Symptom card: masked static 67.55–69.00 (1.45 s) | — | — | borderline, accepted: his face carries it (see below) |
| "the symptom" 68.95–69.71 | symptom 69.16 | Symptom card slides in | 69.20 | +0.04 | ✓ |
| "from the root cause." 69.85–70.95 | from 69.86 / root 70.16 | ≠ / Cause card | 70.00 / 70.20 | +0.14 / +0.04 | ✓ |
| (after his last word, 70.94) | — | arrows draw 71.04; "Work both at once" | 71.30 | on-screen only | ✓ (holds 1.25 s) |
| exit | — | widget out 71.40; title out 71.50; cards out 72.55 (sinking, darkening); wordmark 72.75 | — | — | ✓ overlap, no blank |

- **Optional:** bring a first visual in on "separate" (67.80), for example the two empty card seats or the ≠ ghosted,
  to break the 1.45 s still on the right. It is at the limit, not over it.
- **Producer note (content, not timing):** the screen still says "Work both at once", which he no longer says. In the
  take he goes on "and attack the latter" (cut, not heard). The on-screen line is the page's lens and still reads
  correctly after "separate the symptom from the root cause".

### Music under his line, lens → close, blank frames

- **Duck (derived from the timing sheet):**
  - The window is [67.34, 71.04] at −15 dB, with 0.8 s ramps.
  - The bed sits at −41 to −55 dBFS under him, 30.2 dB under his speech: inaudible behind him but present. **PASS.**
  - The peak after "profitable" settles from −19.5 dBFS (66.5) to −27.9 (67.25) before his first word.
- **Lens → close (voice silent 70.95–72.64, 1.69 s):**
  - The mix dips to −45.2 dBFS for one 0.25 s window at 71.0, then −40 → −33 dBFS. That is no hole (round 1 was
    ≤ −60 for 1 s).
  - The picture keeps moving (the lens push and sink).
  - The silence is 1.69 s against 0.7 s of air elsewhere. **Optional:** move the close line to his end + 0.7 = 71.64
    (CAPS[17][0]); TALK, LEAN, DUR and the music plan follow automatically. The film would be about 77.5 s.
- **Blank frames 70–73 s: none.** Every frame has content (full-resolution check). Round 2's two near-blank frames at
  72.47–72.50 are gone.

### Regression on the rest: **PASS**

- **Audit:** no OVER, no pushed, air ≥ 0.6 s; phrases unchanged for lines 1–16 and 18; widget tops aligned; names
  checked.
- **Onsets:** identical to round 2 on lines 1–16 and 18 (for example: fill-rate chip 11.15, root-cause reveal 23.68,
  "Profitable" 65.70, wordmark 72.75, Schedule a Call 72.95, See Lean AI 75.45). No visual is more than 0.7 s off its
  phrase, and none is under the wrong line.
- **Frozen, widget masked:**

  | Stretch | Length | Note |
  |---|---|---|
  | 0.7–3.1 | 2.4 s | His real face now plays there, the intro from take 9.30 |
  | 22.5–23.8 | 1.3 s | — |
  | 34.1–35.4 | 1.3 s | Planned hold |
  | 37.2–38.6 | 1.4 s | — |
  | 67.5–69.0 | 1.5 s | Above |

  Nothing else is over 1.2 s.
- **Blank frames elsewhere:** unchanged, all ≤ 0.3 s, the 0.6 s cold open aside.
- **Music under the voice:**

  | Section | Under the voice |
  |---|---|
  | Results, lines 12–16 | 12.5–14.1 dB |
  | Drive, line 12 | 14.3 dB |
  | Problem section | 12.6–19.0 dB |
  | Key line | 10.0 dB |
  | Close line | 23.1 dB |
  | Close card | 17.9 dB, a little louder than the ~20 target after the bus gain; audible, acceptable |

### Round 3 open items

1. **Optional:** re-time the close to Vince's end + 0.7 s (CAPS[17][0] = 71.64). The voice gap drops from 1.69 to
   0.7 s and the film runs about 77.5 s.
2. **Optional:** add a visual on "separate" (67.80) to break the 1.45 s still beside his face.
3. **Producer:** "Work both at once" on screen vs his spoken line (content). "Profitable" hold (item 9, unchanged).
4. **Fix 4: done** by the other session; the words are in `VINCE-TRANSCRIPT.md` and the lens constants use them.

## Round 4: draft 3 (2026-10-18)

**What was reviewed:**
- `render/out/video-final.mp4`: 86.06 s.
- Vince speaks in his own voice three times, all cut from `assets/vince-take-clean.wav` (dereverbed):

  | Moment | Film | Take | Face |
  |---|---|---|---|
  | Key line | 32.48–40.12 | 57.84–65.48 | no face |
  | All-hands | 44.86–52.09 | 81.99–89.22 | on camera |
  | Lens | 75.48–78.98 | 100.34–103.84 | on camera |

- `mix.mjs` skips its voice compressor over his spans.

**How it was measured:**
- `node audit.mjs`: all checks pass (no OVER, no pushed, air 0.5–1.3 s).
- A page sweep at 0.05 s steps.
- An MP4 pixel scan with the widget masked.
- Full-resolution blank-frame checks.
- Speech-gated levels on `vo.wav`, `vo-comp.wav` and the MP4.
- Cross-correlation along take → clean wav → film, and MOV picture → clip → film.
- Echo measured on the gaps inside his speech.

**Note:** I ran `python music.py` once while reading the plan, which rewrites `out/music.wav`. It is deterministic: a
second run gives the same md5 (bdef8393…), and its inputs (the plan and `vo-timing.txt`) predate the final. So
`music.wav` is unchanged from the one in the final mix.

### Measured: pass

| Check | Result | Evidence |
|---|---|---|
| Total ≤ 90 s; card ≥ 2.6 s | **PASS** | 86.06 s; speech ends 83.46; the card holds 2.60 s |
| Loudness | **PASS** | −16.1 LUFS, LRA 3.5 LU, true peak −2.0 dBTP |
| #24: no Vince video 0–6 s | **PASS** | A still (`assets/vince-headshot.jpeg`) in the badge card, 0.80–7.65 |
| #26: no Vince video 22–30 s | **PASS** | The widget is hidden (`display:none`) at 0.5, 3, 23, 30 and 36 s |
| #29: no muted talking video | **PASS** | The widget is up only from 44.86 (fading in as he starts; clip 81.99) to 52.44 (clip 89.57; he stopped at 89.22 and is silent until 90.38), and from 75.18 to 79.6 (clip 100.04–104.36: silent before "You", and the pause before "and attack…"). It is the page's only `<video>` |
| His audio on the take's timeline | **PASS** | clean wav vs `vince-take.m4a`: 0 ms at all three spans (corr 0.98). `vo.wav` and the final vs clean at the cue mapping: 0 ms at all three spans (corr 0.97). The 30 ms lag from round 3 is gone |
| The widget seeks exactly | **PASS** | `expertClip.currentTime` = cue take time + (t − cue start) to the ms at 44.86, 45.0, 46.19, 49.09, 52.09, 52.4, 75.18, 75.48, 77.2, 78.98, 79.5 |
| No doubled voice | **PASS** | Autocorrelation peak (15–600 ms) over each span is 0.128 / 0.131 / 0.144: no second copy. The clip has no audio stream and is `muted`; `vo.mjs` lays each span once |
| #30: echo | **PASS** | See the echo table below |
| His level vs the narrator | **PASS** | Speech-gated in `vo.wav`: Vince −15.0 / −14.8 / −15.0 dBFS; narrator lines −13.6 to −16.1. Uncompressed, he still sits mid-range in `vo-comp` (−14.8 / −14.5 / −14.7) |
| Music under his spans | **PASS** | 22.3 / 26.8 / 29.0 dB under his speech (duck −15 dB, 0.8 s ramps; derived windows 32.38–40.22, 44.76–52.19, 75.38–79.08) |
| Lens → close (voice silent 78.98–80.18, 1.2 s) | **PASS** | Mix −44 dBFS for 0.25 s at 79.0, then −39 → −31. The picture moves; no blank frame 79–80.4 |

**#30 echo, measured on the gaps inside his speech.** "Floor" is the quieter half of each gap; "decay" is the time to
fall 25 dB after the end of a phrase.

| Track | Gap floor, re his speech | Decay to −25 dB |
|---|---|---|
| Raw take | −32 to −39 dB | 20–70 ms |
| `vince-take-clean.wav` | −41 to −53 dB | 0–30 ms |

- The dereverb took about 10–14 dB of room tail out of his pauses and shortened the tails.
- In the final, the gaps are filled by the music bed, not by room: −21 to −28 dB under him on the key line (the dark
  crescendo), −24 to −36 dB elsewhere. The residual tail sits under the bed.

### Phrase-by-visual (every line; Δ = visual on − naming word)

- **Word sources:** `words.json` for the narrator; Vince's take words (transcript) mapped to film time.
- **No visual is more than 0.7 s off its phrase, and none is under the wrong line.**

| Line | Word → visual (on) | Δ |
|---|---|---|
| 1 | Vince 0.65 → badge 0.80; co-founder 1.95 → "now a Waya co-founder" 2.05; Cheetah 3.17 → eyebrow 3.45 / "In 2022 · at Cheetah" 3.35; three 5.90 → acquired buildings 6.05 / chip 6.45 | +0.15 / +0.10 / +0.28 / +0.18 / +0.15 / +0.55 |
| 2 | rebuilt 8.02 → racks draw 8.02; went 9.08 → stamp 9.20; three 10.62 → pick list 10.55 / chip 11.15; four 11.43 → SHORT 11.60 | 0.00 / +0.12 / −0.07 / +0.53 / +0.17 |
| 3 | Pallets 12.64 → forklift scene 12.65; rotted 13.77 → tip 13.77; fresh 13.07 → shrink chip 13.30 | +0.01 / 0.00 / +0.23 |
| 4 | Frozen 15.41 → shelf 15.30 / box 15.60; sat 16.27 → chip 16.50; yeast 17.27 → swell 17.40 | −0.11 / +0.19 / +0.23 / +0.13 |
| 5 | burning 19.04 → counter 18.90; million 19.64 → sub 19.85 | −0.14 / +0.21 |
| 6 | October 22.10 → aisle 21.80 / eyebrow 22.35; went (to the floor) 23.66 → aisle push starts 23.66; found 24.78 → gap analysis 24.90; process 26.10 → "process" 26.20; not 27.00 → "not the people" 27.15 | −0.30 / +0.25 / 0.00 / +0.12 / +0.10 / +0.15 |
| 7 | changed 28.89 → outline 29.05; logic 30.78 → outline moves 30.35 | +0.16 / −0.43 |
| 8 (Vince, no face) | every (day) 32.68 → q1 32.85 / sun 32.80; was fixing 34.62 → q2 34.80; and the IT 36.34 → q3 36.50 / "by night" tag 36.75; them every night 39.14 → q4 39.15 / moon 39.34 | +0.17 / +0.12 / +0.18 / +0.16 / +0.41 / +0.01 |
| 9 | Two 41.42 → lanes 41.55 / title 41.80; Track (one) 43.04 → ring 43.20 | +0.13 / +0.38 / +0.16 |
| 10 (Vince, on camera) | So 44.86 → widget 45.10 / count + crew 45.25; everyone 45.33 → count fills 45.33; executive 46.19 → exec 46.30; sales 46.77 → sales 46.85; operators 47.69 → ops 47.80; 24-7 49.09 → day/night dial 48.95; cleaned 50.97 → tracker turns 51.05 | +0.24 / +0.39 / 0.00 / +0.11 / +0.08 / +0.11 / −0.14 / +0.08 |
| 11 | Na'ama 52.69 → Na'ama 52.65 | −0.04 |
| 12 | Track (two) 54.46 → slotting 54.60; rebuilt 55.04 → zone 55.20; logic 56.01 → one row 56.15 | +0.14 / +0.16 / +0.14 |
| 13 | barcode 57.44 → scanner 57.60; checks 57.86 → blocked 57.90; daily 58.68 → standard work 59.00 | +0.16 / +0.04 / +0.32 |
| 14 | Customers 60.89 → pick list 60.80; ninety-nine 61.56 → number 61.75 | −0.09 / +0.19 |
| 15 | Lost 64.06 → card 64.25; two 64.89 → 65.05; order 65.93 → card 66.10; three 66.63 → 66.80 | +0.19 / +0.16 / +0.17 / +0.17 |
| 16 | burn 67.93 → counter 68.00; by March 70.18 → "Mar 2023" 70.40 | +0.07 / +0.22 |
| 17 | October 71.78 → "Oct 2023" 71.80; profitable 73.50 → "Profitable" 73.75 (alone 1.45 s) | +0.02 / +0.25 |
| 18 (Vince, on camera) | You 75.48 → widget + title 75.40; symptom 77.20 → card 77.25; from 77.90 → ≠ 78.00; root 78.20 → Cause 78.25 | −0.08 / +0.05 / +0.10 / +0.05 |
| 19 | Talk 80.23 → wordmark 80.30 / Schedule a Call 80.50; Lean 82.78 → See Lean AI 83.00 | +0.07 / +0.27 / +0.22 |

### Fix list (Round 4)

1. **Lip sync: his voice leads his mouth by 1 frame (33 ms) on both on-camera spans** (44.86–52.09 and 75.48–78.98).
   This is not over 1 frame, but it is at the limit and in the direction viewers notice most (audio early).
   - **Measured:**
     - Voice: 0 ms against the take, at both spans.
     - Page: seeks exactly.
     - `assets/expert-vince.mp4` shows the original MOV's picture **+1 frame late** (motion cross-correlation at
       81–90 s and 99.5–108.5 s, corr 0.99 / 0.98).
   - **Why it changed:** in round 3 a 30 ms audio lag cancelled this; the clean-wav cut removed that lag.
   - **Fix:** re-cut `expert-vince.mp4` from the MOV one frame earlier, so clip time = take time exactly. That is the
     source fix: re-check B = 0. Or, in `video.html` (the animation director's), add 1/30 s to the clip in-point:
     `x.cue[4] + (x.s - x.cue[0]) + 1/30`. Re-measure after either.
2. **Close card music is too loud:** 15.7 dB under the voice level (target about 20; round 3 measured 17.9).
   - **Fix:** `"calm_level": 0.7` in `music-plan.json` (−3.1 dB from `calm_at`), then `python music.py` and
     `node mix.mjs`.
3. **Two tracks and the results crept up:** the bed is 11.5–12.9 dB under speech on lines 9 and 11–17 (target about
   14; round 3 was 12.5–14.1).
   - The plan is unchanged. The shift comes from `music.py`'s peak normalisation now that the key-line crescendo is
     ducked under Vince.
   - **Fix:** `node mix.mjs --music -14.5` (or make it the default), with `tension_gain_db` 4.5 → 6.0 so the
     problem section stays at 14–17.6 dB under. Item 2 then needs only `calm_level` 0.8. Re-measure.
4. **32.43–32.63: six blank frames** (flat charcoal) open the key line, under Vince's "So" (32.54).
   - This is legal (a blank crossfade ≤ 0.8 s), but his first word lands on an empty frame.
   - **Fix (`video.html`):** bring the sun or `q1` in on "So", or start the dim `replen` at KEY − 0.2.
5. **33.0–34.5: the key line is still for 1.5 s,** at the limit, with no face. Only the slow drift of the dimmed
   background moves between `q1` (32.85) and `q2` (34.80).
   - **Fix (`video.html`):** a cue on "warehousing crew" (33.72), for example the sun starting its arc or a
     highlight under "the warehousing crew".
6. **Advisory:**
   - 75.6–77.0 (1.4 s) is still beside his face on the lens; his face carries it.
   - "Profitable" is alone 1.45 s (item 9).
   - "Work both at once" is on screen but not spoken.
   - The 0.5 s dark cold open is unchanged.
   - The key-line text hold (40.12–41.42) swells the dark crescendo to 5.5 dB under voice level with no speech: this
     is planned, and it ends at the lift on "Two".

### Round 4: fixes 2 and 3 applied (production mode, at the coordinator's request)

**What changed:**
- **File:** only `render/music-plan.json`. `mix.mjs` is back at its `--music -13` default, and `music.py` is
  unchanged.
- **Rebuilt:** `out/music.wav` (md5 12e14971…) and the audio-only test mix `out/audio-final.wav` (−16.0 LUFS, LRA
  3.6, TP −2.0).
- **Not run:** the picture mix.

**First attempt, rejected:** `--music -14.5` with `tension_gain_db` 6.0.
- It overshot the results to 14.7–15.7 dB under, and it moved the problem section 1.5 dB quieter.
- **The reason:** `music.py` normalises to the bed's peak, which is in the dark section. Raising `tension_gain_db`
  lowers everything else by the same amount, so it cannot hold the problem section in place.

**Applied:**
- The bright-section presets were lowered instead:

  | Preset | vol now | was | Change |
  |---|---|---|---|
  | steady | 0.72 | 1.05 | −3.3 dB |
  | build | 0.97 | 1.15 | −1.5 dB |
  | drive | 0.72 | 0.85 | −1.5 dB |
  | full | 0.72 | 0.85 | −1.5 dB |

- `calm_level` 0.6, which is −4.4 dB from `calm_at` 75.24.
- `tension_gain_db` stays at 4.5.

**Measured on the audio-only mix** (speech-gated, the bed under the voice):

| Section | Round 4 final | Now | Target |
|---|---|---|---|
| Problem, lines 1–7 | 15.4 / 14.1 / 14.1 / 17.6 / 12.2 / 14.4 / 10.8 | **identical** | unchanged ✓ |
| "Two tracks, at once. Track one, by hand." (line 9) | 11.5 | 12.9 | ~14. The last 1 dB is the tail of the dark crescendo (it ends 41.30 and its pads release over 1.2 s) under "Two"; it is planned, so I left it |
| Na'ama, track two, barcode (lines 11–13) | 12.3–12.9 | 13.2–14.3 | ~14 ✓ |
| Results (lines 14–17) | 11.8–12.8 | 13.2–14.2 | ~14 ✓ |
| Close line | 20.9 | 25.3 | — |
| **Close card** | 15.7 | **20.1** | ~20 ✓ |
| Under Vince | 22.3 / 26.8 / 29.0 | 22.3 / 28.3 / 33.4 | present ✓ |
| Lens → close dip | −44 dBFS for 0.25 s | −48.5 dBFS for 0.25 s at 79.0, then −43 → −33 | no hole (> −60) ✓ |

- **No doubling:** the autocorrelation peak is 0.145.
- **Next:** the coordinator re-mixes onto the new picture with a plain `node mix.mjs`, and these settings apply.

## Round 5: quick re-check (2026-10-18)

`render/out/video-final.mp4`: 86.06 s, with `CLIP_LEAD = 1/30` and the round-4 music plan.

| Check | Result | Measured |
|---|---|---|
| Lip sync on both on-camera moments (target 0 ± ½ frame) | **FAIL, blocker** | See below |
| Section gaps in the picture mix | **PASS** | Identical to the audio-only test. Problem 15.4 / 14.1 / 14.1 / 17.6 / 12.2 / 14.4 / 10.8; "Two tracks" 12.9; lines 11–17 13.2–14.3; close card 20.1 dB under; under Vince 22.3 / 28.3 / 33.4. −16.0 LUFS, LRA 3.6, TP −2.0 |
| Blank frames 32.4–32.7 | **PASS (minor)** | 2 flat frames left, 32.43–32.47 (was 6); content from 32.50, under "So" (32.54) |
| Blank frames 79.5–80.5 | **PASS** | None. 80.27 is dim (the wordmark rising) but has content |
| "Warehousing crew" cue breaks the 33.0–34.5 still | **PASS** | No still ≥ 1.0 s between 32.5 and 34.9 in the sweep or the masked MP4 scan |
| Total and card hold | **PASS** | 86.06 s; speech ends 83.46, so the card holds 2.60 s |

### Lip sync: the picture is still about 1 frame behind the voice

**Measured end to end:** the film's widget motion against the original MOV's motion, film → take mapping.

| Moment | Picture vs MOV | Correlation | Voice vs take |
|---|---|---|---|
| All-hands | **+1.00 frame** (late) | 0.99 | 0 ms (corr 0.97) |
| Lens | **+1.00 frame** (late) | 0.98 | 0 ms (corr 0.98) |

`CLIP_LEAD` is applied in the page: `currentTime` is the take time + 0.033 at every point checked.

**Why one frame of lead was not enough:** the cue offsets are not whole frames.
- The film → take shifts are 37.13 s (1113.9 frames) and 24.86 s (745.8 frames).
- The browser shows the frame at or before `currentTime`, so about 0.9 / 0.8 of a frame is lost to truncation.
- On top of that, `expert-vince.mp4` is itself 1 frame behind the MOV.

| CLIP_LEAD | Displayed vs the voice |
|---|---|
| none (round 4) | ≈ 1.9 frames late |
| 1/30 (now) | ≈ 0.9 frame late (measured +1.0) |
| **0.05** (1 frame + ½ frame) | **+0.1 / +0.2 frame early** |

With 0.05, the seek lands mid-frame and the floor picks the intended frame: about 3 ms on the all-hands and 7 ms on the
lens.

**Fix (`video.html`, the animation director's):**
- Set `const CLIP_LEAD = 0.05;` (2/30 also works: +0.1 / +0.2 frame). Re-render.
- I re-measure by the same end-to-end method: target 0 ± ½ frame on both moments.

**Blockers:** only this one.

### Round 5 re-check: `CLIP_LEAD = 0.05`, re-rendered (2026-10-18): lip sync **PASS**

Measured the same way as above on the new `render/out/video-final.mp4` (86.06 s).

| Moment | Picture vs the original MOV | Voice vs the take | Net |
|---|---|---|---|
| All-hands (44.86–52.09) | **+0.02 frame** (corr 0.98) | **0 ms** (corr 0.97) | ≈ 0.7 ms |
| Lens (75.48–78.98) | **+0.00 frame** (corr 0.98) | **0 ms** (corr 0.98) | ≈ 0 ms |

- **Target:** 0 ± ½ frame. Both moments are well inside it.
- **Cross-checks:**
  - The page seeks to take time + 0.050 at every point checked.
  - The all-hands pixel match against the clip is consistent: 92 of 111 frames at the mapped frame.
- **No blockers remain** on the audio and sync side.
