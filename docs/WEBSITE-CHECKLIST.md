# Waya website: change checklist

Internal. This folder is blocked on the public site by the `/docs/*` rule in `_redirects`; it is readable only in GitHub.

Read this before you change anything on www.wayaframes.com. Every item exists because the thing it guards has already gone wrong once. Last revised 2026-10-12.

---

## 0. Where the truth lives

| Fact | Single source | Everything else is a copy or a view |
|---|---|---|
| UTM taxonomy: products, tokens, booking roots, mediums, content codes, placements, button names | `_data/utm.json` | Notion "Reference Tables" mirrors it for reading. When they disagree, `utm.json` wins and the Notion row gets corrected. |
| Which booking calendars are live | `_data/utm.json` → `roots` | GHL itself. Run `scripts/ghl_attribution_check.py` to compare. |
| Navigation and footer | The copy in `index.html` | Every other page must match it byte for byte. |
| Design tokens (colours, fonts, spacing) | `assets/styles.css` `:root` block | Page `<style>` blocks may only use `var(--waya-*)`. |
| Analytics behaviour and events | `assets/analytics.js` | `docs/posthog-dashboard-setup.md` describes the dashboard built on it. |
| What the company does, in one sentence | `_data/schema.json` → `description` | Home-page JSON-LD, meta descriptions and `llms.txt` repeat it. |
| Pages that exist | The `index.html` files | `sitemap.xml` and `llms.txt` must list every indexable one. |
| Redirects and hidden paths | `_redirects` | Cloudflare applies it on deploy. |
| Security headers | `_headers` | Cloudflare applies it on deploy. |

If you are about to write a fact in a second place, stop and link to the first place instead.

---

## 1. Before you start

- [ ] Work on a branch off `staging`. Never push to `main` directly. `main` is the live site and Cloudflare deploys it within a minute.
- [ ] Preview locally with `python -m http.server 8811` from the repo root and open `http://localhost:8811/`. Never open the files with `file://`; root-relative paths and `nav.js` break.
- [ ] Know which page class you are touching:
  - **Template pages** (home, about, the four service pages, case studies, lean-ai, lean-ai/setup, lean-ai/cohort, experiment-platform/cohort, experiment-platform/detail, planning-guide, 404): full nav, full footer, analytics, JSON-LD, indexable.
  - **Funnel pages** (experiment-platform/apply, experiment-platform/welcome, pre-pmf-mcp/payments): minimal header, analytics, `noindex`.
  - **Generated** (lean-ai/setup/app): a Claude Design bundle. Edit only its `<head>` meta; anything else is lost on regeneration.

---

## 2. Editing an existing page

