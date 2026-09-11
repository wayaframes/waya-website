# PostHog Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent-gated PostHog analytics to all 10 static pages of the Waya site — autocapture, pageviews, heatmaps/scroll, and four custom conversion events — with the funnel ending at the CTA click. No GHL, no Cloudflare Worker (that's Phase 2).

**Architecture:** A single deferred external script, `assets/analytics.js`, loaded from every page's `<head>`. It shows a cookie-consent banner, initialises PostHog only after Accept, and wires four custom events by delegating clicks. A small CSS block in `assets/styles.css` styles the banner using existing design tokens. The 10 `index.html` files each gain exactly one `<script>` line.

**Tech Stack:** Vanilla ES5-safe JavaScript (no build step), PostHog JS (`array.js` from US Cloud), plain CSS. Verification is manual/browser-based — this repo has no test runner and adding one for a static site is out of scope.

**Spec:** [docs/superpowers/specs/2026-09-08-posthog-integration-design.md](../specs/2026-09-08-posthog-integration-design.md)

---

## File Structure

| File | Responsibility |
|---|---|
| `assets/analytics.js` (new) | Consent gate, PostHog init, custom-event wiring. The entire client integration. |
| `assets/styles.css` (edit, append) | Consent-banner styles only, using existing `--waya-*` tokens. |
| 10 × `index.html` (edit) | One `<script defer src="/assets/analytics.js">` line in `<head>`. |
| `docs/posthog-dashboard-setup.md` (new) | Click-by-click checklist to build the PostHog dashboard. |

Pages (all 10): `/`, `/about-us/`, `/scale-up-program/`, `/fundraising-narrative/`, `/data-room-preparation/`, `/financial-model-prep/`, `/operations-audit/`, `/waya-os-mcp/`, `/waya-os-mcp/setup/`, `/pre-pmf-mcp/`.

---

## Prerequisite: PostHog public key

- [ ] **Step 0: Get the project public API key**

In PostHog: **Settings → Project → Project API Key**. It starts with `phc_`. This is a client-side, write-only key and is safe to commit in a public static file. Keep it handy for Task 1.

---

## Task 1: Create `assets/analytics.js` (consent gate + PostHog init)

**Files:**
- Create: `assets/analytics.js`

- [ ] **Step 1: Write the file**

Create `assets/analytics.js` with exactly this content, then replace `phc_REPLACE_ME` on line with the key from Step 0:

```js
/* Waya website analytics — PostHog, consent-gated.
   Loaded on every page via <script defer src="/assets/analytics.js">.
   No build step: paste your PostHog public key into POSTHOG_KEY below. */
(function () {
  'use strict';

  var POSTHOG_KEY  = 'phc_REPLACE_ME';              // <-- your phc_… project key
  var POSTHOG_HOST = 'https://us.i.posthog.com';
  var ASSET_HOST   = 'https://us-assets.i.posthog.com';
  var CONSENT_KEY  = 'waya_analytics_consent';

  function getConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function setConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }

  /* ---- Load PostHog and initialise (called only on consent) ---- */
  function loadPostHog() {
    if (window.__wayaPHLoaded) return;
    window.__wayaPHLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = ASSET_HOST + '/static/array.js';
    s.onload = function () {
      window.posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        autocapture: true,
        capture_pageview: true,
        capture_pageleave: true,      // scroll depth rides along
        enable_heatmaps: true,
        persistence: 'localStorage+cookie',
        loaded: function () { wireCustomEvents(); }
      });
    };
    document.head.appendChild(s);
  }

  /* ---- Custom events (filled in Task 4) ---- */
  function wireCustomEvents() {}

  /* ---- Consent banner ---- */
  function showBanner() {
    var bar = document.createElement('div');
    bar.className = 'waya-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p class="waya-consent__text">We use cookies to understand how visitors use our site, ' +
      'so we can make it more useful. No ads, ever.</p>' +
      '<div class="waya-consent__actions">' +
      '<button type="button" class="waya-consent__btn waya-consent__btn--decline">Decline</button>' +
      '<button type="button" class="waya-consent__btn waya-consent__btn--accept">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.waya-consent__btn--accept').addEventListener('click', function () {
      setConsent('granted'); bar.parentNode.removeChild(bar); loadPostHog();
    });
    bar.querySelector('.waya-consent__btn--decline').addEventListener('click', function () {
      setConsent('denied'); bar.parentNode.removeChild(bar);
    });
  }

  /* ---- Entry ---- */
  function start() {
    var c = getConsent();
    if (c === 'granted') { loadPostHog(); return; }
    if (c === 'denied')  { return; }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
```

