# From $1M a month burn to profitable: post-acquisition turnaround video script (draft 3, 2026-10-18)

**Draft 3** applies Oren's round of 2026-10-18 (`INSTRUCTIONS.md` #24–#33). Vince's own voice is now heard at three
moments, cut from his real take (`VINCE-TRANSCRIPT.md`; his words are script material). Row numbers are kept from
drafts 1–2: rows 10a, 10b and 10c replace row 10. **CHANGED** marks every row that differs from draft 2 as built
(the cut measured at 78.52 s).

| Row | Change | Instruction |
|---|---|---|
| 1 | Picture only: a still photo card, no video | #24 |
| 6 | New narrator line; new screen text; no widget | #33, #27, #26 |
| 7 | Picture only: no widget | #26 |
| 8 | The key line is Vince's own voice (his words); text alone, no face | #32 (1) |
| 9 | Now also carries "Track one, by hand." | #32 (2) |
| 10a | New: Vince on camera, own voice | #32 (2) |
| 10b | Na'ama beat, shortened | #12 |
| 12 | "that stop mistakes" cut for time (trim T1) | — |
| 17 | Unchanged: his take words, already built | #32 (3) |
| widget | On screen only while his own voice is heard | #29 |

Word for word as built: 1–5, 7, 11, 13–16, 18.

## Length: 86.5 s planned

**How it is estimated:** the measured narrator lines in `render/out/vo-timing.txt` (2026-10-18), plus the real
lengths of his three take segments, with the narrator estimated at the measured pace (~3.0 words/s) for the three new
or changed narrator lines. Those three are not voiced yet; the uncertainty is about ±1 s.

| Change from the measured 78.52 s cut | Δ |
|---|---|
| Line 6 rewritten (10 → 17 words, ~5.7 s) | +2.0 |
| Key line: Vince 7.52 s instead of the narrator's 3.89 s, text held 0.8 s (T3) | +3.2 |
| Two tracks: line 9 + "Track one, by hand." / Vince 7.06 s / "Na'ama slept there." replace lines 9–10 (with T2, T5) | +3.9 |
| Line 12 shorter (T1) | −0.7 |
| Gap before the close line (T4) | −0.5 |
| **Planned total** | **86.5 s** (worst case about 88) |

**Trims already applied to get under ~87 s, narrator first** (revert costs in brackets):

| Trim | What | Saves |
|---|---|---|
| T1 | Line 12 "Then barcode checks that stop mistakes, and daily standard work." → "Then barcode checks, and daily standard work." The scanner's "scan blocked" screen still shows what they do. | 0.7 s |
| T2 | Line 9 drops "So:". | 0.3 s |
| T3 | Key-line text hold after his voice: 1.2 → 0.8 s. It is still on screen ~8.3 s. | 0.4 s |
| T4 | Gap before the close line: 1.69 → 1.2 s. | 0.5 s |
| T5 | Na'ama beat "Na'ama, his co-founder, slept there." → "Na'ama slept there." Her name card carries "co-founder". | 0.7 s |


**If the voiced cut still runs over 88 s, cut in this order:**

