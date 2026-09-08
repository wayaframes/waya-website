# PostHog Integration — Design Spec

**Date:** 2026-09-08
**Author:** Oren Schaedel
**Status:** Approved design → ready for implementation plan

## Goal

Instrument the Waya website (static HTML on Cloudflare Pages) with PostHog to answer two classes of question:

1. **Behavioral** — where prospects come in, where they click, how they navigate, what they read, and what makes them click a CTA.
2. **Timeline / outcome** — visitors per month, best traffic sources, funnel outcomes, website-attributed bookings, and thought-leadership engagement.

Sales close in GoHighLevel (GHL) after the visitor leaves the site for a `leadconnectorhq.com` booking widget. This design carries the visitor's identity across that handoff so the funnel **visit → CTA → booking** is unified in PostHog (**closed-loop to bookings**). Dollar values remain in GHL.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Attribution scope | Closed-loop to bookings (booking event pushed back to PostHog; $ stays in GHL) |
| Capabilities | Autocapture + pageviews, Heatmaps + scroll depth, Custom conversion events. **No session replay.** |
| Consent | Cookies + lightweight consent banner; PostHog deferred until Accept |
| Region | PostHog US Cloud (`https://us.i.posthog.com`) |
| Account | Exists; user provides the project **public** API key |

## Site facts (context)

- No build system. Nav/footer are hand-copied into every page (no includes). **10 pages currently:**
  `/`, `/about-us/`, `/scale-up-program/`, `/fundraising-narrative/`, `/data-room-preparation/`,
  `/financial-model-prep/`, `/operations-audit/`, `/waya-os-mcp/`, `/waya-os-mcp/setup/`, `/pre-pmf-mcp/`.
- Shared `assets/styles.css`; tiny vanilla `assets/nav.js`. No existing analytics.
- `_headers` has security headers but **no Content-Security-Policy** — nothing to amend for PostHog.
- CTAs are `<a>` links to `leadconnectorhq.com` booking widgets, already tagged with `utm_source` / `utm_content`.
- Preview via `python3 -m http.server` (not `file://`); `main` → www, `staging` → staging.wayaframes.com.

## Architecture

One shared, deferred external script owns the whole client integration; each page gets a single `<script>` line. This keeps 10 hand-maintained pages DRY and driftless.

```
Each page <head>
  └─ <script defer src="/assets/analytics.js"></script>

assets/analytics.js
  ├─ Consent gate (banner UI, localStorage, defer PostHog until Accept)
  ├─ PostHog init  (autocapture, heatmaps, pageview/pageleave, cookie persistence)
  ├─ Custom events (CTA click, service nav, carousel, outbound)
  └─ Identity passthrough (append ph_distinct_id to leadconnectorhq.com links on click)

Cloudflare Worker (analytics-webhook/)
  └─ receives GHL "appointment booked" webhook → POST booking_completed to PostHog capture API
```

### Data flow (closed-loop)

```
Visitor lands (utm_source/medium/campaign/content)
  → autocapture + $pageview + scroll/heatmap
  → clicks "Schedule a Call"        [event: cta_schedule_call_clicked, {location}]
  → redirect to GHL booking widget WITH ph_distinct_id (+ ph_session_id) appended
  → visitor books call
  → GHL workflow fires webhook → Cloudflare Worker
  → Worker POSTs to PostHog /capture  [event: booking_completed, distinct_id = passed-through id]
= unified funnel: $pageview → cta_schedule_call_clicked → booking_completed, split by source
```

## Components

### 1. `assets/analytics.js` (new)

Load order & consent:
- On load, read `localStorage['waya_analytics_consent']` (`granted` | `denied` | unset).
- `granted` → init PostHog immediately.
- unset → render consent banner; init only on **Accept** (writes `granted`). **Decline** writes `denied`, loads nothing, sets no cookies.
- A small "Privacy" / manage-consent affordance can re-open the choice (footer link, optional; nice-to-have).

PostHog config (on consent):
```js
posthog.init('<PUBLIC_KEY>', {
  api_host: 'https://us.i.posthog.com',
  autocapture: true,
  capture_pageview: true,
  capture_pageleave: true,     // scroll depth rides along
  enable_heatmaps: true,
  persistence: 'localStorage+cookie',
  mask_all_text: false,
  // UTM + referrer captured automatically as $set_once person props
});
```

