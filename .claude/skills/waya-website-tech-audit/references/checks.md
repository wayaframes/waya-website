# Technical Audit Checklist

Work through every area for every page in scope. For each check, record: pass, or a
finding with `file:line`, the problem, why it matters, and the fix. "Not applicable" is
a valid result — say so rather than skipping silently.

Verification legend: **[static]** readable from the HTML/config; **[browser]** requires
loading the served page and inspecting render/network/console; **[curl]** external HTTP
check.

---

## 1. Security

- [static] **Security headers in `_headers`.** Confirm `X-Frame-Options`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`,
  `Permissions-Policy` are present. **`Content-Security-Policy` is currently missing** —
  flag it (P1). A CSP is the main defence for a static marketing site against injected
  scripts; propose a starter policy that allows self + the booking-widget and (once it
  ships) PostHog origins.
- [static] **`target="_blank"` needs `rel="noopener noreferrer"`.** Without it the opened
  page can control `window.opener` (reverse tabnabbing) and referrer leaks. Grep each page.
- [static] **Subresource Integrity (SRI) on third-party scripts.** Any `<script src>` to a
  domain you don't control should carry `integrity=` + `crossorigin`. (PostHog's snippet
  is an exception — it self-updates; note that.)
- [static/browser] **No mixed content.** All `href`/`src` must be `https:` (or root/relative).
  A single `http:` asset breaks the padlock and is blocked by browsers. Check console for
  mixed-content warnings.
- [static] **No secrets in the HTML.** API keys, tokens, private booking IDs, internal
  URLs. A PostHog *public* project key is fine to expose; a personal/private key is not.
- [static] **External embeds** (booking widget, YouTube) load over HTTPS from expected
  origins only.

## 2. Design best practices

- [browser] **Visual hierarchy.** One clear focal point per section; headings, body, and
  CTA are visually distinct. Screenshot and judge — does the eye land on the primary action?
- [static] **Type & spacing consistency.** Sizes, weights, and spacing come from the
  `styles.css` tokens/variables, not one-off inline values. Flag inline `style=` that
  overrides the system.
- [browser] **Responsive.** Load at 375px (mobile) and ~768px (tablet). Nothing overflows
  horizontally; nav collapses correctly; text stays readable; images scale. Screenshot both.
- [static/browser] **Colour contrast (WCAG AA).** Body text ≥ 4.5:1, large text ≥ 3:1
  against its background. Check the brand sage/green combos specifically.
- [static] **Images.** Explicit `width`/`height` (prevents layout shift), `loading="lazy"`
  on below-the-fold images, modern format where practical, real `alt` text.
- [browser] **Cross-page consistency.** Header, footer, spacing rhythm, and button styles
  match across all pages (they're copied, so they drift).

> **CTA placement & conversion is out of scope here** — it lives in the `waya-website-qa`
> skill (Category 8, Customer Journey & Conversion). This skill only confirms CTA *links*
> resolve and are HTTPS (areas 3 and 1). If you notice a CTA that clearly can't convert
> (e.g. no above-the-fold CTA), mention it in one line and point the user at
> `waya-website-qa`; don't audit conversion here.

## 3. Links

- [static] **Internal links resolve.** Every `href="/..."` maps to a real file
  (`/foo/` → `foo/index.html`). Every `#anchor` has a matching `id` on the same page.
- [static] **Nav + footer correct on EACH page.** They're hand-copied, so compare each
  page's nav/footer link set against `_data/nav.json` and the canonical footer. A stale
  copy links to the wrong or missing pages.
- [curl/browser] **External links live.** Booking widgets, LinkedIn (`naamamoran`),
  YouTube (`@Waya-Frames`), Substack (`@themessymiddlefiles`) return 200, not 404/redirect
  loops. Spot-check with the browser network log or `curl -sI`.
- [static] **No orphan pages.** Every real page is reachable from nav or footer and listed
  in `sitemap.xml`; every sitemap URL exists.
- [static] **No `href="#"` / `href=""` / `javascript:void(0)` dead CTAs.**

## 4. SEO

- [static] **Unique `<title>` per page**, ~50–60 chars, front-loaded with the page's intent.
- [static] **Unique `<meta name="description">`**, ~140–160 chars, per page. Flag duplicates
  and missing.
- [static] **Exactly one `<h1>`** per page; heading levels don't skip (h1→h2→h3).
- [static] **`<link rel="canonical">`** present and pointing at the page's own absolute URL
  (not the homepage on every page).
