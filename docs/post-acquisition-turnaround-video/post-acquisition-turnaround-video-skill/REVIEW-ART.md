# Art review: landscape cut (render/out/video-final.mp4, 78.5 s)

Reviewer: art director, independent review (house rule 24). I did not edit `video.html`.

**Method**
- **Stills.** 221 stills, rendered with captions off: every line start, line start + 0.5 s, and every 0.25 s across every
  transition, plus the key word in each line.
  - Script: `render/out/.review-art-stills.mjs`. It renders like `render.mjs --stills`, but writes to
    `render/out/review-art/ra-<t>.png` so the builder's stills are left alone.
  - Contact sheets: `render/out/review-art/sheets/sheet-00..24.png`.
- **Geometry.** Every visible element's box, opacity and font size, measured with getBoundingClientRect per still
  (`render/out/review-art/meas-*.json`).
- **The final MP4.** Probed with ffprobe, and frames pulled at 5, 44 and 57.2 s (`render/out/review-art/mp4-*.png`).

**Verdict:** the cut holds the house look. The grid is right, the key line stands alone, and the close card is correct.
- **What blocks sign-off:**
  - six double-exposure crossfades, where two text-heavy layers sit on screen at once;
  - the translucent screen caption bar, which lets the screenshot footers show through;
  - the burn counter labelled "Contribution margin", which reads as a profit of $260,000.
- **Effort:** none of these needs new design, and most are one-value changes.

All paths below are relative to the video folder. All times are seconds.

## Fix list

