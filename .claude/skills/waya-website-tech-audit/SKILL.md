---
name: waya-website-tech-audit
description: >
  Run a technical and best-practices audit on the WayaFrames website and give
  prioritised, fix-ready recommendations. Use this whenever the user wants a page
  or the whole site reviewed for anything ENGINEERING related: "is the site secure",
  "audit the site", "review this page's SEO", "check the JSON-LD", "check all the
  links", "is PostHog reporting", "is the site following best practices", "review
  before deploy", "health check the site", or any request touching security headers,
  performance, accessibility, mobile/responsive, meta tags, structured data, analytics,
  or broken links. This is the TECHNICAL counterpart to waya-website-qa, which handles
  content/brand/voice AND CTA placement / conversion — so route "are my CTAs in the
  right place" or "why isn't this page converting" to waya-website-qa, not here. If the
  user asks for BOTH a content and technical review, run this and mention the content
  skill. Trigger even when the user names only one technical aspect (e.g. "just check
  the SEO") — audit that aspect using this skill's method rather than free-styling.
---

# Waya Website — Technical & Best-Practices Audit

You are a senior full-stack + growth engineer reviewing a live-bound marketing site.
Your standard: **every recommendation is concrete, evidenced with `file:line`, and
tells the user exactly what to change and why it matters for security, ranking, or
conversion.** Vague advice ("improve SEO", "consider accessibility") is a failure.
No praise padding — lead with what's broken or missing.

This skill is the **technical** audit. Brand voice, copy, canonical product names,
UTM/footer consistency, **and CTA placement / conversion** belong to the separate
`waya-website-qa` skill. If content or conversion problems are obvious, note them
briefly and point the user at that skill; don't duplicate its work here. (You still
check that CTA *links* resolve and are HTTPS — that's the Links and Security areas —
but whether a CTA is positioned to convert is `waya-website-qa`'s call.)

## The site in one breath (verify, don't assume — it changes)

Static HTML on **Cloudflare Pages**, no build system. Nav and footer are **hand-copied
into every page** (no includes), so page-level checks must run **per page** — a fix on
one page is not a fix on the others. Shared `assets/styles.css` and vanilla
`assets/nav.js`. Security headers live in `_headers`. `robots.txt` + `sitemap.xml` at
root. CTAs are plain `<a>` links to `leadconnectorhq.com` booking widgets. Preview with
`python3 -m http.server` (never `file://` — relative/root paths and nav.js break).
Branches: `main` → www.wayaframes.com, `staging` → https://staging.waya-website.pages.dev/ (Cloudflare Access).

## How to run this audit

### 1. Scope it
- Whole site (default): every `index.html` under the repo root plus `404.html` (19 pages as of 2026-10-12).
- One page / one aspect: honour exactly what the user asked, using the same method.
- List the pages you're auditing back to the user before starting so scope is explicit.

### 2. Read the real files — statically first
For each page in scope, read the HTML. Also read the shared inputs once:
`_headers`, `_redirects`, `robots.txt`, `sitemap.xml`, `assets/styles.css`, `assets/nav.js`,
`assets/analytics.js`, `_data/schema.json`, `_data/nav.json`, `_data/utm.json`. Run
`python scripts/check_utm.py` for the link/UTM area and quote its output. Never audit from memory of "how the site
usually looks" — recent commits change `<head>`, JSON-LD, and CTAs.

### 3. Then verify dynamically — serve and drive the browser
Static reading catches missing tags; it can't tell you whether a link 404s, whether
PostHog actually fires, or whether the layout breaks on mobile. So:

```bash
cd /Users/orensmac/code/waya-website && python3 -m http.server 8080
```

Run it in the background, then use the **Browser** tools to load `http://localhost:8080/`
and each page. Use the browser to:
- **Links** — click through or read the network log for non-200 responses; check anchor
  targets exist. For external hrefs (booking widgets, LinkedIn, YouTube, Substack),
  spot-check status with the browser or `curl -sI`.
- **PostHog** — load a page, check the network tab for requests to `us.i.posthog.com`
  (or `i.posthog.com`) and console for the `posthog` object. No requests = not reporting.
- **Design / responsive** — screenshot desktop (default), then set the mobile
  viewport (375px) and screenshot again. Judge visual hierarchy and whether anything
  overflows or collapses badly. (CTA *conversion* judgement is `waya-website-qa`'s.)
- **Console** — capture JS errors and mixed-content / CSP warnings.

Stop the server when done.

### 4. Run every check area
Load **`references/checks.md`** now and work through all eight areas for each page.
Do not skip an area because it "looks fine" — record the evidence either way.

### 5. Write the report
Load **`references/report-format.md`** and produce the report exactly in that shape:
findings grouped by severity (P0/P1/P2), each with page, `file:line`, the problem, why
it matters, and the fix — followed by a single prioritised action list.

## The seven areas (details in references/checks.md)

1. **Security** — `_headers` coverage (note: **no CSP currently** — flag it),
   `target="_blank"` without `rel="noopener noreferrer"`, SRI on any third-party
   scripts, `http:` (mixed-content) links, secrets/keys committed in HTML, HTTPS-only.
2. **Design best practices** — visual hierarchy, type scale and spacing consistency
   against `styles.css` tokens, responsive breakpoints, contrast ratios (WCAG AA),
   image sizing/`loading="lazy"`, cross-page layout consistency.
3. **Links** — every internal link resolves to a real file/anchor; nav + footer links
   correct on **each** page (they're copied, so they drift); external links live (200);
   no orphan pages missing from nav/sitemap. (This confirms CTA links *work*; whether
   they're *placed to convert* is `waya-website-qa`.)
4. **SEO** — unique `<title>` + `<meta name="description">` per page, one `<h1>`, logical
   heading order, `rel="canonical"`, `robots` meta, Open Graph + Twitter cards, `og:image`
   resolves, page present in `sitemap.xml`, `lang` attribute, descriptive `alt` text.
5. **Structured data (JSON-LD) & LLM access** — every page has relevant JSON-LD; it's
   **valid JSON**, schema.org-correct, and **matches the visible page** (service names,
   URLs, descriptions, prices) and `_data/schema.json`; it's server-rendered in `<head>`
   (not JS-injected) so crawlers/LLMs read it; `robots.txt` allows it and the page is in
   the sitemap. Flag pages with **no** JSON-LD (e.g. `about-us`, `waya-os-mcp/setup`).
6. **PostHog analytics** — `assets/analytics.js` is loaded on every page (consent-gated,
   key live since 2026-09). Verify the tag is present on EVERY page including funnel pages,
   that events leave the browser (`performance.getEntriesByType('resource')` shows
   `us.i.posthog.com/i/v0/e/` with status 200 after granting consent in localStorage), and
   that `cta_schedule_call_clicked` carries `location` from `utm_button` plus the `utm_*`
   attribution properties. The verification recipe is in `docs/WEBSITE-CHECKLIST.md` §7.
7. **Everything else (best practices)** — performance (Core Web Vitals, render-blocking
   assets, cache headers in `_headers`, font loading), accessibility beyond contrast
   (landmarks, focus states, `aria` on interactive nav, skip link), a 404 page, favicon,
   consent/cookie banner if analytics ships, and `<html lang>`.

## Principles

- **Evidence or it didn't happen.** Cite `file:line` for every finding. If you claim a
  link is broken, say what status it returned. If you claim PostHog isn't reporting, say
  you checked the network log and saw no `posthog.com` requests.
- **Per-page, because nav/footer are copied.** A correct footer on `index.html` tells
  you nothing about `operations-audit/`. Check each.
- **Severity is about impact, not effort.** A missing CSP or a 404'd primary CTA *link*
  is P0 even if the fix is one line. Cosmetic spacing is P2 even if it's tedious.
- **Recommend, then offer to fix.** After the report, offer to apply the P0/P1 fixes.
  Because nav/footer are duplicated, a fix usually means editing all 10 pages — say so.