- [ ] **Step 2: Verify the key was replaced**

Run: `grep -n "phc_REPLACE_ME" assets/analytics.js`
Expected: **no output** (the placeholder is gone). If it prints a line, paste your real key.

- [ ] **Step 3: Commit**

```bash
git add assets/analytics.js
git commit -m "feat: add consent-gated PostHog loader

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Consent-banner styles in `assets/styles.css`

**Files:**
- Modify: `assets/styles.css` (append at end)

- [ ] **Step 1: Append the banner CSS**

Add to the very end of `assets/styles.css`:

```css
/* ============ COOKIE CONSENT ============ */
.waya-consent {
  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 1000;
  max-width: 720px; margin: 0 auto;
  display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  padding: 16px 20px;
  background: var(--waya-charcoal); color: var(--waya-cream);
  border: 1px solid var(--border-1); border-radius: 12px;
  box-shadow: var(--shadow-3);
  font-family: var(--font-body);
  animation: waya-consent-in var(--dur-base) var(--ease-standard);
}
.waya-consent__text { margin: 0; flex: 1 1 260px; font-size: 13px; line-height: 1.5; }
.waya-consent__actions { display: flex; gap: 10px; flex: 0 0 auto; }
.waya-consent__btn {
  font-family: var(--font-display); font-weight: 600; font-size: 14px;
  padding: 10px 20px; border-radius: 6px; cursor: pointer; border: 0;
  transition: filter var(--dur-fast) var(--ease-standard);
}
.waya-consent__btn--accept { background: var(--waya-rust); color: var(--white); }
.waya-consent__btn--accept:hover { filter: brightness(0.92); }
.waya-consent__btn--decline {
  background: transparent; color: var(--waya-cream);
  border: 1px solid rgba(250,247,241,0.35);
}
.waya-consent__btn--decline:hover { background: rgba(250,247,241,0.08); }
@keyframes waya-consent-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .waya-consent { animation: none; } }
@media (max-width: 520px) {
  .waya-consent { flex-direction: column; align-items: stretch; }
  .waya-consent__actions { justify-content: flex-end; }
}
```

- [ ] **Step 2: Verify the CSS parses (no stray braces)**

Run: `node -e "const c=require('fs').readFileSync('assets/styles.css','utf8');const o=(c.match(/{/g)||[]).length,x=(c.match(/}/g)||[]).length;console.log('open',o,'close',x,o===x?'OK':'MISMATCH')"`
Expected: `open N close N OK` (counts equal, ends `OK`).

- [ ] **Step 3: Commit**

```bash
git add assets/styles.css
git commit -m "style: add cookie consent banner styles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Load the script on all 10 pages

**Files:**
- Modify: all 10 `index.html` (one line each, in `<head>`)

- [ ] **Step 1: Confirm every page has the shared stylesheet anchor**

Run: `grep -rl '<link rel="stylesheet" href="/assets/styles.css">' --include=index.html . | grep -v '.git' | wc -l`
Expected: `10`. If it is not 10, stop and inspect which page differs before continuing (do that page by hand in Step 3).

- [ ] **Step 2: Insert the script tag after the stylesheet link in every page**

Run:
```bash
find . -name index.html -not -path './.git/*' -print0 \
  | xargs -0 perl -0pi -e 's{(<link rel="stylesheet" href="/assets/styles\.css">)}{$1\n<script defer src="/assets/analytics.js"></script>}g'
```

- [ ] **Step 3: Verify all 10 pages now reference the script exactly once**

Run: `grep -rc 'assets/analytics.js' --include=index.html . | grep -v ':0$'`
Expected: 10 lines, each ending `:1` (present exactly once per page). Any `:2` means a double-insert — revert that file with `git checkout <path>` and redo Step 2 for it only.

