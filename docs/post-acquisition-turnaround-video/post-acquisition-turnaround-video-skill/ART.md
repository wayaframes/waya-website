# Art direction — post-acquisition turnaround (landscape 1920x1080)

Designed against `SCRIPT.md` draft 1 (2026-10-16). Landscape only (`INSTRUCTIONS.md` #3).
Style frames: `artifacts/style/style-frame-1..4-*.png` (rebuild: `node artifacts/style/shoot-frames.mjs`).

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