| # | Time | Problem | Evidence | Fix (element · property · value) |
|---|---|---|---|---|
| 1 | 19.0–21.6, 59.8–63.3 | **The burn reads as profit.** The eyebrow over the counter says "CONTRIBUTION MARGIN". On line 15 the screen says "Contribution margin $260,000 a month · Mar 2023", which reads as a positive margin. Only line 5's sub-line says "burn", and line 15's doesn't. | `render/out/review-art/ra-20.85.png`, `ra-62.50.png` | `#burnEye` text → "Contribution margin burn · per month". `#burnSub` → "~$1M / month" (it no longer needs to repeat "contribution margin burn"). `#burn2Sub` → "a month · Mar 2023" can stay once the eyebrow says burn. |
| 2 | every screen, 22–52 | **The caption bar is translucent.** `.screen .cap` is rgba(31,36,34,.86), so the screenshot footer text shows through it as ghost text: "Connected · DC-01 · Validation run 06:12 · User: ops.lead" under the WMS caption, and similar under the count sheet, slotting, scan and standard-work captions. | `render/out/review-art/zoom-29.00-caption.png`, `ra-47.90.png`, `ra-51.75.png` | `.screen .cap` `background: #1F2422` (opaque). Reference 05 has an opaque bar. |
| 3 | 22.0–26.6 | **The gap-analysis caption crops the document.** The bar (y 788–834) covers the bottom of "Causes considered" and the root-cause box. The last row, "…new building", touches the bar, and both boxes lose their bottom border. | `render/out/review-art/ra-25.75.png` | Re-shoot `artifacts/gap-analysis.html` with the viewport 840x600 (+40 px bottom padding), so the caption sits on empty paper. Or set `#gap .cap` to `bottom:-46px` so it hangs below the shot. |
| 4 | 26.29–26.65 | **Double exposure: gap analysis → WMS.** Two dense documents of different widths (1040 vs 1270) are both at about 60–70% for about 0.35 s, and the text interleaves. | `render/out/review-art/ra-26.50.png` | Sequence them, don't cross them. `#gap` window end `L7 - 0.2` with `fo: 0.2`. `#wms` start `L7` with `fi: 0.3`. The widget stays, so there is no blank frame. |
| 5 | 39.58–39.95 | **Double exposure: lane cards → count sheet.** "By hand / Fix the cause" sit over the incoming count sheet. | `render/out/review-art/ra-39.75.png` | `#lane1` and `#lane2` windows end at `BY_HAND - 0.25` (fo 0.25). `#count` keeps its start at `BY_HAND`. |
| 6 | 42.9–43.15 | **The count sheet slides into the widget.** On "Na'ama", `#count` translates −60 px. At 43.00 its left edge is at x 579, 13 px inside the expert widget (30–592). | `render/out/review-art/ra-43.00.png`; meas: `count x 579.4` | In the `#count` transform track, change the last keyframe `translate(-60px, 0px)` → `translate(0px, 0px)` (fade only). Na'ama's own +60 → 0 entrance carries the motion. |
| 7 | 47.45–47.95 | **The tracker ghosts and shifts columns.** `turnaround-tracker.png` and `-turning.png` do not register: the columns differ by about 3–4 stage px, so every value doubles ("75%%", "Oct 17/") during the cross-fade, then visibly jumps. | `render/out/review-art/zoom-47.90-hlCols.png` vs `zoom-38.00-tracker.png` | In `artifacts/turnaround-tracker.html`, set `table-layout: fixed` and explicit column widths, then re-shoot both variants. Until then, cut `#trkTurn` in over 0.15 s instead of 0.5 s. |
| 8 | 47.75–48.85 | **The tracker highlight cuts text.** The `#hlCols` left edge (stage x 1767) runs through the "O" of "Oct 31" and the end of "Oct 24", and its right edge (1883) overruns the card (1882). | `render/out/review-art/zoom-47.90-hlCols.png` | `#hlCols` `left: 331px; width: 113px` (local), so it ends inside the card. |
| 9 | 28.7–30.2 | **The 886 highlight covers "1,743"** in "Showing 1–16 of 1,743". | `render/out/review-art/ra-29.00.png` (x 1515) | Final `#hlWms` keyframe `left: 935px` (was 925) and `width: 317px`. |
| 10 | 55.97–56.3, 57.89–58.2 | **Double exposure on the result cards.** At the moment of swap, "Shrink · lost stock" overlays "Orders with an error", and "~17–18%" overlays "99%+" / "~22%". This breaks "one card at a time" (house rule 14). | `render/out/review-art/ra-56.25.png`, `ra-58.00.png` | `#r1` window end `LOST - 0.3` (fo 0.25). `#r2` window end `ORDER_ERR - 0.3` (fo 0.25). Starts unchanged. |
| 11 | 65.46–65.8 | **"Profitable" collides with "Oct 2023".** "Oct 2023" is still at its raised, scaled position (−50 px, 1.25×) when "Profitable" rises into the same band, and the words overprint. | `render/out/review-art/ra-65.50.png` | Move the `#profDate` track's settle to `[PROFITABLE - 0.45 … PROFITABLE + 0.05]`, and start `#prof` at `PROFITABLE + 0.05`. "Oct 2023" is then home before the word arrives. |
| 12 | 67.14–67.9 | **The lens cards are illegible while stacked.** "Symptom" and "Cause" start at the same x, so the screen reads "SyCausem / shthe system's logick" for about 0.7 s while Vince speaks. | `render/out/review-art/ra-67.50.png` | `#cCau` opacity 0 until `SEPARATE`, then fade in over 0.2 s while it slides right. At the start, only "Symptom" is seen, and it splits into two. |
| 13 | 15.4–18.4 | **The dough scene muddles and sits off-centre.** The puffed dough's outline lets the upper shelf line run straight through it. The group (shelf 737–1183 + chip 1240–1714) is centred at x 1225, leaving 700 px empty on the left. | `render/out/review-art/ra-17.60.png` | In `#dPuff`'s first path, add `fill="#121517"` so it hides the shelf behind it. Move `#dough` `left` 700 → 450 and `#chipDough` `left` 1240 → 990 (the group is then centred). |
| 14 | 3.6–7.8 | **The line-1 chip aligns to nothing.** "+3 regional distributors · ~$24M revenue" runs x 1180–1794, but the warehouse ends at 1668 and the eyebrow starts at 700. | `render/out/review-art/ra-6.50.png` | `#chipAcq` `left: 730px` (the warehouse's ground line). |
| 15 | 39.6–52.3 | **The bottom edge of the centre column jumps on every swap.** Measured heights: count 420, Na'ama 420, slotting 522, scan 475, standard work 372. That gives bottoms at 560 / 662 / 615 / 512, while the widget bottom is at 702. The frame reads as unsettled. | `render/out/review-art/sheets/sheet-15.png`, `sheet-16.png` | Give `#count, #naama, #slot, #scan, #std` a fixed `height: 560px` with `background: #fff`, the image top-aligned and the caption at the bottom. Every centre screen then ends at 700, level with the widget, as in reference 05. |
| 16 | 30.42–30.52, 12.3–12.6 | **Two small overlaps.** The key line's first words sit over the fading WMS screen for 0.1 s. The forklift scene's ground line crosses the fading pick-list chip. | `render/out/review-art/ra-30.50.png`, `ra-12.50.png` | `#wms` window end `KEY - 0.4`. In the forklift track, start `#fkDump` / `#fkGround` / `#fkMove` 0.15 s later (`PALLETS - 0.05`). |
| 17 | 22–52 | **The caption type is below the film's own minimum.** The screen caption bars are 17 px, and ART.md sets 20 px as the minimum for typeset text. At 1080p they read, but they are the smallest typeset words in the film. | meas: `wmsCap fs 17px` | `.screen .cap` `font-size: 20px; padding: 12px 20px`. Each caption still fits on one line at 780 wide; the longest ("TRACK 2 · FIX THE CAUSE · fixed slots…") measures about 700 px at 20 px. |

## Measured and passing

- **Demo frame (house rule 10):** every `data-col` element tops out at y 140.0–140.3.
  - The widget is 562x562 at x 30 in all four appearances, the same seat each time (house rule 11).
  - The column gaps are equal: widget → centre 28 px, centre → tracker 28 px.
  - The section title sits at top 48, 56 px, and never overlaps the frame.
- **Key line (house rule 8):** both lines are fully on together for 2.58 s (32.92–35.50).
  - It is centred at 76 px, with "by day" in mustard and "by night" in #F08A2C.
  - The texture is at 0.03 opacity, and nothing else is on screen.
- **Blank and flat frames:** every one is ≤ 0.5 s: 0.0–0.7 (open), 18.45–18.85, 21.55–22.0, 35.95–36.1, 52.6–52.8.
  - Lens to close takes 0.6 s.
  - The wordmark starts at 72.49, 0.15 s before the close line (house rule 13).
- **Close card:** the wordmark, then "Have a problem like this one?" in 56 px cream, then "Schedule a Call" filled and
  first with a pulsing halo, then "See Lean AI" outlined, then "wayaframes.com".
  - The primary button is rust, not the mustard that ART.md asked for. The site's own Schedule a Call button is
    `btn-rust` (case-studies/post-acquisition-turnaround/index.html), so rust is correct and ART.md was wrong.
    I have recorded this as a correction, not a fix.
- **Final MP4:** 78.50 s, 1920x1080, 30 fps, AAC audio. Frames at 5, 44 and 57.2 s have no captions.

## Visual items in INSTRUCTIONS.md

| # | Item | Result | Evidence |
|---|---|---|---|
| 2 | 60–90 s | **PASS**: 78.50 s | ffprobe |
| 3 | Landscape only; no portrait yet | **PASS**: 1920x1080, no portrait layout rendered | ffprobe |
| 5 | Waya house look | **PASS with fixes 1–17**: the palette, type, demo frame and close match the reference frames | sheets, `ra-47.90.png` vs `reference/05` |
| 6, 15 | Vince named as a Waya co-founder; line 1 "now a Waya co-founder" | **PASS**: the widget bar reads "Vince · now a Waya co-founder · in 2022, at Cheetah" | `ra-6.50.png` |
| 7, 9 | Vince clip; clearly marked placeholder until supplied | **PASS (placeholder)**: hazard stripes and "Vince — clip to come / placeholder · swap for Oren's clip" in all four appearances. It must be swapped before delivery. | `ra-1.10.png`, `ra-44.00.png`, `ra-69.00.png` |
| 10 | Cheetah named as text, no invented logo | **PASS**: the eyebrow reads "FALL 2022 · CHEETAH TECHNOLOGIES", and the screens read "Cheetah — DC-01" / "Cheetah DC-01". There is no logo anywhere. | `ra-11.75.png`, `ra-25.75.png` |
| 12 | One Na'ama beat, spelled Na'ama | **PASS**: 43.0–45.2, "Na'ama · co-founder · 16-hour days", asleep on a cot, under the caption "Na'ama slept at the warehouse" | `ra-44.00.png` |
| 16 | "took over as COO" on screen | **PASS**: the widget bar reads "Vince · took over as COO" from 21.95 to 30.0 | `ra-25.75.png` |
| 17 | Schedule a Call primary | **PASS**: filled, first, with a halo. Rust matches the site's own button. | `ra-77.00.png` |
| HR 20 | No captions in the final | **PASS** | `render/out/review-art/mp4-check.png` |

## Judgment calls Oren may want to veto

1. **The empty lower third through the demo frame (36–52 s).** Nothing sits below y 700, and the centre screens stop
   at 510–660. Reference 05 has the same shape, so I left it. Fix 15 levels the bottoms. Filling the space would mean
   larger screens, which the house frame doesn't do.
2. **The replenishment chart behind the key line** shows as a faint panel with bars, even at 3%. It is texture only.
   Dropping it (`#replen` peak 0) makes the key line cleaner still.
3. **The charcoal ↔ cream cross-fades (36.06–36.8, 72.0–72.6)** pass through a flat warm grey for about 0.3 s. That is
   inside the rules. A 0.4 s fade, or a left-to-right wipe, would look crisper.
4. **"Profitable" is fully on for only about 1.1 s** (65.8–66.94). That is shorter than the 1.2 s hold after the voice
   that ART.md planned. Holding to about 67.3 means starting the lens 0.3 s later.
5. **Line 3's picture (one box with an orange blob)** reads as "a box tipped into a dumpster" more than "pallets of
   fresh food rotted". Two stacked pallets with fog-coloured, browned produce would read better. This is a new SVG,
   so it is optional.
6. **The opening:** the widget is alone on the left from 1.0 to 3.2, with two-thirds of the frame empty until
   "Cheetah". It is honest to the words. The alternative is to bring the eyebrow in on "Vince".
7. **The line-1 eyebrow** (the only place the company name is spelled out in full) is 20 px fog caps. Raising it to
   24 px cream would make the naming Oren asked for more visible.
8. **Before "See Lean AI" arrives** (72.7–75.2), the lone "Schedule a Call" button sits left of centre in the slot it
   will share. It is accepted as is: it keeps the button still.
9. **The tracker shows an "On-time delivery" row** (24% → 67%) that the voice never mentions. FACTS.md supports
   "as low as 24%". The weekly values in between are invented and already flagged.

## Stills that best represent the cut

- `render/out/review-art/ra-25.75.png`: the root-cause frame. The widget sits in the seat, the gap analysis has
  "crews" struck, and the root cause is filled in.
- `render/out/review-art/ra-34.30.png`: the key line alone, with the sun turned to a moon.
- `render/out/review-art/ra-47.90.png`: the demo frame (widget, slotting model, tracker turning amber). This still
  also shows fixes 2, 7 and 8.
- `render/out/review-art/ra-77.00.png`: the close card.

---

## Round 2 (re-review after the animation director's fixes, 2026-10-16)

**What was checked**
- **Renders:** `render/out/video-final.mp4` (78.52 s) and `render/out/video-nocap.mp4`.
- **Stills:** 258 fresh stills with captions off, in `render/out/review-art-r2/`:
  - 0.25 s steps across every transition;
  - the whole of 21.25–30.0 (the root-cause write-in and the 886 move) and 63.0–73.5 (the Profitable hold, the lens,
    and the lens → close transition);
  - every line start and line start + 0.5 s.
- **Contact sheets:** `render/out/review-art-r2/sheets/sheet-00..28.png`.
- **Geometry:** measured per still, in `render/out/review-art-r2/meas-*.json`.
- **The final MP4:** frames pulled at 25.75 and 47.9 s (`render/out/review-art-r2/mp4-check.png`). They match the page
  and show no captions.

### Round 1 items

| # | Item | Result | Evidence (in `render/out/review-art-r2/`) |
|---|---|---|---|
| 1 | Burn reads as profit | **PASS** | The eyebrow reads "CONTRIBUTION MARGIN BURN · PER MONTH" on both appearances; the sub-lines read "~$1M / month" and "a month · Mar 2023". `ra-20.85.png`, `ra-62.50.png`. |
| 2 | Translucent caption bar | **PASS** | The bar is solid, with no footer text showing through on the WMS, count, slotting, scan or standard-work screens. `zoom-29.00-886.png`, `ra-41.90.png`. |
| 3 | Gap-analysis caption crops the document | **PASS** | Both boxes now close above the bar, which sits on empty paper. `ra-25.75.png`. |
| 4 | Gap → WMS double exposure | **PASS** | The two screens no longer overlap: at 26.29 the centre is empty (the widget stays), and at 26.50 the WMS screen is alone at 0.7. `ra-26.29.png`, `ra-26.50.png`. |
| 5 | Lane cards → count sheet | **PASS** | The lanes are gone before the count sheet rises (at 39.75 the count sheet is at 0.42 and no lanes are left). `ra-39.50.png`, `ra-39.75.png`. |
| 6 | Count sheet slides into the widget | **PASS** | It fades in place: at 43.00 it is at x 620, opacity 0.36. `ra-43.00.png`. |
| 7 | Tracker ghosting / column shift | **PASS** | The re-shot variants register: no doubled values during the turn, and no jump after it. `zoom-47.50-tracker.png`, `zoom-48.25-tracker.png`. |
| 8 | Tracker highlight cuts text | **PARTIAL** | The outline now spans stage x 1756–1883 (`left:325px; width:121px` plus a 3 px border, because `.hl` is not border-box). Its right edge still runs 1 px past the card (1882), and its inner left edge grazes the "O" of "Oct 31". Fix: `#hlCols` `left:322px; width:120px` gives 1752–1878, which clears both. `zoom-48.25-tracker.png`. |
| 9 | 886 highlight covers "1,743" | **PASS** | "Showing 1–16 of 1,743" is clear. See new issue N1 for the outline's bottom edge. `zoom-29.00-886.png`. |
| 10 | Result-card double exposure | **PASS** | One card at a time: at 56.00 the right side is empty, and at 58.00 only `r3` is up, at 0.37. `ra-56.00.png`, `ra-58.00.png`. |
| 11 | "Profitable" / "Oct 2023" collision | **PASS** | "Oct 2023" settles at 65.25, before "Profitable" rises, so they no longer overprint. "Profitable" is fully on for about 1.2 s (65.8–67.0). `ra-65.25.png`, `ra-65.75.png`, `ra-66.50.png`. |
| 12 | Lens cards illegible while stacked | **PASS** | Only "Symptom" shows while the cards are stacked (`cCau` at 0.05 at 67.50), then they split. `ra-67.50.png`, `ra-67.75.png`. |
| 13 | Dough scene muddled and off-centre | **PASS** | The puff now hides the shelf line behind it. The group runs x 490–1465, centred at 977. `ra-17.75.png`. |
| 14 | Line-1 chip aligns to nothing | **PASS** | The chip is at x 730, on the warehouse's ground line. `ra-6.50.png`. |
| 15 | Centre-screen bottoms jump | **PASS** | All five centre screens (`count`, `naama`, `slot`, `scan`, `std`) measure 782x562 at y 140, so each ends at 702, level with the widget. `ra-41.90.png`, `ra-51.75.png`. |
| 16 | Small overlaps | **PASS** | The WMS screen is gone before the key line (30.42), and the forklift does not enter until the pick list has faded (12.50–12.75). `ra-30.42.png`, `ra-12.59.png`, `ra-12.75.png`. |
| 17 | Caption type 17 px | **PASS** | The captions are 20 px and each fits on one line. Measured: `wmsCap` 20px. |

### Regression pass (every scene start and line start)

- **Demo frame:** every `data-col` element still tops out at 140. The widget is 562x562 at x 30 in all four
  appearances.
- **Key line:** fully on 32.92–35.50 (2.58 s), alone.
- **No new blank or flat frames longer than 0.5 s.**
  - Lens → close: the lens cards now stay up through the background fade into the wordmark, so there is no blank frame.
  - The wordmark is up from 72.49 (CLOSE − 0.15).
- **Root-cause write-in (22.3–25):** the root-cause text writes in cleanly, and the crews strike lands on "Not the
  crews".
- **886 move at 28.35:** the outline travels from the no-dimension rows to the 886 panel ahead of "never did", as
  intended.
- **Fill-rate chip at 10.92:** it rises with the pick list. Fine.
- **Vince's widget** stays up until 71.49, after his measured audio ends (70.89). With the real clip, his face is on
  screen for the whole lens line.
- **Close card:** unchanged and correct. Schedule a Call is primary.

### New issues

| # | Time | Problem | Evidence | Fix |
|---|---|---|---|---|
| N1 | 28.7–30.2 | The 886 outline's bottom edge sits under the caption bar. The outline runs y 362–861 and the bar starts at 845, so the box reads as open at the bottom. | `render/out/review-art-r2/zoom-29.00-886.png`; meas: `hlWms y 362 h 499`, `wmsCap y 845` | Final `#hlWms` keyframe `height: 470px`, so it ends at y about 838. |
| N2 | 59.8–63.3 | The burn eyebrow now carries the meaning ("…BURN · PER MONTH"), but on cream it is 20 px fog, about 1.6:1. It is the faintest text in the film, on the line that matters most. | `render/out/review-art-r2/ra-62.50.png` | `#burnEye` `color: var(--stone)` while the stage is cream, or for both appearances. Stone also reads on cold. |
| N3 | 50.7–52.3 (also 41–43) | A side effect of fix 15: the standard-work shot (372 tall) inside the 560 frame leaves a 180 px empty white band above the caption, which reads as an unfinished page. The count sheet leaves about 90 px. | `render/out/review-art-r2/ra-51.75.png` | Optional. Re-shoot `standard-work.html` at viewport 990x620, so the sheet fills the frame (add the "weekly review" footer rows it already has). Or accept it: the page reads as a document with whitespace. |

### Judgment calls (new this round; the round-1 list still stands)

- **The lens → close fade:** the paper-coloured lens cards stay bright while the background darkens through grey
  (72.0–72.4). They also push in to 1.045. That avoids a blank frame, and it is fine. A simpler alternative is to fade
  the cards with the background.

### Round 2 verdict

- **15 of 17 PASS. 1 PARTIAL** (#8, a one-value fix). **3 new minor issues** (N1, N2 small; N3 optional).
- **Nothing blocks.** The cut can go to Oren after N1, N2 and #8, which are three one-line changes. The Vince
  placeholder must still be swapped before delivery.

**Stills that best represent the cut, round 2** (all in `render/out/review-art-r2/`):

| Still | Shows |
|---|---|
| `ra-25.75.png` | The root-cause frame, with the caption now on paper |
| `ra-34.30.png` | The key line alone |
| `ra-41.90.png` | The demo frame with level bottoms and a solid caption |
| `ra-77.00.png` | The close card |

---

## Round 3 (real Vince clip, re-timed lens scene, 2026-10-18)

Video folder moved to `post-acquisition-turnaround-video-skill/`. 145 fresh stills (captions off) in
`render/out/review-art-r3/`: every line start and +0.5 s, every 0.5 s across all four widget appearances, every 0.25 s
across 66.5–73.5, plus the round-1/2 key frames. Widget crops: `render/out/review-art-r3/sheets/widget-0..4.png`;
regression sheet: `sheets/regression.png`. Final MP4 78.52 s, 1920x1080; frame at 41.9 s matches the page, no captions.

### Vince in the widget

| Check | Result | Evidence |
|---|---|---|
| Face crop, all four appearances (0.65–7.4, 21.95–30.0, 36.3–52.3, 67.14–71.54), start / mid / end | **PASS**: seated, head and shoulders, eyes at about 40% of the square, face centred; same scale every appearance; no stand-up, cut, look-away or frame-edge oddity in 97 sampled frames | `sheets/widget-0..4.png` |
| Bar does not cut the face | **PASS**: the top of his hair sits 15–25 px below the 52 px bar; the face never goes under it | `ra-41.90.png` |
| Headroom | **PASS**: tight but correct for a 560 px talking-head tile (reference 05 is similar) | `ra-41.90.png` |
| Always plays video (rule 11), same size every time | **PASS**: the expression and mouth change frame to frame in every window; 562x562 at x 30, y 140 each time | widget sheets |
| Lens line in his own voice | **PASS (picture side)**: mouth is moving through 67.44–70.94 and the widget holds until 71.54 | `widget-3.png` 67.44–71.00 |

### Lens scene (66.5–73.5, every 0.25 s)

| Check | Result | Evidence |
|---|---|---|
| Sequence on his words | **PASS**: Symptom card in at 69.04, ≠ at 69.81, Cause at 70.04, arrows draw at 71.04, "Work both at once" at 71.14; one element at a time, no stacking | `sheets/sheet-13.png`, `sheet-14.png` |
| "Work both at once" readable ≥ 1.2 s | **PASS (marginal)**: at opacity ≥ 0.5 from about 71.3 to 72.55 (≈ 1.25 s), fully on 71.5–72.3. But the stage starts darkening to charcoal at about 72.14, so it is at full contrast on cream for only about 0.65 s; by 72.5 it is sage on grey. | `ra-71.50.png`, `ra-72.00.png`, `ra-72.50.png`; meas `both` 0.44 / 1 / 1 / 1 / 1 / 0.63 at 71.25–72.50 |
| No blank frame into the close | **PASS**: the lens group (cards + arrows) stays up through the background fade and crosses the wordmark (72.50: lens 0.63, logo 0.02; 72.64: lens 0.17, logo 0.30); "Have a problem like this one?" by 72.75 | `ra-72.50.png`, `ra-72.64.png`, `ra-72.75.png` |
| Close card | **PASS**: unchanged; Schedule a Call primary with halo, See Lean AI, wayaframes.com | `ra-76.00.png`, `ra-78.45.png` |

### Round-2 open items

| # | Result | Evidence |
|---|---|---|
| 8 tracker outline | **PASS**: stage x 1753–1879, inside the card (1882), clear of "Oct 31" | meas 47.90 `hlCols` |
| N1 886 outline bottom | **PASS**: ends at y 838, above the caption bar (845) | meas 29.00 `hlWms` |
| N2 burn eyebrow contrast | **PASS**: stone #6B6F6C on cream for line 15 (pixel 107,111,108), fog on cold for line 5 | `ra-62.50.png` |
| N3 standard-work white band | **open (optional, unchanged)**: the shot was not re-shot; a white band remains above the caption | `ra-51.75.png` |

### Regression pass (every scene start)

**PASS.** All line starts checked (`sheets/regression.png`). Grid, key line alone (32.92–35.50), dough scene,
root-cause frame, 886 panel, demo frame (all `data-col` tops at 140, centre screens 562 tall), results, burn, Profitable
and close are as in round 2. No new overlaps, clipping or blank frames. The real clip's warm cream wall and blue shirt
sit well against both the cold dark scenes and the cream demo frame; no colour clash.

### New in round 3

| # | Time | Problem | Fix |
|---|---|---|---|
| R3-1 | 71.5–72.5 | "Work both at once" gets only about 0.65 s at full contrast before the close's background fade takes it to grey. It is the takeaway line. | Hold the cream background until 72.45 (start the charcoal fade 0.3 s later) and start "Work both at once" with the arrows at 71.04 instead of 71.14. That gives about 1.2 s at full contrast. The close line starts at 72.64, so the 0.2 s wordmark rule still holds, and the 90 s limit has 11 s of room. |
| R3-2 | 67.44–69.04 | For 1.6 s at the start of the lens line, the right two-thirds of the frame is empty (widget + section title only) while Vince says "You need to separate…". Nothing is frozen (his face moves), so this does not break rule 13. | Judgment call. Either leave it (his face carries the beat), or bring the Symptom card in on "separate" (about 68.3) instead of on "symptom". |

### Round 3 verdict

- **Vince clip: PASS at all four appearances.** The framing, crop, bar clearance and motion are right, and nothing odd
  happens in any sampled frame.
- **Lens scene: PASS.** There is one marginal item: R3-1, which is the readability of "Work both at once" against the
  darkening background. The fix is two timing values.
- **Round-2 items: all closed** except optional N3.
- **Regression: PASS.**
- Ready to show Oren. R3-1 is recommended before final; R3-2 is his call.

**Stills showing Vince** (all in `render/out/review-art-r3/`):

| Still | Appearance |
|---|---|
| `ra-41.90.png` | The demo frame, full size |
| `ra-25.75.png` | The root-cause frame |
| `ra-71.00.png` | The lens, with Symptom ≠ Cause on screen |


---

## Round 4 (draft 3, `render/out/video-final.mp4`, 86.06 s, 2026-10-18)

**What was checked**
- **Stills:** 276 new stills with captions off, in `render/out/review-art-r4/`:
  - every line start and line start + 0.5 s;
  - every 0.25 s across every transition;
  - every 0.25 s inside the new scenes: 0–2 (the Vince card), 12.5–18.9 (forklift, dough), 21.75–32.75 (aisle,
    A3, WMS), 44.25–54.5 (10a and Na'ama), and 75–81.5 (lens and close).
- **Flat-frame pass:** 121 extra stills at 0.05 s steps around every dark hand-off, in `review-art-r4/fine/`.
- **Contact sheets:** `review-art-r4/sheets/s-00..22.png`.
- **Geometry:** measured per still, in `review-art-r4/meas-*.json`.
- **The final MP4:** 86.06 s, 1920x1080, 30 fps. Frames pulled at 2.0 and 26.0 s match the page (mean pixel
  difference 1–2 out of 255), with no captions.

### Instructions

| # | Check | Result | Evidence (in `render/out/review-art-r4/`) |
|---|---|---|---|
| 24 | No Vince video 0–6; a still in a non-video card | **PASS**. A horizontal 600x236 badge with a round headshot, "IN 2022 · AT CHEETAH / Vince / now a Waya co-founder". It has no bar and no live dot, so it does not read as a call. It is gone by 7.9. | `ra-1.00.png`, `ra-6.50.png` |
| 26 | No Vince video 22–30 | **PASS**. The first widget frame is 45.00; nothing of Vince shows from 7.9 to 44.9. | meas: `expert` first visible at 45.00 |
| 29 | His talking video only while his own voice plays | **PASS**. The widget is up 45.0–52.3 (voice 44.86–52.09) and 75.25–79.6 (voice 75.48–78.98). The key-line quote (32.48–40.12) is text only. | widget windows in meas |
| 25 | Forklift looks professional, in motion | **PASS**. It is a flat editorial illustration with filled shapes, a lamp pool, a faceless operator in hard hat and hi-vis, and a dumpster with a clipped front. The motion reads: drive-in, forks rise, tip on "rotted", crates arc into the dumpster and disappear behind its front wall (13.75–15.0). See fix 1 for the entry. | `ra-14.25.png`, `sheets/s-02.png` |
| 28 | Na'ama beat professional | **PASS**. A warm office at about 2:10: lamp pool, monitor still red, clock, window onto racking, vest on the hook. She is asleep on her arms under a sage blanket. It reads in its 1.5 s. | `ra-53.25.png` |
| — | Dough (row 4) redrawn | **PASS**. A kraft case on dry-goods shelving, flaps forced open by the risen dough on "woke up"; the label holds still. The group is centred (x 486–1465). | `ra-17.75.png` |
| 27/33 | Row 6 screen text matches "the process, not the people" | **PASS**. The aisle push-in on "went to the floor", the eyebrow "OCT 22 · GO AND SEE", then the A3: Process ringed in mustard, People greyed (not struck), the root cause filled in, caption "ROOT CAUSE · the process, not the people". | `ra-23.50.png`, `ra-27.50.png` |
| 32 | Key line in his voice, text alone, no face | **PASS**. Four-line quote, phrase by phrase on his timing, "— Vince", sun turning to moon. Nothing else on screen above 3%. | `ra-39.50.png` |
| HR 13 | No blank or flat frames longer than 0.5 s | **PASS**. The flat frames are 0.00–0.65 (the opening, as in rounds 1–3), 32.45–32.70 (0.25 s), and 71.60–71.80 (0.2 s). Into the close there is no blank frame: the lens group crosses the wordmark at 80.18. | `fine/` stills |
| HR 10 | Grid | **PASS**. Every `data-col` element tops out at 140 in both layouts: W (centre x 170 w 1062, tracker x 1300) and D (widget x 30, count x 620, tracker x 1430). The row 6–7 screens sit at x 430, y 150, as ART.md specifies (not a demo frame). | meas |
| — | Type ≥ 20 px | **FAIL (one item)**. The badge eyebrow "IN 2022 · AT CHEETAH" is 17 px (fix 6). The widget bar is 19 px, which matches the ART.md type scale and was accepted in round 1. | meas `bdgWhen 17px` |
| — | Clutter in 10a | **PASS, but it is the busiest frame in the film.** Five elements: widget, count sheet, tracker, crew strip, 24-7 dial. They work because they arrive one at a time and the strip sits in empty space below the 700 line. Fix 4 removes the one real collision. | `ra-50.50.png` |
| — | "Work both at once" readable ≥ 1.2 s (≈ 78.7–80.0) | **FAIL (marginal)**. It is at opacity ≥ 0.5 from about 78.95 to 80.10, about 1.15 s, but at full contrast on cream only 79.0–79.85, about 0.85 s. The close's background fade starts about 79.85 (stage pixel 128,131,127 at 80.00). Vince's widget also fades at 79.5, so the left third empties while the line is still being read. | `ra-79.25.png`, `ra-80.00.png`; meas `both` 0.88 / 1 / 1 / 1 / 0.92 / 0.2 at 79.00–80.18 |

### Fix list (round 4)

| # | Time | Problem | Evidence | Fix |
|---|---|---|---|---|
| 1 | 12.25–12.65 | **Double exposure into the forklift.** The forklift drives in under the fading warehouse, stamp and pick list (all three at 0.43 at 12.50). Most of the drive-in is hidden under the pick list, so the new illustration's best motion is lost. | `ra-12.50.png`, `ra-12.59.png` | End `#wh`, `#stamp`, `#pick` and `#chipFill` at 12.10 (fade 0.3 s). Start the forklift drive-in at `PALLETS` (12.64) from an empty stage. |
| 2 | 15.0–15.4 | **Double exposure: forklift into dough.** The forklift and operator show through the shelving (fk 0.17, dough 0.47 at 15.25). | `ra-15.25.png` | `#fk` out by `L4 - 0.15`; `#dough` in at `L4`. |
| 3 | 21.6–21.9 | **Double exposure: burn counter into aisle.** "$1,000,000" sits over the aisle's racking at about 0.4 each. | `ra-21.75.png` | `#burn` and `#burnSub` out at `L6 - 0.45`, then the aisle in from `L6 - 0.15`. |
| 4 | 52.09–52.35 | **The tracker slides back over the count sheet.** At 52.25 the tracker (x 1324) overlaps the count sheet (611–1393, opacity 0.96) by about 70 px, so the tracker's table covers the sheet's right column. | `ra-52.25.png`; meas | Start the tracker's translateX back at `count` out + 0.05 (about 52.35), or fade `#count` out by 52.10, before the slide. |
| 5 | 78.85–80.18 | **"Work both at once" is too short at full contrast** (see the table above). It is the takeaway line. | `ra-79.25.png`, `ra-80.00.png` | Bring `#both` in with the arrows at 78.75 (not about 78.9). Hold the cream background until 80.10 (start the charcoal fade about 0.25 s later). Keep the widget until 79.85, so the frame does not empty first. That gives about 1.3 s at full contrast. If the close has to move, slide it 0.2 s: the film is 86.06 s, so it stays well under 90. |
| 6 | 1.0–7.9 | **The badge eyebrow is 17 px**, below the 20 px minimum. | meas `bdgWhen` | `#bdgWhen` `font-size: 20px` (the badge has room: the text column is 270 px wide). |
| 7 | 75.48–77.25 | **Dead space at the start of the lens (R3-2, unchanged).** For 1.8 s the right two-thirds is empty, only the title and widget, while Vince says "You need to separate…". | `ra-76.25.png` | Bring the Symptom card in on "separate" (about 76.0) instead of about 77.2. Or accept it: his face is moving. |
| 8 | 41.35–41.75 | **The lane card drops before the stage turns cream.** "By hand" lands on the mid-grey of the charcoal → cream fade, before the title, so for 0.3 s it reads as a grey card on grey. | `ra-41.42.png`, `ra-41.50.png` | Start `#lane1` / `#lane2` 0.3 s later (`TWO_TRACKS + 0.3`), after the background is cream and the title is in. |
| 9 | 71.75–73.6 | **"Oct 2023" is alone for about 1.8 s before "Profitable" arrives.** It reads as a caption waiting for its headline. | `ra-72.25.png` | Optional. Start "Oct 2023" at 72.6 (later in "October twenty twenty-three") so the wait is under 1 s. Or set "Oct 2023" at the 56 px payoff size while it waits alone, then let it settle. |

### Judgment calls

The animator's judgment calls 1–5 were not in any file I could find (not in REVIEW notes, ART.md, SCRIPT.md or the
render logs). My verdict on the open choices that ART.md and SCRIPT.md draft 3 record:

1. **Na'ama at the desk, not on a cot.** Keep the desk. It reads as "slept there" in 1.5 s, and a cot needs a wider
   frame.
2. **The crew strip in 10a.** Keep it. It is the only picture of "everyone, executive, sales team, operators". It sits
   below the frame line and arrives figure by figure. Drop the 24-7 dial before the strip if Oren calls it busy.
3. **Two registers** (line art for the building in rows 1–2, illustration for the floor scenes). Keep both. The
   change marks "now we are on the floor", and the building reads as a diagram.
4. **The aisle as the backdrop for the A3 and the WMS (rows 6–7).** Keep it. "Go and see" is literally the setting,
   and the slow drift keeps the frame alive under 10 s of screens. The racking's orange edges are busy at full
   strength, so if anything, dim the aisle to about 0.7 once the A3 is up.
5. **The tracker as the only element that moves between layouts W and D.** Keep it. The centre never morphs. Only
   the timing of the slide back needs fixing (fix 4).

### Round 4 verdict

- **Instructions #24–#33 (visual): all pass.**
- **Illustrations (forklift, dough, Na'ama, aisle, crew):** professional, and they read in motion.
- **Must fix before Oren:** fixes 1–5. They are three double-exposure entries, the tracker collision, and the
  "Work both at once" hold. Each is a timing change of one or two values.
- **Should fix:** 6 and 8.
- **Optional:** 7 and 9.

**Representative stills** (all in `render/out/review-art-r4/`):

| Still | Shows |
|---|---|
| `ra-14.25.png` | The new forklift, mid-tip |
| `ra-27.50.png` | Go and see: the A3 over the aisle |
| `ra-50.50.png` | 10a: Vince on camera, count sheet, crew strip, tracker |
| `ra-79.25.png` | The lens, "Work both at once" |

---

## Round 5 (quick re-check, `render/out/video-final.mp4`, 86.06 s, 2026-10-18)

**What was checked**
- **Stills:** 100 new stills with captions off, in `render/out/review-art-r5/`:
  - every 0.25 s across each changed window;
  - every 0.05 s across 32.4–32.7 and 79.5–80.5;
  - every scene start.
- **Contact sheet:** `review-art-r5/check.png`.
- **Geometry:** measured per still, in `review-art-r5/meas-*.json`.

### Round 4 items

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Stage cleared before the forklift | **PASS**. The pick list, warehouse and stamp are at 0.4 at 12.00 and gone by 12.25. The forklift drives in on an empty stage. | `ra-12.25.png` |
| 2 | Forklift gone before the dough | **PASS**. The forklift is at 0.33 at 15.00 and gone by 15.25; the dough comes in alone. | `ra-15.25.png` |
| 3 | Counter gone before the aisle | **PASS**. The counter is at 0.2 at 21.50; the aisle comes in alone at 21.75. | `ra-21.75.png` |
| 4 | Count sheet out before the tracker slides | **PASS**. The tracker holds at x 1430 until the count sheet is out, then slides at 52.35–52.75 with no overlap. | meas 52.00–52.75 |
| 5 | "Work both at once" | **PASS**. It is fully on, on cream, from 79.00 to 80.10 (1.1 s at full contrast; about 1.3 s at opacity ≥ 0.5). The stage turns dark only after 80.10. | `fine` values in meas 79.5–80.5; `ra-79.75.png` |
| 6 | Badge eyebrow at 20 px | **PASS**. `bdgWhen` measures 20 px. No typeset text is under 20 px except the widget bar (19 px, accepted in round 1). | `b/meas` at 5.00 |
| 7 | Symptom on "separate" | **PASS**. The Symptom card is in at 75.75–76.0. | `ra-76.00.png` |
| 8 | Lanes after the cream | **PASS**. The lanes start at 41.75, after the title begins, and are on cream by 42.0. | `ra-42.00.png` |
| 9 | "Oct 2023" timing | **PASS**. It is in at 72.25 and alone for about 1.3 s, down from 1.8 s. | `ra-72.50.png` |
| — | Sun on "So", underline on "warehousing crew" | **PASS**. Both read. | `ra-32.70.png`, `ra-33.75.png` |
| — | Wordmark at CLOSE + 0.05 | **PASS**. The wordmark is in from 80.25 (0.04), and the background is dark from 80.45. | meas |

### Blank frames and regression

- **Blank frames: PASS.** None is longer than 0.5 s:
  - 32.45–32.70: 0.25 s; the sun is fading in.
  - 41.42–41.6: about 0.2 s.
  - 80.20–80.35: 0.15 s; the wordmark is rising.
- **Regression: PASS.** Every scene start is as in round 4.
- **The widget's exit** (79.23–79.58) is by design, and I accept it.

### Blockers

**None.** One cosmetic note, not a blocker: at 52.25 the exiting count sheet (opacity 0.36, sliding left) overlaps the
fading widget by about 30 px. Both are below half opacity, so it reads as a cross-fade. If wanted: fade-only exit
for `#count`, as in round 1 fix 6.

**Round 5 verdict: PASS.** The landscape cut is ready for Oren.
