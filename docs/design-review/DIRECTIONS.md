# Proof components: three design directions

> **Decision, 2026-10-19:** Oren chose Direction C. Designs A and B, the A/B/C switcher and the /design-review/ page were removed. The Solutions pages later moved to plain-HTML story cards (problem, diagnosis, fix, results), so on those pages Design C draws only the charts.

Scope: proof strips (home, /scale-up-program/, /operations-audit/) and the three /what-we-fix/ problem pages (hero, steps, cases, CTA). Copy is fixed. Each direction is one `design-x.css` + `design-x.js`, scoped under `html.design-x`.

## Shared rules (all directions)

- **Tokens only.** `--waya-*`, `--fg-*`, `--border-1`, `--shadow-1/3`, `--dur-*`, `--ease-standard`. Tints via `color-mix(in srgb, var(--waya-sage) 18%, transparent)`. No new hex.
- **Fonts.** Numbers and titles: `--font-display` (Space Grotesk, 600/700, `font-variant-numeric: tabular-nums`). Labels and body: `--font-body`.
- **The number is text.** Every graphic is `aria-hidden="true"`. Next to it, a visible or `.sr-only` sentence built from data: `"{headline.label}: {fmtBefore} to {fmtAfter}"`. Animated counters write into an `aria-hidden` span. The real value sits in a sibling text node from the first paint, so screen readers never hear intermediate values.
- **Booking button.** `<a class="btn-rust" href="https://api.leadconnectorhq.com/widget/bookings/{root}?utm_button=proof">`. Build the href from `data-root` or `group.root` only, and never add parameters.
- **Enhance, don't break.** If `WAYA_CASES[slug]` is missing, skip that case. If the result has fewer than 2 cases, leave the server HTML untouched.
- **Magnitude helper** (shared by B and C; write it once per design file):
  `num(v)` = `typeof v === 'number' ? v : NaN`. `ratio = better==='down' ? before/after : after/before`. A result is **scalable** only when both values are finite and greater than 0. Anything else ("profitable", null before, "no live queue", ranges given as strings) is **qualitative**: show `fmtBefore → fmtAfter` as text with the design's qualitative treatment, and never invent a number.
- **Mixed units.** Always display `fmtBefore`/`fmtAfter`, never `before + unit`. For "22 hours → 6 minutes", assume `before`/`after` share a base unit (minutes). If they don't, the data is wrong; flag it, don't convert in the UI.
- **Reduced motion:** `matchMedia('(prefers-reduced-motion: reduce)')`. Render the end state immediately with no transitions, and keep the interactive controls working (instant).
- **375px:** test at 375×667. No element wider than `100%`, SVGs use `viewBox` + `width:100%`, long `fmtAfter` strings wrap (`overflow-wrap: anywhere` on values).

---

## Direction A — "The Ledger"

**Concept:** each result is an entry in an operator's ledger. The visitor drags a wipe across the before and after columns of the books, like an auditor closing a period, and feels the result is concrete and checked.

**Motion language:** horizontal wipes, split-flap number changes, ruled lines drawing left to right. No curves and no gauges. Typographic and editorial.

### Strip
- **Desktop (≥960px):** a full-width `--waya-paper` band. Max-width 1140, padding 96px 32px. A 12-column grid: the left 4 columns hold an eyebrow label ("Results", 12px caps, 0.14em, `--fg-2`) and the booking button pinned to the bottom of the column (sticky inside the section). The right 8 columns hold the ledger: one row per case, separated by 1px `--border-1` rules. Each row has a kicker + company (13px caps, `--fg-2`), the headline label (16px body, `--waya-charcoal`), then two value cells, **Before** (`--waya-stone`, 40px display 600, struck through with a 2px `--waya-rust` line) and **After** (`--waya-ink`, 56px display 700). The row links to `case.url`.
- **The wipe (the bold element):** one range input above the ledger, styled as a vertical 2px `--waya-rust` hairline with a 28px round handle (`--waya-cream` fill, rust border). It controls a CSS var `--wipe` (0–100%). Every row's value cell stacks Before and After in one grid area, and After is revealed with `clip-path: inset(0 calc(100% - var(--wipe)) 0 0)`. The wipe starts at 0 (before). When the strip enters view (IntersectionObserver, threshold 0.4), the wipe animates 0→100% over 1100ms (`cubic-bezier(.2,.7,.2,1)`), with rows staggered by 90ms. The user can drag it back to compare. Arrow keys step 10%, Home/End jump. `aria-label="Compare before and after"`, `aria-valuetext` = "Before" / "After" / "{n}% revealed".
- **Split-flap:** as the wipe crosses 50%, each After number flips once (a 180ms `rotateX` on a `::before` duplicate). It is decorative only.
- **Hover/focus on a row:** the row background becomes `color-mix(in srgb, var(--waya-tan) 14%, transparent)`, a rust 3px left rule appears, and the label underlines. Focus-visible: a 2px `--waya-rust` outline with 4px offset.
- **375px:** a single column. The eyebrow goes first, then the wipe control (full width), then rows where Before stacks above After (each value 32/44px). The button sits after the last row, full width, 52px tall.
- **4 vs 2 cases:** rows are fixed-height (min 112px), so 2 cases simply make a shorter ledger. Don't stretch.

