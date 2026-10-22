# Art direction — post-acquisition turnaround (landscape 1920x1080)

Designed against `SCRIPT.md` draft 1 (2026-10-16). Landscape only (`INSTRUCTIONS.md` #3).
Style frames: `artifacts/style/style-frame-1..4-*.png` (rebuild: `node artifacts/style/shoot-frames.mjs`).

> **Round 2 and Draft 3 (2026-10-18) override the row 1, 3, 6–12 compositions below.** Read "Draft 3" at the end first.
> See "Round 2" at the end of this file. Stills: `artifacts/style/style-frame-5..8-*.png`
> (rebuild: `node artifacts/style/shoot-frames2.mjs`).

## Direction

The 12-weeks house look, applied to an operations story. The picture runs from night to morning. Lines 1–7 are
cold and dark (`--cold`), with pale line drawings (#C9CCC7, 6 px strokes) and white enterprise screens that glow
against the dark, like a monitor in a warehouse office at 2 a.m. The key line sits on charcoal, halfway out of the
dark. On "So: two tracks, at once" the stage turns cream and stays cream through the results and the lens. The
close is charcoal. The screens are plain, enterprise-looking web apps (a warehouse system called just "WMS", a
dashboards tool, an internal docs page), all labelled "Cheetah — DC-01" in plain text: the client is named
(`INSTRUCTIONS.md` #10), but there is no vendor and no logo. The repo has no Cheetah logo, so none is drawn or invented. They should look like what an ops team really stares at: dense, grey-blue, a bit ugly. That is what sells
them. Waya's warmth (cream, sage, mustard, Space Grotesk) belongs to the frame around the screens, never to the
screens themselves.

## Type scale (stage px)

| Use | Font | Size / weight | Colour |
|---|---|---|---|
| Payoff word ("Profitable") | Space Grotesk | 120 / 700, -0.03em | charcoal; "Oct 2023" 56 / 700 sage |
| Burn counter | Space Grotesk | 160 / 700, tabular | rust on cold (line 5); charcoal on cream (line 15) |
| Result value (new) | Space Grotesk | 140 / 700 | sage |
| Big title / chapter card | Space Grotesk | 84 / 700 | charcoal (cream bg) or cream (charcoal bg) |
| Key line | Space Grotesk | 76 / 700, line-height 1.18 | cream; "by day" mustard; "by night" #F08A2C |
| Section title over the demo frame | Space Grotesk | 56 / 700, top 48, centred | charcoal |
| Result value (old) | Space Grotesk | 64 / 500 | #A9ACA7, no strike-through |
| Result label / card label | Plus Jakarta Sans | 30 / 600 | stone |
| Fact chip (dark scenes) | Space Grotesk | 28 / 500, number 40 / 700 | cream text, number rust |
| Sub-line under a result | Plus Jakarta Sans | 28 / 400 | stone |
| Eyebrow | Space Grotesk | 20 / 700 caps, +0.14em | fog |
| Expert widget bar | Space Grotesk | 19 / 600 | cream on charcoal |
| Screen caption bar | Space Grotesk | 17 / 500, +0.04em | cream on rgba(31,36,34,.86) |
| Tracker label | Space Grotesk | 15 / 500 caps, +0.12em | cream on rgba(31,36,34,.92) |

Minimum for anything typeset on the stage: 20 px. Text inside screenshots is smaller by nature. Every shot is
sized so its key numbers land at 12 px or more on the stage (that is why the viewports differ, below).
Do not strike through old values in Space Grotesk: its "1" has a flag, and under a line "17" reads as "47".

## Colour roles

- **Backgrounds:** `--cold` #121517 for lines 1–7. A cross-fade to charcoal #383F3B starts at the end of line 7
  and finishes before the key line's first word (0.8 s). Charcoal to cream #FAF7F1 on line 9's first word (0.8 s,
  no blank frame). Cream to charcoal for the close (≤ 1.75 s, wordmark within 0.2 s, house rule 13).
- **Rust** #D16C02: the failure (SHORT, 75%, 28%, the burn in line 5, the puffed dough, the go-live stamp, struck
  causes). On charcoal, rust drops to about 2.9:1, too dim for the key line, so "by night" uses the lighter tint
  #F08A2C there only.
- **Mustard** #EAB62F: attention and "day". The highlight outlines on screenshots (3 px, radius 8, 0.25 s draw-in).
- **Sage** #6A9D8A: the fix and the results (new values, "Oct 2023", the lens arrows).
- **Mint** #D3E9E0: the expert widget body only.
- **Fog / stone:** secondary text, old values.
- Screens keep their own UI colours (WMS navy #22313f, its red #b3261e / green #1e6b45). Never re-tint a screenshot.

## Grid

- **The seat.** The expert widget is 560x560 at x 30, y 140 every time it appears (A, B, C, D in the script's
  widget table). The house rule asks for the same size; a single seat also stops it jumping between appearances.
  It enters with `rise` (14 px, 0.6 s) and leaves with a 0.35 s fade. The bar reads "Vince · Waya co-founder",
  and its right-hand label changes by scene: line 1 "fall 2022", line 6 "the root cause", line 9 "the
  turnaround", line 17 "the Waya lens".
- **Demo frame (lines 9–12):** section title centred at top 48 (56 px). Widget left (x 30). Centre screen x 620,
  width 780. Tracker x 1430, width 450. All tops at 140 (`--frame-top`), all marked `data-col`.
- **Root-cause frame (lines 6–7):** no section title and no tracker. Widget at the seat. The centre screen widens
  to x 620–1890 (width 1270, gap analysis at width 1040) so the dense warehouse table stays legible. Top 140.
- **Dark pain scenes (lines 2–5):** two halves. Line art in x 80–860, real screen / chips in x 900–1820. Screen
  top 200. Chips sit 40 px under the screen.
- **Single-idea frames (key line 8, payoff 16):** centred, nothing else above 3% opacity.
- **Side gutters:** 30 px for the demo frame (house frame), at least 80 px for everything else.

## Expert widget placeholder

`assets/expert-placeholder.mp4` is a 720x720, 4 s seamless loop at 25 fps with no audio. It shows mint, a
line-drawn head and shoulders breathing ±4 px, a turning sage dashed ring, mustard/charcoal hazard stripes
scrolling top and bottom, and the words "Vince — clip to come / placeholder · swap for Oren's clip". It plays like
the real clip (`clip()` in `video.html`, length 4.0), so timing, cropping (`object-position: center 30%`) and the
"always plays video" check behave as they will with the real file. To swap: drop Oren's clip in as
`assets/expert-vince.mp4` and change the one `clip()` src. Rebuild the placeholder: `node artifacts/placeholder/make.mjs`.
The stripes and the label are meant to be impossible to miss in a review, so the placeholder can never ship by accident.

## Scene compositions

Stage pixels. Times and lines per `SCRIPT.md`; the voice's measured timing replaces the planned times. Every
visual starts on the words that name it (house rules 12, 18). Highlight boxes are mustard outlines unless noted;
their rectangles below were measured with getBoundingClientRect on the artifact pages and scaled to their
stage placement.

**Line 1 · intro (cold).** Widget rises at the seat on "Vince" (bar right: "fall 2022"). Eyebrow
"FALL 2022 · CHEETAH TECHNOLOGIES" at x 700, y 150. On "a food distributor", `assets/line/warehouse.svg` at x 700,
y 220, width 1000: `#main` draws in (stroke-dashoffset, 1.0 s). On "three others", `#acq1–3` slide in from +80 px
x, staggered 0.15 s, each with a POP ease. The chip "+ 3 regional distributors · ~$24M revenue" appears at
x 1180, y 880. Only `#main` and the three acquired buildings are visible; the racking, freezer and tags wait for line 2.

**Line 2 · "went live… three items in four".** Widget fades out. The warehouse group moves to x 80, y 300,
width 760 (0.6 s). `#racking`, `#freezer` and `#tags` draw in (0.8 s, staggered) on "rebuilt". The stamp
"GO-LIVE · OCT 2022" pops in on "went live": 4 px rust border, rust 30 px caps, rotate −8°, at x 300, y 470.
`artifacts/pick-list.png` rises at x 900, y 200, width 920 (height 492) on "three items in four". A rust outline
draws around row 4 (x 918, y 559, 885x47) on "four". The chip "~75% fill rate" sits at x 900, y 740.
Style frame 1 is this moment.

**Line 3 · "Pallets of fresh food rotted out back".** Pick list and stamp dim to 0.12. Warehouse fades.
`assets/line/vince-forklift.svg` at x 160, y 300, width 760. The forklift drives in from +200 px x (1.2 s). On
"rotted", `#pallet` tips 18° about (404, 392), toward the dumpster, and holds. The puffed box in the pallet is
rust. Chip "Shrink 28% in one week" at x 1000, y 440 (number in rust).

**Line 4 · the dough.** Forklift out. `assets/line/dough-box.svg` centred (x 700, y 280, width 520). The label
"FROZEN · pizza dough" is typeset (Space Grotesk 22 caps, cream) on the box face at about x 870, y 610. On "the
yeast woke up", cross-fade `#box` → `#puff` with a scale from 0.85 to 1.0 about the base (POP, 0.5 s). Chip
"Frozen · in the dry warehouse" at x 1240, y 440. One beat of grim humour: let the swell land on "woke up", then hold.

**Line 5 · the burn.** Everything out. Centred counter, 160 px rust: "$0" counts up to "$1,000,000" across the
whole line (tabular figures, so the width holds steady). Under it, at y 640: "~$1M / month · contribution margin
burn", 32 px fog. The counter must still be moving at the line's last word (house rule 13).

**Line 6 · root cause found.** Widget returns to the seat (bar right: "the root cause"). `artifacts/gap-analysis.png`
rises at x 620, y 140, width 1040 (height 693). On "Not the crews", cross-fade to `gap-analysis-struck.png`
(0.3 s): the crews line strikes in rust and the root-cause box fills. Optionally, add a mustard outline on the
crews row (x 677, y 615, 440x35) just before the cross-fade.

**Line 7 · "The building had changed. The system's logic never did."** Centre cross-fades to
`artifacts/wms-locations.png` at x 620, y 140, width 1270 (height 754). On "had changed", outline the
no-dimension rows (x 639, y 428, 891x60). On "never did", move the outline to the torn-down aisle rows
(x 639, y 488, 891x60). Then, on the last words, outline the SKU panel (x 1545, y 361, 327x493), where 886
locations hold one SKU. One outline at a time, so the eye always knows where to look. The background starts its
cold → charcoal fade as the line ends.

**Line 8 · key line, alone.** Charcoal. Everything else at 0.03 opacity (screens) or gone (widget, outlines).
The key line is centred at top 392, in two lines (see type scale). Above it, a 56 px line icon at x 936, y 300: a
mustard sun on "by day" that turns into a fog-coloured moon on "by night" (the moon's crescent wipes across the
sun, 0.4 s). Optional texture: `artifacts/replen-log.png` (nightly jobs ~70 → 318) at 0.03 opacity, blurred
2 px, x 330, y 150, width 1260. It is the literal "by night" chart, but at 3% it reads only as texture. On screen
≥ 2.5 s. Style frame 2.

**Line 9 · "So: two tracks, at once."** Charcoal → cream on "So". The section title "Two tracks, at once" fades in
at top 48. Widget rises at the seat (bar right: "the turnaround"). `artifacts/turnaround-tracker.png` (all red)
rises at x 1430, y 140, width 450 (height 352), with the label "The turnaround tracker". The centre is empty for
the beat, so put the two lane cards there: "1 · By hand" and "2 · Fix the cause". Each is 700x110, paper #F4F1EA,
1 px rgba(56,63,59,.14) border, Space Grotesk 44 / 700 charcoal, at x 660, y 200 and y 340, dropping in 0.15 s
apart on "two tracks". The script asks for lane labels under the title, but there are only 28 px between the
title and the frame top. They move into the centre screen's caption bar from line 10 on.

**Line 10 · track one.** The lane cards fold away. `artifacts/count-sheet.png` rises at x 620, y 140, width 780
(height 418). Caption "TRACK 1 · BY HAND · the whole company on the floor, freezer too". On "counting stock",
reveal the Counted and Variance columns (x 1092, y 303, 155x165) row by row: a white mask shrinking downward,
0.12 s per row. The "Counted by" column (Sales, Engineering, Exec team, Supply chain, Customer service) is the
"whole company". I would not add the line-drawn parka figures: they would be a fourth element on a demo page
(house rule 10). If Oren wants them, put them under the centre screen at y 600–740, 140 px tall, fog strokes.

**Line 11 · track two.** Centre cross-fades to `artifacts/slotting.png` (height 520). Caption "TRACK 2 · FIX THE
CAUSE · fixed slots for fast movers, flexible for the rest". On "rebuilt", outline the zone map (x 634, y 253,
482x375). On "for the new building", outline the consolidation box (x 1136, y 524, 240x57): 886 locations → 1.
At the line's end the tracker cross-fades to `turnaround-tracker-turning.png`. The two newest columns
(x 1766, y 235, 114x213) turn from grey to amber; give them a mustard outline for 1 s. Style frame 3.

**Line 12 · barcode checks, standard work.** Centre cross-fades to `artifacts/scan-qa.png` (height 473) on "stop
mistakes": the red hard-stop modal is the picture. Caption "Barcode checks · receiving, picking, loading,
delivery". On "daily standard work", `artifacts/standard-work.png` (height 370) rises 20 px over it, and the
caption becomes "Daily standard work". The tracker stays.

**Line 13 · fill rate.** Widget, tracker and title fade (0.35 s). `artifacts/pick-list-full.png` rises at x 110,
y 230, width 900 (the same order as line 2, now 4 of 4). Result card at x 1110, y 300: the label "Fill rate" 30,
then "~75%" 64 old → "99%+" 140 sage, then "by Mar 2023" 28 stone. Style frame 4.

**Line 14 · shrink, errors.** The pick list stays. The card's contents swap in place (0.3 s cross-fade, same
geometry): "Shrink · ~17–18% → ~2%" on "lost stock", then "Orders with an error · ~22% → ~3%" on "order errors".
One card at a time.

**Line 15 · the burn falls.** Pick list and card out. The counter from line 5 returns centred, 160 px charcoal,
running from "$1,000,000" down to "$260,000" and landing on "two hundred sixty thousand". On "by March", "a month ·
Mar 2023" appears under it at y 640, 32 px stone.

**Line 16 · payoff alone.** Everything else at 0.03. "Profitable" (120 / 700 charcoal) is centred at top 400.
"Oct 2023" (56 / 700 sage) sits under it at 540. Music peaks here. Hold 1.2 s after the voice.

**Line 17 · the Waya lens.** Section title "The Waya lens". Widget at the seat (bar right: "the Waya lens").
Right area x 620–1890. Two cards, "Symptom" and "Cause" (each 520x260, paper, 56 / 700 charcoal, centred text),
start overlapped at x 1000 and slide apart to x 680 and x 1300, y 240, on "separate". On "both at once", two sage
arrows (6 px, rounded) rise from y 720 into the bottom of both cards at the same moment, and "Work both at once"
(40 / 700 sage) appears centred under them at y 760.

**Lines 18–19 · close.** Cream → charcoal. Wordmark `assets/waya-logo-cream.png`, height 100, centred at top 230,
rising within 0.2 s of the line. "Have a problem like this one?" 56 / 700 cream at top 400. Two buttons at top 520,
centred with a 24 px gap: "Schedule a Call" (mustard fill, charcoal text, 30 / 700, padding 22x40, radius 14) and
"See Lean AI" (2 px cream outline, cream text). Each lands on its words. "wayaframes.com" 24 px fog at top 680.
Hold 2.6 s and keep it audible.

## Artifacts

Every shot is 2x. Each page sets its own viewport (`<meta name="shoot">`), sized to its stage width so its text
reads. Pages with states set `<meta name="variants">`, and `node artifacts/shoot.mjs` shoots each state as
`<name>-<variant>.png`. All of them share `artifacts/wms.css` (and `ops-dash.css` for the dashboards).

| File (`artifacts/`) | Viewport | Script line | Stage size | What it shows |
|---|---|---|---|---|
| `pick-list.png` | 990x530 | 2 | 920 wide | Order SO-48213, Oct 13 2022: 4 lines, line 4 (frozen pizza dough) struck, SHORT, 3 of 4 |
| `pick-list-full.png` | (variant) | 13–14 | 900 wide | Same order, Mar 16 2023: 4 of 4, scan QA 4 of 4 matched |
| `gap-analysis.png` | 840x560 | 6 | 1040 wide | A3 one-pager, Oct 22 2022: problem with numbers, facts from the floor, causes considered, root cause empty |
| `gap-analysis-struck.png` | (variant) | 6 | 1040 wide | Crews struck in rust; root cause filled: rebuilt building, logic never updated |
| `wms-locations.png` | 1280x760 | 7 | 1270 wide | Location master, Oct 22 2022: no-dimension rows, torn-down aisles still active, frozen SKU in a dry slot, slots too small; SKU 100482 in 886 locations |
| `turnaround-tracker.png` | 600x470 | 9–10 | 450 wide | Weekly tracker, all red (Oct 17 is the "before" week, ahead of the Oct 22 root cause; Oct 24), later weeks greyed |
| `turnaround-tracker-turning.png` | (variant) | 11–12 | 450 wide | Oct 31 and Nov 7 turning amber |
| `count-sheet.png` | 990x530 | 10 | 780 wide | Cycle count, freezer aisle FZ-02, variances, "Counted by" Sales / Engineering / Exec team / Supply chain / Customer service |
| `slotting.png` | 990x660 | 11 | 780 wide | Slotting model "Hybrid v3": zone map (fixed = dark, dynamic = light), five rules, consolidation SKU 100482 886 → 1 |
| `scan-qa.png` | 990x600 | 12 | 780 wide | Pick confirmation with a red "QA HARD-STOP · WRONG ITEM SCANNED" modal; SW-07 |
| `standard-work.png` | 990x470 | 12 | 780 wide | SW-07 Daily standard work — Picking: times, steps, HARD-STOP checks |
| `replen-log.png` | 1280x760 | 8 (texture, optional) | 1260 wide at 3% | Nightly replenishment, ~70 → 318 tasks, go-live marker, last night's exceptions |

Spares, not called for by the script but built and shot: `ops-before.png` and `ops-after.png` (an operations
dashboard, Oct 2022 red and Oct 2023 green, same layout) and `triage-board.png` (daily triage checklist: clear
staging lanes and trailers, replenish the top 1,000 items, consolidate each SKU, cycle-count by aisle). The kit's
`example-chatgpt.html`, `screen.png` and `tracker.png` are template leftovers; the page should stop referencing them.

Line art (`assets/line/`, house strokes #C9CCC7 6 px, rust accents; the groups have ids for animation):
`warehouse.svg` (#main, #racking, #freezer, #tags, #acq1–3), `vince-forklift.svg` (#dumpster, #pallet,
#forklift, #vince, #ground), `dough-box.svg` (#shelf, #box, #puff).

Expert: `assets/expert-placeholder.mp4` (above). Naming (`INSTRUCTIONS.md` #10): the client is named in text
only, in the site label "Cheetah — DC-01" on every warehouse-system header, "Cheetah DC-01" in the gap analysis,
dashboard and triage titles, and the opening eyebrow "FALL 2022 · CHEETAH TECHNOLOGIES". There is no Cheetah logo
in the repo, so none is used and none is invented. The app names stay generic ("WMS", "Dashboards",
docs.internal, ops.internal): no vendor logo, and no real client colours or codes. Vince's old title ("COO") stays
off the screens.

**Illustrative content to flag to Oren** (script issue 9, extended): every SKU, item name, order number,
customer number, location code, date other than Oct 22 2022 / Mar 2023 / Oct 2023, and every intermediate value
(the tracker's Oct 24–Nov 7 weeks, the count variances, 318 tasks last night, 4,812 locations, 1,137 missing
dimensions, 214 removed-aisle locations, the CM months between Oct 2022 and Oct 2023 on the spare dashboard). The
start and end numbers are real (FACTS.md). The products are generic pizzeria supplies, chosen to tie to the
dough story. They are not the client's catalogue.

## Advice for the producer

1. **What will read well:** the pick list (line 2 → 13) is the best device in the film: one order, short in
   October, complete in March, in the same place on screen. Keep that pair. The 886 panel and the struck
   "crews" line are the two root-cause beats a viewer will remember.
2. **What will clutter:** line 7 asks for three highlights in four seconds. That is the limit; if the measured
   line is shorter than 3.5 s, drop the torn-down-aisles outline and keep "no dimensions" → 886. Also skip the
   parka figures (line 10) and do not stack lane labels under the title (no room; they go into the cards and
   then the caption).
3. **Trade-off on line 6:** the struck variant fills the root-cause box at "Not the crews", a line before the
   voice states the cause. I prefer that: the picture leads by a beat and the key line pays it off. A three-state
   version (strike first, root cause on line 7) is a five-minute change if the review objects.
4. **Root-cause frame width:** I widened the centre to 1270 for lines 6–7 and dropped the tracker there, because
   the warehouse table at 780 wide puts its text at ~7 px. That is a deliberate break from the three-column frame.
   The widget stays in its seat, so the frame still reads as the same room.
5. **Rust on charcoal** fails contrast for the key line. I used the lighter tint #F08A2C for "by night". It is the
   only off-token colour in the film; if Oren wants strict tokens, use mustard for both phrases and let the
   sun → moon icon carry the contrast.
6. **The placeholder** is deliberately loud. When Oren's clip arrives, check it is ≥ 46 s usable (the script's
   widget table) and framed so the face sits in the top 30% of a square crop, which matches `object-position:
   center 30%` and the bar covering the top 52 px.


## Round 2 (2026-10-18): Oren's notes #24, #25, #26, #28

### A new illustration register for the two story beats
The forklift (line 3) and Na'ama (line 10) move from house line drawings to flat editorial illustration. That
means filled shapes with no outlines, two tones per surface (base plus a lighter top edge), soft radial light,
soft ground shadows, and faceless figures. The colours are the film's tokens plus darker shades of them:
- mustard for the forklift and the lamps
- sage for the dumpster and the blanket
- tan for wood
- rust for hi-vis vests and spoiling produce
- charcoal and the cold slates for the night

The warehouse line art for lines 1–2 stays as it is. It is a diagram of the building; these two are scenes with
people in them, and the change of register reads as "now we are on the floor".

### Line 3 · forklift (#25): `assets/line/forklift-scene.svg`
- **Placement.** Same budget as the old drawing: 760x520 at left 160, top 300. The scene shows the yard at night: a
  corrugated wall, one wall lamp, a mustard counterbalance forklift with mast, carriage, forks, overhead guard,
  counterweight and wheels, and an operator in a hard hat and hi-vis vest. The operator has no face; he suggests
  Vince without portraying him. There is a sage dumpster with its lid open, and abandoned pallets of browning
  produce along the wall. The scene's edges fade into `--cold`, so no box shows.
- **Default pose.** Arrived, with the pallet raised just above the dumpster rim.
- **Parts and moves** (CSS transforms, `transform-box: view-box`; the header comment in the SVG repeats them):

| Part | Move | Timing |
|---|---|---|
| `#fkBody` | translateX(+220px) → 0 | on "Pallets", 1.0 s, ease-out |
| `#fkCarriage` | translateY(+150px) → 0 (forks rise) | last 0.6 s of the drive-in |
| `#fkLoad` | same translateX as `#fkBody` and same translateY as `#fkCarriage` | as above |
| `#fkTip` | rotate(0) → rotate(-24deg), origin 140px 290px | on "rotted", 0.6 s |
| `#crate1`, `#crate2`, `#crate3` | translate(-70px, 150px), 0.08 s apart | after the tip, 0.5 s, ease-in |
| `#fkLampGlow` | opacity .85 ↔ 1, slow | optional |
| `#operator` | rotate(-6deg), origin 492px 236px (turns toward the load) | optional |

- **Why `#fkLoad` sits at root level.** It is not inside `#fkBody`, so a clip-path can make the crates disappear
  behind the dumpster's front wall as they fall in, with no fading. That is why it needs the duplicated
  transforms. The forklift's lamp is `#fkLampGlow` (renamed), so it no longer clashes with the Na'ama SVG's
  `#lampGlow`. The four scene SVGs (forklift, Na'ama, aisle, crew strip) now share no ids and can be inlined
  on one page as they are.
- **On screen.** The chip "28% shrink in one week" stays at 1000, 440. Still: `style-frame-5-forklift-tip.png`, mid-tip.

### Line 10 · Na'ama (#28): `assets/line/naama-office.svg`
- **Placement.** Full-bleed in the centre seat (`#naama`), replacing the line drawing. Draft 3 moves it to
  the wide layout W, 1060x761; see "Draft 3" below. The SVG is vector, so it scales clean.
- **The scene.** The warehouse office at 2:10 a.m.: a desk lamp's warm pool, the warehouse system still up on the
  monitor (cool mint glow, red rows), a wall clock, and a window onto the dark racking. Na'ama is asleep at the
  desk, head on her folded arms, long dark curls, a sage blanket with a mustard edge round her shoulders. Her
  hard hat is on the desk and her hi-vis vest hangs on the hook. It is quiet, warm and adult. No zzz.
- **Changes to `#naama` in `video.html`.**
  - Inline the SVG at `inset:0` (width 780, height 560).
  - Set `#naama { background:#161b1e }`.
  - Name card colours: `#naama .nm b { color: var(--cream) }` and `#naama .nm span { color: var(--fog) }`.
    The name card stays at 34, 28.
  - Keep the caption bar.
  - Remove the `z1`–`z3` texts and their JS.
- **Clear zones.** The art keeps the name area (y < 110, x < 400) and the caption band (y > 512) clear.
- **Motion** (subtle; something always moving, house rule 13):
  - `#breath`: scaleY 1 → 1.015, origin 300px 392px, 3.6 s ease-in-out loop
  - `#monitorGlow`: opacity 1 → .86 → 1 at irregular 2–3 s intervals
  - `#screenRows`: a −6 px refresh jump once in the beat
  - `#minuteHand`: +6deg over the beat, origin 470px 128px
  - `#lampGlow`: optional
- **Still:** `style-frame-6-naama-office-wide.png` (draft 3, layout W).

### 0–6 s · Vince's still card (#24): `assets/vince-headshot.jpeg`
- **Source.** The image is copied from the site's `assets/images/headshots/vince-headshot.jpeg` (800x800).
- **Shape.** Deliberately unlike the 560x560 video widget: a horizontal badge, 600x236, radius 28, at x 80,
  y 400 on the cold stage. Fill `--cold2`, border `--cold3`, the dark-stage shadow.
- **Photo.** Round, 168 px, `object-position: 50% 30%`, with a 5 px cream ring.
- **Text, right of the photo.**
  - "IN 2022 · AT CHEETAH": Space Grotesk 17 / 700 caps, mustard, +0.14em
  - "Vince": 54 / 700 cream
  - "now a Waya co-founder": Plus Jakarta Sans 24, fog
- **Motion.** It rises 16 px on "Vince" and leaves before line 2. No live dot, no bar, no video, so it cannot read
  as a call.
- **Moved to make room.** The eyebrow goes to x 780, y 150. The warehouse goes to x 780, y 220, width 1000.
  The "+3 regional distributors" chip goes to x 1260, y 880.
- **Markup:** the `.badge` rules in `artifacts/style/frames2.html`.
- **Still:** `style-frame-7-vince-still-card.png`.

### 22–30 s · no Vince video (#26): proposal (SUPERSEDED by "Draft 3" below: no name chip, footprint x 430 w 1060)
- **Widget.** The widget stays out from line 6 until the demo frame (line 9). Its space goes to the screens.
- **Screens.** The gap analysis and the warehouse location table share one wide footprint, x 380, y 150,
  width 1160, centred on the stage:
  - gap analysis: height 773
  - location table: height 689, about 0.91 of the shot's native size, so legible
  - the two cross-fade in place, so the eye never re-finds the screen
- **Name chip.** Above the screen, at x 380, y 40, a compact version of the still card (a pill, 84 px tall)
  carries what the widget bar used to say: a 60 px round photo, then "Vince" 30 / 700 cream, "took over as COO"
  22 fog, "· OCT 22, 2022" 15 caps mustard. It fades in with the gap analysis and holds through line 7.
  It is a still, not a video.
- **Re-mapped highlight boxes.** Computed from the measured boxes, scaled to the new footprint; stage px as
  x, y, w x h.

| Screen | Region | x, y | w x h |
|---|---|---|---|
| Gap analysis | crews row | 444, 680 | 491x39 |
| Gap analysis | root-cause box | 970, 639 | 523x262 |
| Location table | no-dimension rows | 397, 413 | 814x55 |
| Location table | torn-down aisles | 397, 468 | 814x55 |
| Location table | SKU panel | 1225, 352 | 299x450 |

  Inside each screen element (`left/top` relative to the screen): subtract 380, 150.
- **Still:** removed; replaced by `style-frame-9-go-and-see-a3.png`.

### Round 2 advice
1. **#27 is still open** (line 6 rewritten so it is about process, not people). The gap analysis's
   "Crews: labor, training, effort · does not explain it" row still fits that framing: the analysis tests the
   people explanation and rejects it in favour of the process. If the new line 6 drops "crews" altogether,
   re-word that row to "Labor and training" and keep the strike. It is a one-line change in `gap-analysis.html`
   plus a re-shoot.
2. **Two registers in one film** (line art for the building, illustration for the people) is a deliberate choice.
   If Oren wants one register, the warehouse in lines 1–2 is the one to redraw in the illustration style, at the
   same size and with the same group ids.
3. **The dough (line 4, `dough-box.svg`) is still the old stick style** and now sits between two illustrated beats.
   I recommend redrawing it in the same register (a cardboard case on a steel shelf, puffing up). It is not in
   Oren's list, so ask first. `vince-forklift.svg` is superseded by `forklift-scene.svg`.


## Draft 3 (SCRIPT.md draft 3, 2026-10-18): rows 6–12 without the widget

Vince is seen on camera only in rows 10a and 17. Everywhere else his seat is empty, so the screens take the space.
Stills: `artifacts/style/style-frame-9..12-*.png` and `style-frame-6-naama-office-wide.png`
(`node artifacts/style/shoot-frames2.mjs`).

### Two demo layouts (both top-aligned at 140, under the 56 px section title)
- **W (wide, no widget):** rows 9, 10b, 11, 12. Centre screen at x 170, width 1060; tracker at x 1300, width 450.
  Centre + gap + tracker is 1580 px, centred on the stage.
- **D (with widget):** row 10a only. Widget at x 30 (560x560), centre at x 620, width 780, tracker at x 1430,
  width 450. These are the original demo-frame numbers.
- **Switching.** Only the tracker moves between layouts:
  - At 44.45, as the widget rises, translateX +130px over 0.5 s (EASE).
  - At 52.06, as the widget leaves, translateX back.
  - The centre never morphs: its contents change at the same moments (lane cards → count sheet at 10a; count
    sheet → Na'ama at 10b), and each item has its own geometry.
- **Every `data-col`** (l / c / r) still holds; the audit's top-alignment check passes in both layouts.

### Row 6 · "went to the floor … the process, not the people" (21.9–27.6)
- **Aisle.** Cold stage. `assets/line/aisle-scene.svg` (1920x1300, the Lean "go and see") fills the stage at
  left 0, top 0. On "went to the floor" the camera moves down into the aisle: translateY(0 → −220px) plus
  scale(1 → 1.06), origin 960px 640px, over 2.5 s, ease-out, then a slow drift (scale +0.01 over the rest of row 6
  and row 7, so it never freezes). `#ceilingLights` can flicker .9 ↔ 1.
- **Eyebrow.** "OCT 22 · GO AND SEE" (20 / 700 caps, cream, +0.14em) centred at top 84. It fades in with the move.
- **The A3.** Rises at x 430, y 150, width 1060 (height 757) as the move settles. It uses the dark-stage screen
  style (the shadow `0 30px 80px rgba(0,0,0,.45)`, a 1 px white 8% border). Caption bar "ROOT CAUSE · the
  process, not the people".
  - "Vince · COO" is on the A3's owner line (the producer's decision), so no name chip is needed.
  - The A3 has three states (`artifacts/gap-analysis*.png`, variants of one page):

| State | When | Shot |
|---|---|---|
| neutral, root cause empty | entry | `gap-analysis.png` |
| "Process" circled in mustard, root cause filled ("The process, not the people. …") | cross-fade 0.3 s on "the process" | `gap-analysis-process.png` |
| "People" greyed (not struck: respect for people) | cross-fade 0.3 s on "not the people" | `gap-analysis-people.png` |

  - Measured boxes (stage px; in-screen = minus 430, 150):

| Region | x, y | w x h |
|---|---|---|
| People card | 488, 634 | 218x118 |
| Process card | 718, 634 | 218x118 |
| Root-cause box | 969, 597 | 478x240 |

  - The mustard ring is baked into the shots. If the animation director prefers a drawn ring, use the neutral
    shot plus a 3.5 px mustard outline at the Process box, inset −7, radius 12.
- **Retired.** `gap-analysis-struck.png` is no longer produced; the file on disk is stale, so drop its
  reference from `video.html`.

### Row 7 · the warehouse system (28.3–31.7)
- **Placement.** The aisle keeps drifting. `artifacts/wms-locations.png` cross-fades in at the same footprint,
  x 430, y 150, width 1060 (height 629). The eyebrow stays. The caption bar sequence is as built.
- **Highlights**, one at a time (stage px; in-screen = minus 430, 150):

| Region | x, y | w x h |
|---|---|---|
| No-dimension rows | 446, 391 | 744x50 |
| Torn-down aisles | 446, 440 | 744x50 |
| SKU panel | 1202, 335 | 273x412 |

- **Short line.** If the measured line is under 3.5 s, drop the torn-down-aisles highlight (accepted rule).
- **Hand-off.** The aisle and the screen fade toward the key line, and the stage goes cold → charcoal as before.

### Row 8 · the key line as Vince's quote (32.43–39.95, text held to 40.75)
- **Layout.** Charcoal. Everything else at 0.03 or gone. The quote is set in Space Grotesk 64 / 700, line-height
  1.2, cream, centred in x 160–1760, starting at top 330. Four lines:
  - "“Every day the warehousing crew"
  - "was fixing the problems,"
  - "and the IT system was recreating"
  - "them every night.”"
- **Colour.** The quote marks are fog, weight 500. "Every day" is mustard; "every night" is #F08A2C.
- **Phrase by phrase on his timing.** Lines 1–2 rise together (14 px, 0.5 s) on "Every day". Lines 3–4 rise on
  "and the IT system".
- **Sun to moon.** The sun icon (64 px, mustard) sits at x 928, y 236. It turns into a fog-coloured moon on
  "every night" (crescent wipe, 0.4 s).
- **Attribution.** "— Vince" in Plus Jakarta Sans 28 / 500 fog, centred at top 668. It fades in with the
  second phrase.
- **Hold.** It holds the whole 8.3 s. No face, no widget.
- **Still:** `style-frame-10-key-line-quote.png`.

### Row 9 · "Two tracks, at once. Track one, by hand." (41.25–44.25)
- **Layout W.** Charcoal → cream, then the title.
- **Tracker.** `turnaround-tracker.png` (all red) at x 1300, label "The turnaround tracker".
- **Lane cards.** They sit in the centre column, 900x110 each, at x 250, y 220 and y 360 (paper, Space Grotesk
  44 / 700). They drop in on "Two tracks", and lane 1's mustard ring lights on "Track one".
- **Widget column.** Empty, as the script says (#29).

### Row 10a · Vince on camera (44.75–51.81, widget 44.45–52.06)
- **Layout D.** The widget rises at the seat, bar "Vince · Waya co-founder", right label "on the floor". The
  tracker slides to x 1430, and the lane cards fold away.
- **Count sheet.** `count-sheet.png` rises at x 620, y 140, width 780, in its 560 px card. Caption "TRACK 1 ·
  BY HAND · execs, sales, operators on the floor".
- **Crew strip.** `assets/line/crew-strip.svg` (780x150) sits under the card at x 620, y 716.
  - On "everyone, executive, sales team, operators", the five figures `#crewExec`, `#crewSales`, `#crewOps1`,
    `#crewSales2`, `#crewOps2` rise 12 px and fade in, 0.12 s apart.
  - On "24-7", `#dayNight` spins 360° once (origin 712px 75px, 1.2 s).
  - On "cleaned up the warehouse", the tracker cross-fades to `turnaround-tracker-turning.png`.
- **Clutter.** This is the only demo moment with four elements. They are all small and on the same top line,
  and it lasts 7 s, so it is acceptable. Drop the crew strip if the review calls it clutter.
- **Still:** `style-frame-11-track1-vince-on-camera.png`.

### Row 10b · Na'ama (52.41–53.91)
- **Layout W.** The widget leaves and the tracker slides back to x 1300. The count sheet slides out left
  (−60 px, fade). The Na'ama card comes in at x 170, y 140, 1060x761: `naama-office.svg` full-bleed,
  `background:#161b1e`.
- **Text.** The name card at 34, 28 reads "Na'ama" (44 / 700 cream) and "Vince's co-founder · 16-hour days"
  (24 fog). The caption reads "TRACK 1 · BY HAND · Na'ama slept there".
- **Motion.** As in Round 2. With a 1.5 s beat, the breathing and the monitor flicker are enough.
- **Cot or desk.** The script says "asleep on a cot"; the illustration has her asleep at the desk under a blanket.
  It reads as "slept there" in 1.5 s, where a cot needs more frame. I kept the desk. Say if Oren wants the cot.
- **Still:** `style-frame-6-naama-office-wide.png`.

### Row 11 · track two (54.61–56.76)
- **Layout W.** `slotting.png` at x 170, y 140, width 1060 (height 707), caption "TRACK 2 · FIX THE CAUSE ·
  fixed slots for fast movers, flexible for the rest". The tracker stays at x 1300 (turning).
- **Highlights** (stage px; in-screen = minus 170, 140):

| Region | x, y | w x h |
|---|---|---|
| Zone map | 189, 294 | 655x510 |
| Consolidation box | 871, 661 | 325x77 |

- **Still:** `style-frame-12-track2-wide.png`.

### Row 12 · barcode checks, standard work (57.46–60.16)
- **Layout W.** `scan-qa.png` at x 170, y 140, width 1060 (height 642); the hard-stop modal highlight is at
  400, 328, 600x292. Then `standard-work.png` (1060 wide, height 503) rises 20 px over it on "daily standard
  work".
- **Captions** as built. The tracker stays at x 1300.

### New and changed files (draft 3)
- **Artifacts:** `artifacts/gap-analysis.html` (People/Process cards, owner "Vince · COO", root-cause text,
  variants `process` and `people`), shot as `gap-analysis.png`, `gap-analysis-process.png` and
  `gap-analysis-people.png`.
- **Illustrations:** `assets/line/aisle-scene.svg` (generated by `assets/line/make-aisle.py`) and
  `assets/line/crew-strip.svg` (generated by `assets/line/make-crew.py`).


## Row 4 · the dough, redrawn (2026-10-18)
- **The drawing.** `assets/line/dough-box.svg` is now in the illustration register:
  - Steel dry-goods shelving with flour sacks and cans either side, to say this is the dry warehouse.
  - A kraft corrugated case with a dark label panel.
  - In the puffed state, the risen dough forces the flaps open and splits the seam.
  - Same 520x420 budget at left 450, top 280.
- **Ids unchanged:** `#shelf`, `#box`, `#puff`. There is a new optional `#frost`: cold breath that fades out
  as the box warms.
- **Animation.** Cross-fade `#box` → `#puff` on "the yeast woke up", with a scale from 0.85 to 1.0 about
  240px 330px (POP), as built. `video.html` inlines these as `dBox` / `dPuff`, so map the new groups to those ids.
- **Label.** The dark label panel (x 166–314, y 264–318) sits under the page's typeset label "FROZEN / pizza
  dough" (cream) at left 600, top 548. It is in the same place in both states, so the label never moves.
- **Stills:** `artifacts/style/style-frame-13-dough-normal.png` and `style-frame-14-dough-puffed.png`.


## Portrait cut, 1080x1920 (round 5, 2026-10-22)
Same cues, same timeline, same scenes, recomposed for a phone held upright. It is a second layout in the same page:
`video.html?layout=mobile`. The seats are in the `if (MOBILE)` block at the top of the script; the few moves that
differ are `lay(landscape, portrait)` values in the timeline. The landscape path reads neither, so every landscape
frame is byte-identical to the approved cut (all 2,582 frames hashed before and after).

- **Grid.** One centred column, 60 px gutters. Screens are 960 wide: the wide shots (1060) are zoomed to 960, the
  count sheet (780) up to 960, so every outline inside a screen keeps its own coordinates (Chromium zooms left/top
  too, hence `seat()` divides by the zoom). Captions on the screens are 24 px on the frame and may wrap.
- **Lines 1–2.** Vince's card at x 240, y 380; the eyebrow centred at y 700 and the warehouse (x 30, y 760, 1000 wide)
  under it; the "+3" chip centred at y 1400. On "rebuilt" the warehouse goes up to x 140, y 300 at 0.8 and the
  eyebrow to y 250; the pick list (920 wide) at x 80, y 900, the fill-rate chip centred at y 1440; the stamp at
  x 372, y 479, on the warehouse as in landscape.
- **Lines 3–5.** The forklift 1000 wide at x 40, y 520, its chip centred at y 1260. The dough 780 wide at x 150, y 560
  with its typeset label scaled with it (x 375, y 962, zoom 1.5), chip at y 1270. The burn counter centred at
  y 800, its eyebrow at 770, the sub line at 1020 (and the same seats for the $260K run-down).
- **Lines 6–7.** The aisle fills the tall frame: 3400 wide at x −1160, y −120, so the vanishing point sits at x 540,
  y 985; the camera move is the landscape one about the frame's centre. "Oct 22 · Go and see" is a chip centred at
  y 500 (in the tall frame the ceiling lights run down the centre, through any bare centred line); the A3 and the
  system screen at x 60, y 600, 960 wide.
- **Line 8.** The quote in six lines (the same four reveals): "Every day the / warehousing crew / was fixing the
  problems, / and the IT system / was recreating / them every night." at 64 px, tops 690, 844, 921, 1075; the sun at
  x 508, y 596; "— Vince" at y 1182; the blurred replenishment log 1200 wide behind it.
- **Lines 9–12, the demo frame.** The title at y 250. The tracker (450, native) centred under it at x 315, y 370.
  The lanes 960 wide at x 60, y 880 and 1030. The centre screens at x 60, y 780, 960 wide. In 10a the widget takes
  the left of the tracker's row (460 square at x 70, y 370) and the tracker slides right to x 560: it leaves 0.35 s
  before the widget fades up and comes back once the widget has gone. The count sheet at x 60, y 870 (960 wide), the
  crew strip 960 wide under it at y 1470.
- **Lines 13–16.** The full pick list 900 wide at x 90, y 420; the result rows at x 90, y 1000. "Profitable" at y 980
  and "Oct 2023" at y 1120, clear of the lens widget (bottom 904) as it fades up.
- **Line 17, the lens.** The title at y 310; the widget 460 square (the same size as in 10a, house rule 12) centred
  at x 310, y 430 (it changes seat between its two appearances, while it is off); the cards 440x220 side by side under it, Symptom at x 70 and Cause at x 570
  (each slides 70 px into its seat, as in landscape), "≠" between them; the arrows up into the cards' centres; "Work
  both at once" centred at y 1412.
- **The close.** 1.15x the landscape card so it reads on a phone: the wordmark 115 high at y 640, the question 64 px
  at 820, the buttons (zoom 1.15) at 950, wayaframes.com 27 px at 1130.
- **Type.** Nothing new under 22 px: the screen captions 24 px; the tracker label, the widget bar, the eyebrows and
  the crew's "24-7" lifted to 22 px; Na'ama's name card back to its landscape 44 / 24 px after the zoom.
- **Render.** The sandbox Chromium cannot play H.264, so the expert's clip is a VP9 copy passed in with `?clip=`
  (`render.mjs --clip render/out/expert-vince.webm`); the same take, the same in/out points.

## Posters (round 5, 2026-10-22)
`artifacts/poster-card.html` (landscape 1920x1080; `?layout=portrait` 1080x1920), shot by
`node artifacts/shoot-poster.mjs` to `render/out/` and downscaled to the site's 1280x720 and 720x1280 JPGs. The cash
float card's style: cream field, letter-spaced label, the old value struck in rust, a mustard arrow, "Profitable" big
in sage, one caption line. The small chart is two dots joined by one line, drawn like the site's own chart ("Monthly burn ($M)"):
the burn in Oct 2022 falling to the dotted zero line by Oct 2023 (profitable, just crossed over). No other number,
no running-time chip.