Custom events (thin layer over autocapture, for clean funnels):
| Event | Trigger | Key properties |
|---|---|---|
| `cta_schedule_call_clicked` | click on any `waya-consultation`/booking CTA | `location` (from existing `utm_content`: hero, nav, challenge, path, pullquote, final_cta, …), `service` |
| `service_nav_clicked` | click on a service link in nav dropdown / grid | `service`, `source` (nav vs grid vs footer) |
| `carousel_interacted` | click `#carPrev` / `#carNext` | `direction` |
| `outbound_click` | click to Substack / LinkedIn / YouTube | `network`, `href` (thought-leadership signal) |

Identity passthrough:
- Delegated click listener on `a[href*="leadconnectorhq.com"]`.
- Before navigation, append `ph_distinct_id=<posthog.get_distinct_id()>` and `ph_session_id=<posthog.get_session_id()>` to the href (preserving existing UTMs).
- Only when consent granted (otherwise no id exists — booking still recorded by GHL, matched later by email).

### 2. `assets/styles.css` (edit)

Add consent-banner rules only (fixed bottom bar, Accept/Decline buttons reusing existing `.btn-*` visual language, mobile-stacked, respects reduced-motion). ~30–40 lines, no changes to existing rules.

### 3. The 10 `index.html` files (edit)

Add exactly one line inside each `<head>` (after the stylesheet link):
```html
<script defer src="/assets/analytics.js"></script>
```
No other markup changes. Existing `utm_content` values are reused as event properties — no per-CTA edits required.

### 4. Cloudflare Worker — `analytics-webhook/` (new)

- Endpoint receives the GHL "appointment booked" webhook (shared-secret header validated).
- Maps payload → PostHog capture:
  ```
  POST https://us.i.posthog.com/capture/
  { api_key, event: 'booking_completed',
    distinct_id: <ph_distinct_id from booking, else contact email>,
    properties: { calendar, utm_source, utm_campaign, utm_content, booking_id } }
  ```
- Deployed separately (wrangler); URL + shared secret go into the GHL workflow.
- Rationale for a Worker over GHL-posting-PostHog-directly: validation, id-fallback logic, and a clean home for adding **revenue** (won-opportunity value) later without touching GHL config again.

## Dashboards (built in PostHog UI post-instrumentation)

| Ask | Insight |
|---|---|
| Visitors per month | Unique-users trend on `$pageview`, monthly |
| Best traffic sources | `$pageview` breakdown by `utm_source`, then `$referring_domain` |
| Outcomes / funnel | Funnel: `$pageview` → `cta_schedule_call_clicked` → `booking_completed`, filterable by page & source |
| Website-attributed bookings | `booking_completed` count by `utm_source` / `utm_campaign` |
| Thought leadership | Inbound from Substack/LinkedIn/YouTube (`$referring_domain`) + `outbound_click` by `network` |
| What they read | Scroll-depth + heatmaps per page (native PostHog per-URL) |

Delivered as one PostHog dashboard, "Waya Website — Acquisition & Outcomes." Built via UI (documented steps); optionally scripted via PostHog API as a follow-up.

## Risks & mitigations

1. **Identity passthrough through GHL** — depends on the booking widget carrying `ph_distinct_id` into a GHL contact custom field, then into the webhook payload. *Mitigation:* Worker falls back to matching on email; booking is always recorded even if the id doesn't survive. This is the one piece requiring GHL-side configuration and live validation.
2. **Consent decline reduces data** — expected; declines are simply uncaptured. No dark patterns.
3. **Drift across 10 pages** — mitigated by the single external script; only the one `<script>` line must exist on each page (covered by a QA check).

## Out of scope (YAGNI)

- Session replay.
- Full revenue ($ value) piped into PostHog — deliberately deferred; the Worker leaves a clean seam to add it.
- Server-side/proxy PostHog ingestion (reverse proxy) — not needed without a CSP or ad-block-evasion requirement.
- Feature flags / experiments / surveys.

## Prerequisites (user-provided)

- PostHog project **public** API key (US Cloud). Host: `https://us.i.posthog.com`.
- Permission/steps to add the GHL workflow + outbound webhook and (ideally) a `ph_distinct_id` custom field on the contact.
- Cloudflare account access to deploy the Worker (already on Cloudflare).

## Implementation surface (summary)

| File | Change |
|---|---|
| `assets/analytics.js` | new — consent gate, PostHog init, custom events, identity passthrough |
| `assets/styles.css` | edit — consent-banner styles only |
| 10 × `index.html` | edit — one `<script defer>` line in `<head>` |
| `analytics-webhook/` | new — Cloudflare Worker (GHL → PostHog booking_completed) |
| `docs/` | this spec + a GHL/PostHog setup checklist |
