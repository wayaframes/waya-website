# PostHog Dashboard — "Waya Website — Acquisition & Outcomes"

Build once in PostHog → **New dashboard**. Add these insights (Phase 1; the funnel ends at CTA click — actual bookings live in GHL until Phase 2 adds `booking_completed`).

1. **Visitors per month** — Trends → Unique users of `$pageview`, interval = month.
2. **Best traffic sources** — Trends → `$pageview`, breakdown by `utm_source`; add a second tile broken down by `$referring_domain`.
3. **Landing pages** — Trends → `$pageview`, breakdown by `$pathname` (where visitors come in).
4. **Conversion funnel** — Funnels → step 1 `$pageview`, step 2 `cta_schedule_call_clicked`. Add breakdown by `utm_source`. (Phase 2 adds `booking_completed` as step 3.)
5. **CTA by location** — Trends → `cta_schedule_call_clicked`, breakdown by `location` (hero, nav, challenge, path, pullquote, final_cta, …).
6. **Thought leadership** — Trends → `outbound_click` breakdown by `network`; second tile: `$pageview` where `$referring_domain` is one of `linkedin.com` / `youtube.com` / `substack.com`.
7. **What they read** — PostHog → **Heatmaps**; open each key page URL and review scroll + click maps (no dashboard tile needed).

## Custom events reference

| Event | Fires when | Properties |
|---|---|---|
| `cta_schedule_call_clicked` | click any `leadconnectorhq.com` booking CTA | `location` (from `utm_content`), `service` (booking slug), `href` |
| `service_nav_clicked` | click an internal service-page link | `service`, `source` (`nav` / `footer` / `grid`) |
| `carousel_interacted` | click the pillar carousel ‹ / › | `direction` (`prev` / `next`) |
| `outbound_click` | click a LinkedIn / YouTube / Substack link | `network`, `href` |

## Coverage note

Analytics is loaded on the **9 template pages**: `/`, `/about-us/`, `/scale-up-program/`, `/fundraising-narrative/`, `/data-room-preparation/`, `/financial-model-prep/`, `/operations-audit/`, `/waya-os-mcp/`, `/pre-pmf-mcp/`.

`waya-os-mcp/setup/index.html` is intentionally **excluded** — it is a generated Claude Design bundle that does not use the shared template, so hand-inserting the script would be lost on the next regeneration. If analytics is ever wanted there, add it in whatever generates that bundle.

## Before events flow

The PostHog public key in `assets/analytics.js` is currently the placeholder `phc_REPLACE_ME`. Replace it with the real `phc_…` project key (Settings → Project → Project API Key), then redeploy, for events to be accepted.