### Problem page
- **Hero:** `--waya-cream`. The title is 64px display 700 (40px at 375). The hook is set as a pulled quote in 22px body italic with a 4px `--waya-mustard` left rule. Visual: a "ledger page" SVG on the right made of 8 ruled lines, where the before figures from the group's cases (`fmtBefore`, `--waya-stone`) are typed in, then struck through in rust on load (600ms stagger 120ms). At 375 it moves under the hook at 160px tall.
- **Steps:** three ledger columns titled "01 / 02 / 03" (display 700, 14px, rust). A top rule draws left→right across all three as they scroll in (900ms). Each column has a title (22px display 600) and text (16px body, `--fg-2`). At 375 they stack, and the rule becomes a vertical line on the left.
- **Cases:** each case is a full "entry". The headline uses the strip row treatment at 1.25× scale, and **all** `metrics` go below it as a compact 2-column ledger table (`<table>`, real `<th scope="row">`, before/after columns). The wipe control is shared across the whole section.
- **CTA:** a `--waya-ink` band with the program name in 32px display (cream) and the rust button.

**No-JS:** the server HTML already shows Before → After text. The CSS shows both values side by side (After visible), and the range input is hidden until JS adds `.is-live`.

**Pitfalls:** clip-path on text needs the Before and After cells in the same grid cell with equal width. Use `min-width: 9ch`. A qualitative After ("profitable") is shown at 40px instead of 56px so it doesn't overflow. "20–25%" stays as a string, so use the non-breaking en dash. Only strike Before through for scalable results; for qualitative ones use stone without the strike.

---

## Direction B — "Control Room"

**Concept:** an instrument panel where each case is a gauge whose needle swings from the red zone to where the operation runs now. The visitor picks a case like switching channels, and feels Waya fixes the system that drives the number.

**Motion language:** rotation and spring. Needles overshoot and settle. Dark ink surfaces with mustard and mint readouts. Interactive and focused on one case at a time.

### Strip
- **Desktop:** a `--waya-ink` section with cream text, padding 88px 32px, and a 1px `color-mix(in srgb, var(--waya-cream) 12%, transparent)` grid texture (CSS `background-image` linear-gradients, 32px cells). The layout is a two-column 7/5 split.
  - **Left: the dial.** An SVG 240° arc gauge, 360px wide. The track is `color-mix(cream 14%)`, 14px stroke. The zone from the start to the before position is tinted `--waya-rust` at 60%, and the after zone is `--waya-sage`. The needle is a 3px `--waya-mustard` line with a cream hub. Under the dial: the headline label (14px caps, `color-mix(cream 70%)`), then Before (28px, `--waya-fog`) → After (72px display 700, `--waya-mint`).
  - **Right: the channel picker.** A `role="tablist"` with one tab per case: kicker (11px caps, `--waya-fog`) + title (17px display 600, cream). The active tab has a 3px mustard left bar and a `color-mix(cream 8%)` fill. Below the tabs: summary (15px, `--waya-fog`, 3-line clamp), a "Read the case" link (mint, underline on hover), and the **rust button** at the bottom of the right column.
