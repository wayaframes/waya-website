# Proof components: engineering contract

> **Decision, 2026-10-19:** Oren chose Direction C. Designs A and B, the A/B/C switcher and the /design-review/ page were removed. The Solutions pages later moved to plain-HTML story cards (problem, diagnosis, fix, results), so on those pages Design C draws only the charts.

Three designs (A, B, C, specified in `DIRECTIONS.md`) render the same data on the same pages. One loader picks the design.

## Files

| File | Owner | Purpose |
|---|---|---|
| `assets/proof/cases.js` | marketing lead | `window.WAYA_CASES`, `window.WAYA_GROUPS` (read the file for the shape) |
| `assets/proof/proof.js` | marketing lead | loader: sets `html.design-x`, loads `design-x.css` + `design-x.js`, calls your renderers |
| `assets/proof/proof.css` | marketing lead | plain no-JS styling of the fallback HTML |
| `assets/proof/design-a.css` / `design-a.js` | engineer A | Design A only |
| `assets/proof/design-b.css` / `design-b.js` | engineer B | Design B only |
| `assets/proof/design-c.css` / `design-c.js` | engineer C | Design C only |

Touch only your own two files (plus, if you need them, new files under `assets/proof/design-<x>/`). Never edit HTML pages, `proof.js`, `proof.css`, `cases.js`, or `styles.css`.

## Registration

```js
window.WayaProof.register('a', {
  strip(el, ctx) {},   // [data-proof="strip"]
  hero(el, ctx) {},    // [data-proof="hero"]  (problem pages)
  steps(el, ctx) {},   // [data-proof="steps"] (problem pages)
  cases(el, ctx) {}    // [data-proof="cases"] (problem pages)
});
```

The loader calls each function once after DOMContentLoaded, inside try/catch. When one throws, the plain HTML stays. On success the container gets the class `proof-enhanced`.

`ctx`:
- `design`
- `cases`: the case objects for this container, in page order, each with `slug` added. Cases missing from the data are already dropped.
- `group`: the WAYA_GROUPS entry, or null
- `groupId`
- `bookingUrl`: use it exactly as the href of the booking button
- `reducedMotion`: boolean

## The containers and their fallback HTML

Strip (home, `/scale-up-program/`, `/operations-audit/`):
```html
<div class="proof" data-proof="strip" data-cases="slug,slug" data-root="ops-intro-call">
  <ul class="proof-list">
    <li class="proof-item" data-case="slug">
      <a class="proof-link" href="/case-studies/slug/">
        <span class="proof-kicker">Cheetah · Support</span>
        <span class="proof-metric"><span class="proof-label">First response</span>
          <span class="proof-before">22 hours</span> <span class="proof-arrow" aria-hidden="true">→</span>
          <span class="proof-after">6 minutes</span></span>
        <span class="proof-summary">…</span>
        <span class="proof-more">Read the case study</span>
      </a>
    </li>
  </ul>
  <p class="proof-cta"><a class="btn-rust" href="https://api.leadconnectorhq.com/widget/bookings/ROOT?utm_button=proof">Schedule a Call</a></p>
</div>
```
The section eyebrow and `<h2>` sit OUTSIDE the container. Leave them alone.

Problem pages (`/what-we-fix/margins-and-cash/`, `/scaling-through-change/`, `/faster-service/`):
- `<section class="hero compact proof-hero" data-proof="hero" data-group="…">` holds `.hero-inner > .hero-content` with `p.eyebrow`, `h1`, `p.sub` (the hook). You may add visuals and restyle, but keep the `h1` element and all of the text. Do not remove `.hero-inner`.
- `<ol class="proof-steps" data-proof="steps" data-group="…">` has three `<li><span class="proof-step-n">1</span><h3>Title</h3><p>Text</p></li>`. You may replace the inner markup, but every step title and text must remain readable text.
- `<div class="proof" data-proof="cases" data-group="…">`: the same `.proof-list` as the strip. Each item also has `<span class="proof-metrics">` with the extra metrics, and there is a link to the program. There is no booking button inside; the page's final CTA follows.

## Rules
- **Data only.** Never type a number or claim in JS that isn't in `cases.js`. Show values from `fmtBefore`/`fmtAfter`. Draw to scale only when both `before` and `after` are numbers above 0 (see the "comparable" helper in DIRECTIONS.md).
- **Links.** Every case stays a link to `case.url`. Booking buttons use `ctx.bookingUrl` and the class `btn-rust`. `analytics.js` tracks clicks on that class and appends UTMs at click time.
- **Styling.** Tokens only (`var(--waya-*)`, `--fg-*`, `--border-1`, `--shadow-*`, `--font-*`), plus `color-mix()`. No new hex values. Scope every rule under `html.design-x`.
- **No dependencies.** Vanilla JS, ES2018, no external libraries or fonts. Inline SVG is fine.
- **Must hold up:**
  - 375px wide with no horizontal scroll
  - keyboard reachable, with visible focus
  - screen readers get the text sentence for each result
  - `ctx.reducedMotion` shows the final state with no animation
  - IntersectionObserver for scroll triggers
  - no layout shift above the fold
- **Voice.** No exclamation marks or hype words. Keep microcopy to labels such as "Before", "After", and "Read the case study".