| Reserve | What | Saves |
|---|---|---|
| R1 | Put the Na'ama beat in the picture only: her illustration rises under Vince's "24-7, we ran that…", named on screen, and line 10b goes. Oren must accept a beat that is shown but not voiced (#12). | 2.1 s |
| R2 | Line 2 → "At go-live, customers got three items in four." | 0.8 s |
| R3 | Line 3 drops "fresh". | 0.3 s |
| R4 | Key line starts on "every" (58.00), without "So". | 0.1 s |

Hard limit 90.0 s; floor 60.0 s (`INSTRUCTIONS.md` #2). The `DUR` clamp in `video.html` (`Math.min(90, …)`) would
cut the close card short rather than run over, so the review must check the card's hold, not only the duration.

**Section budget (planned):**

| Section | Time | Note |
|---|---|---|
| Opening | 0.6–6.7 | |
| Pain | 7.8–20.8 | 13.0 s, 15% |
| Root cause | 21.9–40.75 | the key line in Vince's voice, 32.43–39.95 |
| Two tracks | 41.25–60.2 | Vince on camera 44.75–51.81 |
| Results | 61.3–74.6 | |
| The Waya lens (Vince) | 75.9–79.4 | |
| Close | 80.6–86.5 | |

## Vince on screen and on the soundtrack

| Moment | Rows | Film (planned) | Take in → out | Length | Picture |
|---|---|---|---|---|---|
| Intro | 1 | 0.6–6.7 | — | — | **Still photo card, not a video widget** (#24) |
| Root cause | 6–7 | 21.9–31.7 | — | — | **No Vince** (#26) |
| (1) Key line | 8 | 32.43–39.95 | 57.90 → 65.42 | 7.52 s | **No face**: his words as text alone (#32) |
| (2) All hands | 10a | 44.75–51.81 | 81.98 → 89.04 | 7.06 s | **Widget, on camera, unmuted**; in only while he speaks (#29) |
| (3) The lens | 17 | 75.90–79.40 | 100.34 → 103.84 | 3.50 s | **Widget, on camera, unmuted** (as built) |

The muted "talking" appearances (intro, rootCause, tracks in `video.html`'s EX list) all go. The clip is visible only
in rows 10a and 17, each time cut at its take offset so mouth and voice share one number.

## Story in one paragraph

Vince, now a Waya co-founder, was at Cheetah Technologies, a food distributor that had just bought three regional
distributors and rebuilt its warehouse to hold them. When the rebuilt warehouse went live in October 2022, it fell
apart: customers got three items in four, pallets of fresh food rotted out back, frozen pizza dough sat out until the
yeast woke up, and the company burned about $1M a month. On October 22 Vince went to the floor and found the cause:
the process, not the people. The building had changed but the warehouse system's logic never had. In his words, every
day the warehousing crew was fixing the problems, and the IT system was recreating them every night. Two tracks ran at
once. Track one was by hand: he got everyone, executives, sales, operators, and ran it 24-7 until the warehouse was
clean, while Na'ama slept there. Track two rebuilt the system's logic. Then came barcode checks and daily standard
work. Fill rate passed 99%, shrink fell to about 2%, order errors to about 3%, the burn fell to about $260K a month by
March 2023, and the company was profitable by October 2023. Vince, to camera: "You need to separate the symptom from
the root cause."

**Protagonist, named, look, soundtrack:** as in draft 2, with these changes:
- The intro is a still photo of Vince in a plain card (not the expert widget). Art's pick: a frame from the take or
  the site headshot.
- His three own-voice moments get the music fully ducked, and the room echo removed (#30) on all three, not only the
  lens.

## The script

| # | Time (planned) | What we see | Voiceover | On-screen text |
|---|---|---|---|---|
| 1 | 0:00.6–0:06.7 | **CHANGED (picture, #24).** Dark. A still photo of Vince in a plain card (no video, no widget chrome) rises on "Vince", with his name card. On "Cheetah Technologies" the warehouse draws in beside it ("Cheetah · DC-01", no logo); on "three others" three smaller buildings slide in and join it. | Vince, now a Waya co-founder, was at Cheetah Technologies, a food distributor that had bought three others. | Vince · Waya co-founder / Cheetah Technologies · Fall 2022 / + 3 regional distributors · ~$24M revenue |
| 2 | 0:07.8–0:11.9 | As built. | When the rebuilt warehouse went live, customers got three items in four. | Go-live · Oct 2022 / Fill rate ~75% |
| 3 | 0:12.6–0:14.7 | As built, redrawn as a polished illustration (#25). | Pallets of fresh food rotted out back. | Shrink 28% in one week |
| 4 | 0:15.4–0:18.1 | As built. | Frozen pizza dough sat out until the yeast woke up. | Frozen · in the dry warehouse |
| 5 | 0:18.8–0:20.8 | As built. | It was burning about a million dollars a month. | ~$1M / month · contribution margin burn |
| 6 | 0:21.9–0:27.6 | **CHANGED (#33, #27, #26). No Vince video.** On "went to the floor" the camera moves down into the warehouse aisles: Lean's "go and see". The one-page gap analysis (A3 layout) dated Oct 22 sits over it. In its cause column two boxes: on "the process" the "Process" box is circled in mustard; on "not the people" the "People" box fades to grey. It is not struck out (respect for people). | On October twenty-second, Vince went to the floor and found the cause: the process, not the people. | Oct 22 · Go and see / Root cause: the process, not the people |
| 7 | 0:28.3–0:31.7 | **CHANGED (picture, #26): no Vince video.** The warehouse system location table, as built. | The building had changed. The warehouse system's logic never did. | New locations · no rules, no dimensions / Old aisles · still in the system / 1 item · up to 886 locations |
| 8 | 0:32.43–0:39.95 (text held to 0:40.75) | **CHANGED (#32 (1)). Key line, alone, in Vince's own voice; no face.** Everything dims to near-invisible. His words rise centred, phrase by phrase on his timing: "Every day the warehousing crew was fixing the problems," with a small sun; then "and the IT system was recreating them every night." with the sun turning to a moon. Attribution "— Vince" small under it. On screen ≥ 2.5 s (≈ 8.3 s). Lower the crescendo's lead under him (house rule 21). | **Vince (own voice, take 57.90–65.42):** So every day the warehousing crew was fixing the problems, and the IT system was recreating them every night. | "Every day the warehousing crew was fixing the problems, and the IT system was recreating them every night." — Vince |
| 9 | 0:41.25–0:44.25 | **CHANGED (#32 (2), T2).** The screen warms to cream. Section title "Two tracks, at once"; the tracker right; the two lane labels drop in on "Two tracks"; lane 1 lights on "Track one". The widget column stays empty here (#29). | Two tracks, at once. Track one, by hand. | Two tracks, at once / 1 · By hand · 2 · Fix the cause |
| 10a | 0:44.75–0:51.81 | **NEW (#32 (2), #29). Vince on camera, own voice.** The widget rises at 44.45 (0.3 s before his first word, his mouth still closed at take 81.68) and leaves 0.25 s after "warehouse" (ends 52.06). Centre: the count sheet, aisle by aisle, freezer locations filling in, and polished illustrations of execs, sales and operators in parkas on "everyone, executive, sales team, operators". On "24-7" a day/night clock spins once; on "cleaned up the warehouse" the tracker's shrink and fill lines start to turn. | **Vince (own voice, take 81.98–89.04):** So we got everyone, executive, sales team, operators. 24-7, we ran that until we cleaned up the warehouse. | Track 1 · by hand / Execs · sales · operators on the floor / Round the clock until it was clean |
| 10b | 0:52.41–0:53.91 | **CHANGED (#12, #28, T5).** The widget has gone. The count sheet slides aside for Na'ama, redrawn as a polished illustration: asleep on a cot in the warehouse office, a wall clock past midnight. Her name card. | Na'ama slept there. | Na'ama · Vince's co-founder · 16-hour days |
| 11 | 0:54.61–0:56.76 | As built (lane 2 lights; the system screen rebuilt). | Track two rebuilt the system's logic. | Track 2 · fix the cause / Fixed slots for fast movers, flexible for the rest / One item, one location |
| 12 | 0:57.46–1:00.16 | **CHANGED (T1, words only).** As built: the scanner's "Wrong item · scan blocked" on "barcode checks", then the standard-work sheet on "daily standard work". | Then barcode checks, and daily standard work. | Barcode checks · receiving, picking, loading, delivery / Daily standard work |
| 13 | 1:01.26–1:03.73 | As built. | Customers got ninety-nine items in a hundred. | Fill rate · ~75% → 99%+ |
| 14 | 1:04.43–1:07.53 | As built. | Lost stock fell to two percent, order errors to three. | Shrink · ~17–18% → ~2% / Orders with an error · ~22% → ~3% |
| 15 | 1:08.23–1:11.31 | As built. | The burn fell to two hundred sixty thousand a month by March. | Burn · ~$1M/mo → ~$260K/mo · Mar 2023 |
| 16 | 1:12.01–1:14.60 | As built (payoff alone). | By October twenty twenty-three, it was profitable. | Profitable · Oct 2023 |
| 17 | 1:15.90–1:19.40 | As built: the lens, Vince on camera, own voice; echo removed (#30). | **Vince (own voice, take 100.34–103.84):** You need to separate the symptom from the root cause. | The Waya lens / Symptom ≠ cause / Work both at once |
| 18 | 1:20.60–1:23.88 | As built (gap before it tightened, T4). | Talk to us, or run the same methods yourself with Lean AI. | Have a problem like this one? / Schedule a Call · See Lean AI |
| 19 | 1:23.88–1:26.48 | As built: the close card holds 2.6 s. | — | Waya wordmark / Have a problem like this one? / Schedule a Call · See Lean AI / wayaframes.com |

## CAPS (paste into `video.html`)

Planned times; the measured timing replaces them. Three cues are now Vince's own audio, marked `'VINCE'`, with the
take in/out as 5th and 6th elements.

**Index shift:** the lens cue moves from `CAPS[16]` to `CAPS[18]`, and the close from `CAPS[17]` to `CAPS[19]`.
`video.html` reads `L17 = CAPS[16][0]` and `CLOSE = CAPS[17][0]`; look these up by marker instead of by index.

**`render/vo.mjs` needs a change before it can voice this:**
- Today it handles one `'VINCE'` cue at `VINCE_LENS_OFFSET`.
- Its automatic end ("the first pause ≥ 0.45 s after the first 1.5 s") **would cut cue 10a in half**: there is a 0.98 s
  pause at take 85.24–86.22, between "operators." and "24-7".
- Each Vince cue must be cut at its own explicit take in/out, with no leading-silence trim (the lip-sync rule).

```js
const CAPS = [
  [0.60, 6.68, "Vince, now a Waya co-founder, was at Cheetah Technologies, a food distributor that had bought three others."],
  [7.78, 11.89, "When the rebuilt warehouse went live, customers got three items in four."],
  [12.59, 14.66, "Pallets of fresh food rotted out back."],
  [15.36, 18.08, "Frozen pizza dough sat out until the yeast woke up."],
  [18.78, 20.80, "It was burning about a million dollars a month."],
  [21.90, 27.60, "On October twenty-second, Vince went to the floor and found the cause: the process, not the people."],
  [28.30, 31.73, "The building had changed. The warehouse system's logic never did."],
  [32.43, 39.95, "So every day the warehousing crew was fixing the problems, and the IT system was recreating them every night.", 'VINCE', 57.90, 65.42],
  [41.25, 44.25, "Two tracks, at once. Track one, by hand."],
  [44.75, 51.81, "So we got everyone, executive, sales team, operators. 24-7, we ran that until we cleaned up the warehouse.", 'VINCE', 81.98, 89.04],
  [52.41, 53.91, "Na'ama slept there."],
  [54.61, 56.76, "Track two rebuilt the system's logic."],
  [57.46, 60.16, "Then barcode checks, and daily standard work."],
  [61.26, 63.73, "Customers got ninety-nine items in a hundred."],
  [64.43, 67.53, "Lost stock fell to two percent, order errors to three."],
  [68.23, 71.31, "The burn fell to two hundred sixty thousand a month by March."],
  [72.01, 74.60, "By October twenty twenty-three, it was profitable."],
  [75.90, 79.40, "You need to separate the symptom from the root cause.", 'VINCE', 100.34, 103.84],
  [80.60, 83.88, "Talk to us, or run the same methods yourself with Lean AI."],
];
// DUR = 86.48 (planned: close line ends 83.88; the card holds 2.6 s). Hard limit 90.0.
// New narrator lines to voice: CAPS[5], CAPS[8], CAPS[10], CAPS[12]. All others reuse the cached clips.
```

## Where the new and changed claims come from

| Row | Claim | Source |
|---|---|---|
| 6 | Oct 22, Vince found the root cause; "went to the floor" | [DOC] story; Oren's wording (#33); [TAKE] 44.94 "I dove in with employees and looked at their systems" |
| 6 | "the process, not the people" | Oren (#33, #27: "align with the principles of Lean"); [PAGE] "It was tempting to blame the crews. The gap analysis found something more precise" |
| 8 | crews fix by day, the system recreates the problems by night | [TAKE] 57.90–65.42; [DOC] "The crews fix the building by day and the system undoes it by night" |
| 10a | everyone (executives, sales, operators) on the floor; 24-7 until the warehouse was clean | [TAKE] 81.98–89.04; [DOC] execs, sales, engineers, supply chain counting in a freezer; [PAGE] corporate staff on the floor |
| 10b | Na'ama slept at the warehouse; 16-hour days (screen) | [DOC]; #12 |
| 17 | "separate the symptom from the root cause" | [TAKE] 100.34–103.84; [PAGE] the Waya lens |

**For the producer:** add `[TAKE]` (`VINCE-TRANSCRIPT.md`) to `FACTS.md`'s sources, with these three segments as
facts. They are Vince's own first-hand account, and they are now in the film.

## Where his words differ from FACTS.md, and how the screen handles it

1. **"IT system" (key line) vs "warehouse system".** The narrator's line 7 says "warehouse system", and Vince says "IT
   system" a second later. They mean the same thing.
   - Screen: his line is a quote, so it is printed verbatim with "— Vince". Line 7's on-screen system is the same
     warehouse-system screen, so the picture ties the two words together.
   - It is not changed to "warehouse system" on screen, because a quote must match the voice.
2. **"24-7" (Vince, about the whole operation) vs "16-hour days" (FACTS, about Na'ama).** These are two different
   claims and they don't conflict: the operation ran round the clock, and Na'ama worked 16-hour days.
   - "24-7" is new and comes only from the take. The screen paraphrases it as "Round the clock until it was clean"
     (row 10a) rather than printing "24/7" next to "16-hour days".
   - Na'ama's card keeps "16-hour days" from the doc. Oren may prefer to drop "16-hour days" from her card so the two
     numbers never sit near each other.
3. **"executive, sales team, operators" vs FACTS "execs, sales, engineers and supply chain".** Operators are new;
   engineers and supply chain are not said.
   - Screen: "Execs · sales · operators", his three, so screen and voice match. Engineers and supply chain are dropped
     from the screen too, since nothing in the voice names them.
4. **"warehousing crew" vs "crews".** Same meaning. The quote is verbatim.
5. **"cleaned up the warehouse"** generalises the doc's daily triage (staging lanes, top 1,000 items, one location per
   SKU, cycle counts). Consistent with it; no fix needed.
6. **"I dove in with employees and looked at their systems"** (take) vs Oren's "went to the floor". These are
   compatible: going and seeing, with the people who do the work, is what Lean means by it. Row 6's picture shows both,
   the aisles and the system.
7. **The lens: "root cause" (Vince) vs the page's "cause"**, and "then work both at once" is not spoken. That was
   already decided; the screen's "Work both at once" lands after his last word, as built.
8. **"Led the turnaround" (take, muted parts) vs "took over as COO" (#16).** Not in the film's audio now. The COO card
   on row 6 was attached to the widget, which has gone (#26). It needs a new home or is dropped (decision 3 below).

## Narrative issues (for the producer)

1. **Two tracks: nothing said twice, and the order matches the screens.**
   - The narrator names the tracks (row 9) and gives track two (row 11) and the follow-up (row 12).
   - Vince gives track one in his own words (10a); the narrator adds only Na'ama (10b).
   - "The whole company counting stock in the freezer" is gone: his "we got everyone…" replaces it. The freezer stays
     in the picture.
   - His own "first track was the IT system" (69.38–76.20) is not used, so the film's order stays lane 1 = by hand,
     lane 2 = fix the cause, as the screens show.
2. **"So" opens both of his first two lines.**
   - In the key line, "So" works as a hinge after line 7 ("…never did. So every day…"). Keep it; cutting it saves only
     0.1 s and risks clipping into the word.
   - In 10a it follows "Track one, by hand.", which also reads naturally.
3. **The widget is absent from most of the demo frame** (#29 over house rule 2: "the expert is there through the
   method"). Oren's instruction wins. The art director must recompose rows 9, 10b, 11 and 12 without the left column,
   or let the centre and the tracker use the space. The demo frame's three columns are no longer the standing layout
   for this video.
4. **Row 8 breaks the "nothing frozen" risk if the text sits still for 8 s.** Reveal it phrase by phrase on his word
   times (VINCE-TRANSCRIPT words, film time = take − 25.47), with the sun turning to a moon on "every night".
5. **Line 6 with "the process, not the people"**: the screen greys "People" out rather than striking it through.
   Striking a box labelled "People" would read as dismissing people, against Lean's respect for people.
6. **Na'ama now gets 1.5 s of voice** ("Na'ama slept there."). It reads cleanly after his "…cleaned up the warehouse".
   Her name card says who she is. Revert T5 (+0.7 s) to say "his co-founder" in the voice.
7. **The pain share drops to 15%** (13.0 s of 86.5 s), the bottom of the band. Fine.
8. **Level and room:** Vince is now on the soundtrack for 18.1 s, three different stretches of one take.
   - Match every one to the narrator's gated level, with the same de-echo, so the three sound like one person in one
     room (#23, #30).
   - Duck the music fully under each one.
9. **Unchanged invented-for-illustration list** (draft 2, issue 11), plus: the day/night clock spin, the parkas, and
   the "go and see" camera move.

## Decisions for Oren

1. **Planned 86.5 s with trims T1–T5 applied** (worst case about 88). OK, or revert any of them? Each revert's cost
   is listed above.
2. **Reserve trim R1, if the voiced cut runs long:** show Na'ama under Vince's "24-7" instead of voicing her line
   (−2.1 s)?
3. **"took over as COO"** has lost its place on the widget's name card (no widget at 22–30). Put it on row 6's A3 as
   "Vince · COO", or drop it?
4. **Na'ama's "16-hour days"** card next to Vince's "24-7": keep it or drop it (issue 2 in the differences list)?
5. **The intro still:** a frame from his take (matches the clip later) or the site headshot?