- [ ] **Step 4: Commit**

```bash
git add -- '*index.html'
git commit -m "feat: load analytics.js on all pages

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Wire the four custom events

**Files:**
- Modify: `assets/analytics.js` (replace the `wireCustomEvents` stub + add helpers)

- [ ] **Step 1: Replace the `wireCustomEvents` stub**

In `assets/analytics.js`, replace these two lines (the stub and its comment):

```js
  /* ---- Custom events (filled in Task 4) ---- */
  function wireCustomEvents() {}
```

with:

```js
  /* ---- Custom events ---- */
  var SERVICE_PATHS = {
    '/scale-up-program/':      'scale-up-program',
    '/fundraising-narrative/': 'fundraising-narrative',
    '/data-room-preparation/': 'data-room-preparation',
    '/financial-model-prep/':  'financial-model-prep',
    '/operations-audit/':      'operations-audit',
    '/waya-os-mcp/':           'waya-os-mcp',
    '/pre-pmf-mcp/':           'pre-pmf-mcp'
  };

  function parseQuery(href) {
    var out = {}, q = href.split('?')[1];
    if (!q) return out;
    q.split('#')[0].split('&').forEach(function (pair) {
      var kv = pair.split('=');
      out[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }
  function bookingService(href) {
    var m = href.match(/\/bookings\/([a-z0-9\-]+)/i);
    return m ? m[1] : null;
  }
  function outboundNetwork(href) {
    if (/linkedin\.com/i.test(href)) return 'linkedin';
    if (/youtube\.com/i.test(href))  return 'youtube';
    if (/substack\.com/i.test(href)) return 'substack';
    return null;
  }
  function internalService(href) {
    for (var p in SERVICE_PATHS) {
      if (SERVICE_PATHS.hasOwnProperty(p) && href.indexOf(p) !== -1) return SERVICE_PATHS[p];
    }
    return null;
  }
  function linkSource(a) {
    if (a.closest && a.closest('.nav-dropdown-menu')) return 'nav';
    if (a.closest && a.closest('footer'))             return 'footer';
    return 'grid';
  }

  function wireCustomEvents() {
    var ph = window.posthog;

    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';

      if (href.indexOf('leadconnectorhq.com') !== -1) {         // CTA → booking widget
        var u = parseQuery(href);
        ph.capture('cta_schedule_call_clicked', {
          location: u.utm_content || null,
          service:  bookingService(href),
          href: href
        });
        return;
      }
      var net = outboundNetwork(href);                          // thought-leadership outbound
      if (net) { ph.capture('outbound_click', { network: net, href: href }); return; }

      var svc = internalService(href);                          // internal service nav
      if (svc) { ph.capture('service_nav_clicked', { service: svc, source: linkSource(a) }); }
    }, true);

    ['carPrev', 'carNext'].forEach(function (id) {              // pillar carousel
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', function () {
        ph.capture('carousel_interacted', { direction: id === 'carNext' ? 'next' : 'prev' });
      });
    });
  }
```

- [ ] **Step 2: Syntax-check the file**

Run: `node --check assets/analytics.js`
Expected: no output (exit 0). Any `SyntaxError` must be fixed before continuing.

- [ ] **Step 3: Commit**

```bash
git add assets/analytics.js
git commit -m "feat: wire CTA, outbound, service-nav and carousel events

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Local end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Serve the site**

Run: `python3 -m http.server 8000`
(Serve, don't open via `file://` — matches the repo's preview workflow.)

- [ ] **Step 2: Consent banner appears, Decline loads nothing**

In a fresh browser profile, open `http://localhost:8000/`. 
Expected: banner at bottom. Open DevTools → Application → Local Storage: no `waya_analytics_consent` yet. Click **Decline**. 
Expected: banner disappears; `waya_analytics_consent = denied`; **no** request to `us.i.posthog.com` in the Network tab; no `ph_*` cookie set.

- [ ] **Step 3: Accept loads PostHog and fires a pageview**

Clear site data (or new profile). Reload, click **Accept**. 
Expected: `waya_analytics_consent = granted`; Network shows a request to `us-assets.i.posthog.com/static/array.js` then POSTs to `us.i.posthog.com`. In PostHog → **Activity** (live events), a `$pageview` for your visitor appears within a few seconds.