- **Gauge mapping:** for scalable results, map onto a log scale so a 22h→6min change and a 75%→99% change both read clearly. `pos(v) = clamp(log(v/min)/log(max/min))`, with min/max = the smaller/larger of before and after, padded by 15% each side. If `better==='down'`, flip the dial direction so "good" is always clockwise. **Qualitative:** the needle sweeps to a fixed "target" mark at 85%, and the after readout prints the text.
- **Motion:** on view (threshold 0.5), the needle starts at the before position, holds 300ms, then rotates to after over 900ms with spring `cubic-bezier(.34,1.56,.64,1)`, while the After number counts up (aria-hidden span, 900ms, rAF). Switching a tab re-runs the sweep from that case's before position (600ms). Auto-advance: none. The visitor controls it.
- **Keyboard:** arrow keys move between tabs (roving tabindex), and the tabpanel has `aria-live="polite"` announcing "{label}: {fmtBefore} to {fmtAfter}".
- **Hover/focus:** tabs fill on hover. On focus-visible they get a 2px mustard outline. The needle hub pulses once (scale 1.15, 200ms) on tab change.
- **375px:** one column. The dial is 100% width (max 320), and the tabs become a horizontal scroll-snap row of chips (`overflow-x: auto` **inside** the row only, `scroll-snap-type: x mandatory`, chip min-width 180px, with a fade mask on the right edge). The summary and button follow, with the button full width.
- **2 vs 4 cases:** the tabs stack, so 2 tabs leave empty space. Vertically centre the tablist, and with 2 cases show each tab at 2× padding.

### Problem page
- **Hero:** full-bleed `--waya-ink`, echoing the experiment-platform particle hero. The title is 72px display 700 (40px at 375), and the hook is in `--waya-fog`. Visual: a big background gauge (520px, 40% opacity) idling in the rust zone with a slow 4s wobble (±3°). When the visitor scrolls past 30% of the hero, the needle sweeps to sage. This states the problem ("you're in the red").
- **Steps:** a three-position **rotary switch** (SVG knob, 160px) on the left, with step cards on the right. Clicking a card or pressing arrow keys turns the knob to 1/2/3 (rotate 300ms), and the active card gets a mint left bar. Scroll also advances it: each step activates as it crosses 50% of the viewport. At 375 the knob sits sticky at the top of the section (96px), with the cards scrolling under it.
- **Cases:** a bank of 2–3 small gauges in a row (each 220px), one per case, all sweeping together on view. Under each: title, headline before → after, and up to 3 extra `metrics` as horizontal "bar meters" (6px tall, fog track, sage fill at `pos(after)`, before tick in rust). At 375 the gauges stack.
- **CTA:** stays on ink. The program name is in mustard caps, and the button is rust.

**No-JS:** the server HTML is shown on ink styling: a static list of cases, each with before → after text, and the button. The tablist is not created.

**Pitfalls:** log of 0 or negative values breaks, so treat them as qualitative. A plain `<details>` fallback is not needed because the tabs are JS-built. Check contrast: `--waya-fog` on ink passes for body text, and `--waya-stone` on ink does not, so never use it there. Hospital "5 months → 2 months" and "29 min → 23.7 min" are both `down`; check the dial flips. Planning-okrs "$7.3M → ~$10M, profitable" must use `fmtAfter` as given.

---

## Direction C — "The Climb"

**Concept:** every case is a route up a mountain. As the visitor scrolls, a trail draws itself from base camp (before) to the ridge (after), passing the waypoints Waya used. The visitor feels the result came from a path anyone can walk, step by step. This builds on the site's existing mountain imagery and "Your Path" waypoints.

**Motion language:** scroll-scrubbed line drawing (`stroke-dashoffset` tied to scroll progress), slow parallax, and elevation markers. Vertical, narrative, unhurried.