- [static] **`<meta name="robots">`** allows indexing on public pages (`index, follow`).
- [static] **Open Graph + Twitter Card** complete: `og:title`, `og:description`, `og:url`
  (page-specific, not all homepage), `og:image`, `twitter:card`. [curl] `og:image` resolves.
- [static] **`<html lang="en">`** present.
- [static] **Descriptive `alt`** on meaningful images; empty `alt=""` only on decorative.
- [static] **Page in `sitemap.xml`** and not blocked by `robots.txt`.

## 5. Structured data (JSON-LD) & LLM accessibility

- [static] **Presence.** Each page has JSON-LD appropriate to its type (Organization +
  WebSite on home; `Service`/`Product`/`FAQPage`/`BreadcrumbList` on service and product
  pages). **Flag pages with none** — currently `about-us/` and `waya-os-mcp/setup/` have
  zero blocks. `about-us` should carry `AboutPage`/`Organization`; `setup` a `HowTo` or
  `TechArticle`.
- [static] **Valid JSON.** Parse every `application/ld+json` block. A trailing comma or
  bad escape makes the whole block invisible to crawlers. (You can pipe each block through
  `python3 -m json.tool` to confirm.)
- [static] **Matches the visible page — freshness check.** This is the point of the check:
  when copy, prices, service names, URLs, or descriptions on the page change, the JSON-LD
  often isn't updated. Cross-check every `name`, `url`, `description`, `price`, and
  `offers` in the JSON-LD against (a) the rendered page copy and (b) `_data/schema.json`.
  Report each drift as a specific pair: "JSON-LD says X, page says Y."
- [static] **schema.org correctness.** Right `@type`, required properties present,
  `@id`/`@graph` references resolve, absolute URLs, no invented properties.
- [static] **LLM/crawler reachable.** JSON-LD is server-rendered in the HTML `<head>`
  (not injected by JS after load — crawlers and most LLM fetchers won't run it), the page
  returns 200, `robots.txt` allows it, and it's in the sitemap. Note: `llms.txt` is an
  optional emerging convention — mention it as a nice-to-have if the user wants maximum
  LLM discoverability, don't hard-flag its absence.

## 6. PostHog analytics

**Current state: not installed.** Only the design spec at
`docs/superpowers/specs/2026-09-08-posthog-integration-design.md` exists. If still absent,
the finding is "analytics not yet implemented — build Phase 1 per the spec" (P1, since the
site is running blind on behaviour/conversion). If it HAS been added since, verify:

- [static] **Snippet present on every page** (nav/footer are copied, so analytics will be
  too — confirm no page was missed).
- [static] **Initialised with a project key** and the correct host (`https://us.i.posthog.com`).
- [browser] **Actually reporting.** Load the page, check the network log for POSTs to
  `us.i.posthog.com` / `i.posthog.com`. No requests = configured but not firing (often a
  consent gate blocking it, or a key typo).
- [static/browser] **Autocapture + pageviews on**, and the **`cta_schedule_call_clicked`**
  custom conversion event fires on booking-CTA clicks (the spec's funnel endpoint).
- [static/browser] **Consent-gated.** Per the spec, PostHog must defer until the visitor
  accepts the cookie/consent banner. Verify it does not load pre-consent.

## 7. Everything else (performance, a11y, hygiene)

- [static/browser] **Performance.** No render-blocking scripts in `<head>` without
  `defer`/`async`; fonts use `font-display: swap` (they do); CSS/JS reasonably sized;
  `_headers` caching is correct (immutable for versioned assets, revalidate for
  unversioned `styles.css`/`nav.js` — already set up, confirm still true).
- [browser] **Core Web Vitals sanity.** Watch for layout shift (missing image dimensions),
  slow LCP (large hero image), and long tasks in the console/performance view.
- [static] **Accessibility beyond contrast.** Landmark elements (`<nav>`, `<main>`,
  `<footer>`), visible focus states, `aria-expanded`/`aria-current` on the nav dropdown,
  a skip-to-content link, buttons vs links used semantically.
- [static/browser] **404 page** exists and is styled (Cloudflare Pages serves `404.html`).
- [static] **Favicon** present (`/assets/favicon.png` — confirm it loads).
- [static] **Consent/cookie banner** present if/when analytics ships (ties to area 7).