- [ ] The `<head>` keeps, in this order: charset, viewport, `<title>`, `<meta name="description">`, `<link rel="canonical">`, `<meta name="robots">`, Open Graph and Twitter tags, the stylesheet with the current `?v=` number, `<script defer src="/assets/analytics.js"></script>`, JSON-LD.
- [ ] Title 45 to 60 characters, front-loaded with the subject, ending " – Waya". Description 120 to 160 characters.
- [ ] Exactly one `<h1>`. Section eyebrows are `<p class="section-eyebrow">`, not headings.
- [ ] Every `<img>` has `alt`, `width`, `height`, and `loading="lazy"` unless it is in the hero. New images under 400 KB; a changed image gets a new filename because `/assets/images/*` is cached immutable for a year.
- [ ] No new hex colours in page `<style>` blocks. Use the tokens in `styles.css`. If you need a colour that does not exist, add the token first.
- [ ] Brand voice: no exclamation marks, no emoji, none of: unlock, elevate, transformational, game-changer, empower, leverage (verb), delve, tapestry, synergy, holistic, robust, seamless. Oxford comma. En dash for ranges (3–6 months).
- [ ] If you changed the nav or footer, change it on **every** page in the same commit. Check with:
  ```bash
  python scripts/check_site.py structure
  ```
  (until that script exists: diff each page's `<header>` and `<footer>` against `index.html`).
- [ ] If you changed `styles.css` or `nav.js`, bump the `?v=` number on every page.

---

## 3. Adding a page

- [ ] Copy the `<head>`, `<header>` and `<footer>` from `index.html`. Do not write them from memory.
- [ ] Self canonical, `og:url`, and JSON-LD `url` all use the new absolute URL with a trailing slash.
- [ ] Add it to `sitemap.xml` (with `lastmod`) and `llms.txt` (with the exact meta description), unless it is `noindex`.
- [ ] Add the product's `WAYA_ATTR_DEFAULTS` line (section 5) and the analytics tag.
- [ ] Link to it from somewhere a visitor can reach. A page with no inbound links is invisible; the four original service pages are reachable only from the home-page grid, which is a known risk.
- [ ] If it carries FAQs, add them to `_data/faq.json` and mirror them in the page's `FAQPage` JSON-LD.

## 4. Renaming or retiring a URL

- [ ] `git mv` the folder so history follows.
- [ ] Add 301s to `_redirects` for the old path with and without trailing slash. Retarget any existing rule that pointed at the old path so nothing chains.
- [ ] Update every internal link, canonical, `og:url`, JSON-LD `url`, `sitemap.xml`, `llms.txt`, and `_data/nav.json`.
- [ ] Update the GHL form "On Submit → Open URL" if the page is a form destination (the apply form currently sends people to `/experiment-platform/welcome/`).
- [ ] A retired page is deleted, not left in the repo. The redirect is the memory.

---

## 5. Links and UTM parameters

The rule set lives in `_data/utm.json`. Read the `rules` block there. The short version:

**Website buttons carry only `utm_button`.** Example: `…/widget/bookings/waya-consultation?utm_button=hero`. The engine in `analytics.js` adds source, medium, campaign, content and term from whatever link brought the visitor, so a LinkedIn post, an Apollo email and a direct visit all book through the same button and GHL still learns where each one came from. Hardcoding `utm_source` or `utm_campaign` on a button throws that away.

**Campaign links** (emails, posts, ads) carry `utm_source`, `utm_medium` (a code from the legend: `ce`, `so`, `cpc`, `qre`), `utm_campaign` as `<product>_<audience>_<period>` (`dataroom_yc_2026q4`), `utm_content` as a structural code (`E1VA`, `P1VA`), and optionally `utm_term`.

- [ ] **Never hand-type a link.** Build it:
  ```bash
  python scripts/utm_link.py --product dataroom --button hero
  python scripts/utm_link.py --product consultation --placement "LinkedIn organic post" --audience founders --period 2026q4 --content P1VA
  ```
  The builder refuses anything that is not in `utm.json` or not yet `active`. That refusal is the discipline working.
- [ ] **Validate before you commit:**
  ```bash
  python scripts/check_utm.py
  ```
  Zero failures or it does not ship. Warnings mean a token or code is still `proposed` and needs Oren's confirmation.
- [ ] **Each page declares its product** once in `<head>`, before `analytics.js`, so a direct visitor still routes in GHL:
  ```html
  <script>window.WAYA_ATTR_DEFAULTS = { utm_source: 'wayaframes', utm_medium: 'web', utm_campaign: 'dataroom_direct_2026q4' };</script>
  ```
- [ ] **New product, token, medium or placement:** add the row to `utm.json` with `status: "proposed"`, open a PR, get it confirmed to `active`, then mirror the row in the Notion table. Not the other way round.
- [ ] **Retiring:** set `status: "retired"` and `retired_on`. Never delete a row, never reuse a token for a different product; PostHog and GHL history join on it.
- [ ] **Booking calendars:** a calendar that returns 404 at `api.leadconnectorhq.com/widget/bookings/<slug>` kills every button pointing at it and nothing in the site tells you. Check them:
  ```bash
  for s in waya-consultation ops-intro-call; do curl -s -o /dev/null -w "$s %{http_code}\n" https://api.leadconnectorhq.com/widget/bookings/$s; done
  ```
  Three of five were dead for an unknown period before 12 Oct 2026.

---

## 6. Confirming attribution reaches GHL

The site cannot see inside GHL, so this is a periodic manual check, not a build step.

1. Create a read-only Private Integration Token in GHL (Settings → Private Integrations, scopes: Calendars, Contacts). Keep it out of the repo.
2. Run:
   ```bash
   set GHL_TOKEN=pit-…   (PowerShell: $env:GHL_TOKEN="pit-…")
   python scripts/ghl_attribution_check.py --days 30
   ```
   It lists the calendars GHL actually has (compare with `utm.json` roots), counts recent contacts that arrived with `utmSource`/`utmCampaign`, and flags campaign values that do not use a product token.
3. Once a quarter, make a test booking from a tagged link (`utm_link.py --placement "LinkedIn organic post" …`), then open the contact in GHL and confirm the Attribution panel shows the same five values. Record the date in the product's Notion row and set GHL routing to Live.
4. If contacts arrive with no attribution, the booking widget's own form is not passing the page URL's UTMs through. Check in GHL that the calendar's widget has "capture UTM parameters" enabled and that the workflow maps them to contact fields.

---

## 7. PostHog

Analytics loads on every page through one tag, waits for cookie consent, and sends to `https://us.i.posthog.com`.

- [ ] Every page has `<script defer src="/assets/analytics.js"></script>` in `<head>`. No exceptions; the funnel pages are the ones that matter most.
- [ ] After any change to `analytics.js`, verify it still sends. Open a page on localhost, then in the browser console:
  ```js
  localStorage.setItem('waya_analytics_consent','granted'); location.reload();
  // after reload:
  performance.getEntriesByType('resource').filter(e => /posthog/.test(e.name)).map(e => [e.name.split('?')[0], e.responseStatus])
  ```
  You must see `us-assets.i.posthog.com/static/array.js` and at least one `us.i.posthog.com/i/v0/e/` with status 200. No `/e/` request means events are not leaving the browser.
- [ ] Click a booking button and check PostHog → Activity for `cta_schedule_call_clicked` with `location` set (from `utm_button`) and the `utm_*` properties the engine attached.
- [ ] Events reference: `cta_schedule_call_clicked` (location, service, utm_*), `service_nav_clicked` (service, source), `outbound_click` (network), `carousel_interacted` (direction). Add new events in `analytics.js` and to `docs/posthog-dashboard-setup.md` in the same commit.
- [ ] Unknown URLs must return a real 404. `404.html` at the repo root does that on Cloudflare Pages; without it every broken link counts as a home-page view.

---

## 8. Search engines and LLMs

- [ ] Indexable pages: `index, follow, max-image-preview:large`. Funnel pages and the generated app: `noindex, nofollow`.
- [ ] Open Graph and Twitter card tags on every page, with a page-specific `og:url` and an `og:image` that resolves.
- [ ] JSON-LD on every template page, parses as JSON (`python -m json.tool`), and says what the page says: same names, same prices, same descriptions. Service pages carry `Service` + `FAQPage`; program pages carry `Course` + `FAQPage`; home carries `Organization` + `WebSite`.
- [ ] `llms.txt` lists every indexable page with its exact meta description. Regenerate it when a description changes.
- [ ] The value proposition sentence in `_data/schema.json` is the one sentence. Do not write a new one in a title or `llms.txt`.

---

## 9. Security and privacy

- [ ] Nothing in the repo is private once pushed, except what `_redirects` hides (`/docs/*`, `/scripts/*`, `/_data/*`, `/.claude/*`, `/.github/*`). Cloudflare serves every other file. Never commit a token, a key, or a customer's data anywhere, including this folder.
- [ ] `_headers` keeps HSTS, nosniff, frame-ancestors, referrer policy, permissions policy. A full Content-Security-Policy is still to be added; when it is, every new third-party origin goes in it.
- [ ] External links open with `rel="noopener noreferrer"`. No `http://` anywhere.
- [ ] The cookie banner requires a published privacy policy. The pages exist on the `legal-pages` branch; merge them before adding any new tracking.
- [ ] Third-party embeds (GHL forms, YouTube) use `https` and the `youtube-nocookie.com` host.

---

## 10. Review and deploy

1. Run the mechanical checks: `python scripts/check_utm.py`, the link check, the JSON-LD parse. Zero failures.
2. Ask Claude to run `/waya-website-qa` (content, voice, CTA placement) and `/waya-website-tech-audit` (links, SEO, analytics, security) on the changed pages. Paste the P0/P1 findings into the PR and fix them.
3. Push the branch, open a PR to `staging`, read the diff once more in GitHub.
4. Merge to `staging`. The preview is `https://staging.waya-website.pages.dev/` (behind Cloudflare Access; `staging.wayaframes.com` does not currently serve). Click through every changed page on desktop and on a phone.
5. On the preview confirm the hidden paths are hidden: `curl -sI https://staging.waya-website.pages.dev/docs/WEBSITE-CHECKLIST.md` must return a 301, not 200.
6. Open a PR from `staging` to `main`. Merge. Within two minutes check the live page, one booking button, and `curl -sI https://www.wayaframes.com/this-does-not-exist/` returns 404.

---

## 11. Monthly

- [ ] Booking roots return 200 (section 5).
- [ ] `ghl_attribution_check.py` shows contacts arriving with campaign values that use product tokens (section 6).
- [ ] PostHog dashboard "Waya Website — Acquisition & Outcomes" has data for the month and the `cta_schedule_call_clicked` funnel step is not zero for any page that has a booking button.
- [ ] Every `proposed` row in `utm.json` has either been confirmed or has a decision date.
- [ ] The Notion Reference Tables match `utm.json`.