- [ ] **Step 4: Custom events fire**

With consent granted, on the home page:
- Click a **"Schedule a Call"** button → PostHog Activity shows `cta_schedule_call_clicked` with `location` (e.g. `hero`) and `service: waya-consultation`. (Use the browser Back button to return.)
- Click a **LinkedIn/YouTube/Substack** footer icon → `outbound_click` with the right `network`.
- Click a **service** link in the nav dropdown → `service_nav_clicked` with `source: nav`.
- Click the pillar carousel **‹ / ›** → `carousel_interacted` with `direction`.

- [ ] **Step 5: Heatmaps/scroll are on**

In PostHog → **Web Analytics** or the Toolbar on `localhost:8000`, confirm heatmaps are enabled (autocapture + `enable_heatmaps` produce `$autocapture` and scroll properties on `$pageview`/`$pageleave`). No code change — just confirm events carry `$autocapture`.

- [ ] **Step 6: Stop the server**

Press Ctrl+C in the server terminal.

---

## Task 6: Deploy to staging, verify, then production

**Files:** none (deploy only). Repo convention: `main` → www, `staging` → staging.wayaframes.com.

- [ ] **Step 1: Push staging**

You are on `staging`. Run: `git push origin staging`
Cloudflare Pages builds staging.wayaframes.com.

- [ ] **Step 2: Verify on staging**

Open `https://staging.wayaframes.com/`, Accept, and confirm in PostHog Activity that a `$pageview` arrives with `$current_url` on the staging domain. Click one CTA and confirm `cta_schedule_call_clicked`.

- [ ] **Step 3: Promote to production**

```bash
git checkout main
git merge --ff-only staging
git push origin main
git checkout staging
```
Then repeat the Accept + `$pageview` check on `https://www.wayaframes.com/`.

---

## Task 7: Build the PostHog dashboard

**Files:**
- Create: `docs/posthog-dashboard-setup.md`

- [ ] **Step 1: Write the dashboard checklist**

Create `docs/posthog-dashboard-setup.md`:

```markdown
# PostHog Dashboard — "Waya Website — Acquisition & Outcomes"

Build once in PostHog → New dashboard. Add these insights:

1. **Visitors per month** — Trends → Unique users of `$pageview`, interval = month.
2. **Best traffic sources** — Trends → `$pageview`, breakdown by `utm_source`; add a second tile broken down by `$referring_domain`.
3. **Landing pages** — Trends → `$pageview`, breakdown by `$pathname` (where they come in).
4. **Conversion funnel** — Funnels → step 1 `$pageview`, step 2 `cta_schedule_call_clicked`. Add breakdown by `utm_source`. (Bookings themselves live in GHL for now — Phase 2 adds `booking_completed` as step 3.)
5. **CTA by location** — Trends → `cta_schedule_call_clicked`, breakdown by `location`.
6. **Thought leadership** — Trends → `outbound_click` breakdown by `network`; second tile: `$pageview` where `$referring_domain` is one of linkedin.com / youtube.com / substack.com.
7. **What they read** — PostHog → Heatmaps; open each key page URL and review scroll + click maps (no tile needed).
```

- [ ] **Step 2: Build the dashboard in PostHog** by following the checklist. This is manual UI work; the events must have flowed at least once (Task 5/6).

- [ ] **Step 3: Commit the checklist**

```bash
git add docs/posthog-dashboard-setup.md
git commit -m "docs: PostHog dashboard setup checklist

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Done — Phase 1 complete

You now have: consent-gated PostHog on all 10 pages; autocapture + pageviews + heatmaps/scroll; four custom events; a funnel ending at CTA click; and a dashboard. Phase 2 (booking closed-loop via GHL webhook + Cloudflare Worker) remains documented in the spec, unbuilt until you ask.

## Notes / deviations from strict TDD

This repo has no JavaScript test runner and no build step. Adding one to unit-test a browser analytics loader would be disproportionate (YAGNI). Verification is therefore done against a running server and PostHog's live event feed (Tasks 5–6), which is the meaningful end-to-end check for this integration. `node --check` and brace-count checks stand in for a compile step.