### Strip
- **Desktop:** a `--waya-cream` section with a faint contour-line SVG background (6 wavy paths, `--waya-tan` at 25%, aria-hidden). The cases are in a horizontal row of 2–4 equal **route cards** (CSS grid `repeat(auto-fit, minmax(240px, 1fr))`, gap 20px), each 320px tall with a `--waya-paper` background, 18px radius, and `--shadow-1`.
  - **Each card:** an SVG elevation profile on the top 55% of the card: a polyline from bottom-left (before) to top-right (after), with 2–3 intermediate bumps drawn from `metrics.length`. The fill under the line is `color-mix(sage 22%)`, and the line is a 3px `--waya-sage` stroke. Base camp is a rust dot labelled `fmtBefore` (14px, `--waya-stone`). The summit is a mustard flag labelled `fmtAfter` (40px display 700, `--waya-ink`), placed below the SVG, never inside it, so it wraps. Under it: the headline label and kicker.
  - **Climb height:** for scalable results the height is `0.35 + 0.65 × clamp(log(ratio)/log(20))` of the box, so bigger wins climb higher. Qualitative results always reach 0.85 with a dashed final segment.
- **Motion:** scroll-scrubbed. Section progress p (0 when the top hits 85% of the viewport, 1 when it hits 35%) drives each card's `stroke-dashoffset`, with cards offset by 0.08 each. The flag drops in (translateY −12px → 0, 240ms) once its card's p reaches 1. Throttle with one rAF per scroll. Once complete, stop listening (no scrubbing back).
- **Booking button:** centered below the cards, 56px tall rust pill, with a 1px dashed `--waya-sage` "trail" line running from the last card's summit down to it (desktop only).
- **Hover/focus on a card:** lift (`translateY(-4px)`, `--shadow-3`, 220ms), and the summit flag waves (8° rotate, 300ms). Focus-visible: a 2px `--waya-sage` outline.
- **375px:** the cards stack in one column, each 260px tall with the profile at 50%. The button is full width. The trail connector is hidden.
- **2 vs 4:** with auto-fit, 2 cards get wider (max 520px each, centered), and 4 cards go 2×2 between 960 and 1180px.

### Problem page
- **Hero:** a `--waya-paper` background with a layered SVG mountain range of 3 ridgelines (`--waya-tan`, `--waya-sage`, `--waya-charcoal` at 70%), in slow parallax (0.1/0.2/0.3× scroll). The title is 68px display 700 (40px at 375), and the hook is 20px body. A small "you are here" rust marker sits at the base of the range, pulsing once.
- **Steps:** a **trail map**. One SVG path snakes down the section (switching sides on desktop, a straight left rail at 375), with the 3 steps as waypoints (48px circles: cream fill, sage stroke, number in display 700). The path draws with scroll, and each waypoint fills sage with a cream number as the line reaches it. The text cards sit beside each waypoint.
- **Cases:** a vertical **timeline** of the 2–3 cases. Each case gets a wide route card (profile 100% width, 200px tall) with its `metrics` as elevation markers along the profile: small ticks with labels underneath in a `<dl>` (label, before → after). `timeframe`, when present, prints at the summit ("14 months"). When it is null, omit it.
- **CTA:** a "summit" band in `--waya-charcoal` with a single mustard flag icon, the program name, and the rust button.

**No-JS:** cards render with the profile already drawn (`stroke-dashoffset: 0` by default; JS sets it to the length only after measuring). The trail map path is static and the parallax is off.

**Pitfalls:** use `getTotalLength()` after fonts load (`document.fonts.ready`), and don't hardcode lengths. Make sure scroll listeners are passive. Profiles must not suggest false precision: label the axis nowhere and keep the shape stylised, because only the endpoints are data. The cash-float headline ("~$1M freed") may have a null before, which makes it qualitative. Turnaround has a multi-step after (`$260K → profitable`); use only `fmtAfter`. Don't plot intermediates.

---

## Comparison

- **A, The Ledger:** best at credibility and scannability. It reads like audited numbers and suits finance-minded buyers. Main risk: it may feel too quiet next to the bold experiment-platform pages, and the wipe is easy to miss on touch.
- **B, Control Room:** best at drama and focus. It gives one result at a time, with a strong hands-on feel. Main risk: log-scale gauges with mixed data need careful QA, the dark band changes the tone of the home page, and the tabs hide 3 of 4 cases at a glance.
- **C, The Climb:** best at storytelling and brand fit. It ties results to the site's path and mountain language and to the 3-step method. Main risk: scroll-scrubbed SVG is the most engineering work and the most prone to jank, and stylised profiles could read as made-up charts if they aren't kept abstract.
