# Waya website: engineering review and CI proposal

**Date:** 2026-10-12 · **Reviewer:** Claude (engineering-lead review requested by Oren) · **Branch reviewed:** `staging` at `94f91b3` · **Verification:** static analysis of all 19 pages, Notion UTM reference tables, live checks against www.wayaframes.com and the booking provider

---

## 1. The answer in short

**Yes, a CI gate before `main` is straightforward.** The site is static HTML on Cloudflare Pages with no build step, so every check in this document runs in under two minutes on GitHub Actions with no secrets except an optional Notion token. Today there is no CI, no branch protection, no ruleset, and zero pull requests in the repo's history. Every change is a direct push to `staging` or `main`, and Cloudflare deploys it within a minute.

**Before any of that, one thing is broken in production.** Three of the five booking calendars return a 404 from the booking provider. Every CTA on the Data Room Preparation, Financial Model Preparation, and Fundraising Narrative pages leads to a "Page Not Found" screen. Eleven buttons, three of the four paid services. Nothing in the current review process would have caught it, because the checks are static and the calendars died on the provider's side.

**The five checks you asked for are each partly covered and each partly undermined by the same root cause:** facts live in several places that nothing reconciles. Nav and footer are hand-copied into 19 pages. UTM rules exist in four documents with four different grammars, and the one that Notion calls the source of truth is the one the site does not follow. The two review skills in `.claude/skills` describe a site that no longer exists. CI only helps if each fact has one home and the checks read from it.

| Check | Where it stands | What CI should enforce |
|---|---|---|
| 1. Build, header, footer | Link sets match on 14 template pages. Footer drifts on 3 pages, "About us" vs "About Us" on every page, planning-guide pins a stale stylesheet version. | Nav and footer blocks byte-equal to a single partial. Shared asset versions identical across pages. Required head block per page. |
| 2. Links and UTM rules | 0 broken internal links. 3 dead booking roots. UTM scheme contradicts the Notion rules on every page. No passthrough engine. | Booking roots must be 200 and Active in Notion. Website buttons carry `utm_button` only. Campaign links match `<product>_<audience>_<period>`. |
| 3. PostHog | Installed and consent-gated on 15 of 19 pages. Missing on the apply, payments, and welcome pages, so the purchase funnel goes dark after the cohort page. Soft 404s inflate home-page views. | Analytics tag present on every page not on an allowlist. Headless test that a CTA click emits `cta_schedule_call_clicked`. |
| 4. Robots and LLMs | Strong: `llms.txt` covers all 14 indexable pages, valid JSON-LD on 15 pages, sitemap and canonicals correct. Value proposition is stated three different ways. | `llms.txt` and sitemap regenerated from the pages, or the build fails when stale. JSON-LD must parse and carry required types. |
| 5. SEO | Titles too short, descriptions too long on 10 pages, Open Graph image only on home, no `404.html`, no image dimensions or lazy loading anywhere, 7 MB PNG on the Scale Up page. | Length bounds, one `h1`, OG tags, image attributes, asset size budget. |

---

## 2. How the site is built and reviewed today

**Stack.** 19 `index.html` pages, one shared `assets/styles.css` holding the design tokens, `assets/nav.js` for dropdowns and the mobile menu, `assets/analytics.js` for consent-gated PostHog. `_headers` and `_redirects` configure Cloudflare Pages. `main` deploys to www.wayaframes.com. `staging` deploys to a Cloudflare Access-gated preview at `staging.waya-website.pages.dev`. The custom domain `staging.wayaframes.com` resolves but fails the TLS handshake, so the URL the tech-audit skill tells reviewers to use does not work.

**Change flow.** 70 commits from five authors, no pull requests, no branch protection on `main` or `staging`, no GitHub Actions workflows, no rulesets. Three collaborators hold admin. A push to `main` is live in about a minute with no gate between the editor and the public.

**Manual review.** Two skills live in the repo: `waya-website-qa` (content, voice, CTA placement) and `waya-website-tech-audit` (security, links, SEO, JSON-LD, PostHog). A third, `waya-utm-attribution`, lives in the Anthropic skills plugin. They are the review process, and they are good checklists, but they run only when someone remembers, and all three have drifted from reality:

- The QA skill's canonical nav lists five services in a Services dropdown and a four-column footer. The live nav has three items. Its UTM rule says `utm_content` and `utm_medium=landing_page`, which is the scheme the Notion tables say is wrong.
- The tech-audit skill says PostHog is not installed and the site has 10 pages. PostHog has been live for a month and there are 19 pages.
- The UTM skill hands out `ops-audit-intro-call` as a booking root, which Notion flagged as dead on 11 Sep. Its `references/taxonomy.md`, `assets/attribution.js`, and `scripts/build_link.py` are not present in the installed plugin, so the passthrough engine it describes cannot actually be installed from it.

**Reference data nothing consumes.** `_data/nav.json`, `_data/faq.json`, and `_data/schema.json` are described as canonical, but no build reads them. `nav.json` lists six dropdown items; the live nav has three. `button_mapping.txt` at the repo root carries a third UTM grammar (`utm_button=email_button`, `utm_medium=cold_email`) that the Notion Code Legend explicitly bans.

**Design system.** The tokens in `styles.css` are the design system as it exists in the repo: 11 named colours, two typefaces, two shadows, two durations. The five original service pages use zero page-level styles and zero off-token colours. The newer pages do not. `lean-ai`, `lean-ai/cohort`, `case-studies`, and `pre-pmf-mcp` introduce seven greens and a gold that are not tokens (`#085041`, `#0F6E56`, `#0F4F3F`, `#1C2A23`, `#2E4237`, `#5D7A6B`, `#8A6408`). `lean-ai/setup/app` is a generated bundle that uses none of the system. Every page except two also has between 1 and 13 inline `style=` attributes.

---

## 3. Findings by check

### 3.1 Build, header, and footer consistency

- **Header link sets are identical on the 14 template pages.** The only header differences are UTM parameters on the Schedule a Call button, and `lean-ai/cohort` sends its header CTA to `ops-intro-call` while every other page sends it to `waya-consultation`.
- **Footer has three variants.** `experiment-system`, `pre-pmf-mcp/cohort`, and `lean-ai/cohort` add a Schedule a Call link to the footer; the other 11 template pages do not. `planning-guide` drops the program links.
- **"About us" is capitalised two ways on the same page.** The nav says "About Us", the footer says "About us", on every template page. `experiment-system` and `lean-ai/cohort` have it reversed.
- **Stale asset pin.** `planning-guide` loads `styles.css?v=2`; every other page loads `v=9`. Because `_headers` sets `must-revalidate` on the stylesheet this is harmless today, but the pin exists precisely so it can be trusted.
- **A retired page is still in the repo.** `pre-pmf-mcp/index.html` is 301-redirected live but still exists with six "Wayaframes" misspellings, a Service JSON-LD block, and old copy. It also matches `'/pre-pmf-mcp/'` in the analytics `SERVICE_PATHS` map, so clicks to the cohort and apply pages are labelled `pre-pmf-mcp`.
- **Four pages are outside the template on purpose** (apply, payments, welcome, setup/app). They need an explicit allowlist so CI knows the difference between "intentionally minimal" and "someone forgot the footer".

### 3.2 Links and UTM rules

**P0: three booking roots are dead.** Verified by GET with a browser user agent and in the browser pane. The provider renders "404 Page Not Found" for:

| Root | Pages affected | Buttons |
|---|---|---|
| `dataroom-preparation` | `/data-room-preparation/` | hero, challenge, pullquote, final_cta |
| `financial-model-preparation` | `/financial-model-prep/` | hero, challenge, pullquote, final_cta |
| `fundraising-narrative` | `/fundraising-narrative/` | hero, challenge, final_cta |

`waya-consultation` and `ops-intro-call` return 200. The Notion UTM Products table lists all five roots as Active with GHL routing "Unverified", which is the exact failure mode its own notes warn about. The old `ops-audit-intro-call` slug is also dead and is not used anywhere on the site, which is good. The fix is either recreating the three calendars at those slugs in GHL or pointing the eleven buttons at roots that exist, then recording a test booking in Notion and flipping the rows to Live.

**The website does not follow the UTM rules.** The Notion "Website product page button" placement row says: buttons hardcode `utm_button` only, from the set `nav, hero, challenge, pricing, final_cta, footer`; the passthrough engine fills `source, medium, campaign, content, term` from whatever link drove the visit; hardcoding those on a button "overrides the real campaign, the exact bug the engine exists to prevent". The site:

- hardcodes `utm_source=wayaframes&utm_medium=landing_page&utm_campaign=<page-slug>&utm_content=<location>` on 41 buttons;
- uses `utm_content` for button location instead of `utm_button`, with values outside the allowed set (`who`, `path`, `faq`, `pullquote`, and `final-cta` with a hyphen next to `final_cta` with an underscore);
- uses page slugs as `utm_campaign` (`scale-up-program`, `home`, `about-us`, `experiment-system`) where the rule is `<product>_<audience>_<period>` with a product token from the Products table (`dataroom`, `model`, `narrative`, `opsaudit`, `consultation`);
- uses a third scheme on four pages (`lean-ai`, `lean-ai/setup`, `case-studies`, `pre-pmf-mcp`): `utm_source=<slug>&utm_content=nav`, with no medium or campaign;
- has no passthrough engine at all. Nothing on the site reads incoming UTMs or appends them to booking links. A LinkedIn or Apollo click that lands on a product page and then books arrives in GHL as `utm_campaign=scale-up-program`, and the campaign that produced it is lost.

**The rules themselves disagree in two places.** The Placements table says LinkedIn organic uses medium `so`, but the Code Legend lists `social` as Active and has no `so` row (`so` was approved 4 Sep per the Reference Tables page, so the Legend is behind). The "campaign context always books waya-consultation" rule is marked in Notion as needing amendment to a declared/undecided split; `lean-ai/cohort` already follows the amended version by booking `ops-intro-call`.

**What is clean:** 0 broken internal links or asset paths, 0 `target="_blank"` without `rel="noopener"`, 0 `http://` references, all `_redirects` entries return 301 to the right place, YouTube and Substack profiles return 200. LinkedIn returns 999 to non-browser clients, which is a bot block and not a failure; the CI check must treat it as a pass.

### 3.3 PostHog

- **Installed and correct where present.** One deferred tag per page, consent banner, PostHog loaded only after Accept, live public key on www, autocapture, pageview, pageleave, heatmaps, and four custom events. `docs/posthog-dashboard-setup.md` still says the key is a placeholder and that 9 pages are covered; both are stale.
- **Four pages have no analytics.** `pre-pmf-mcp/apply`, `pre-pmf-mcp/payments`, `pre-pmf-mcp/welcome`, and `lean-ai/setup/app`. The first three are the highest-intent pages on the site. The funnel from the 12 Weeks to PMF page to the application form to payment is invisible after the first step.
- **Soft 404s pollute the data.** Cloudflare Pages has no `404.html` in this repo, so any unknown URL serves the home page with status 200. Every broken inbound link looks like a home-page visit, and the broken links themselves never surface.
- **The CTA event reads `utm_content`.** `cta_schedule_call_clicked.location` is parsed from the button URL. The `final-cta` / `final_cta` split already divides one placement into two series. Moving buttons to `utm_button`, as the Notion rules require, silently nulls the location property unless `analytics.js` changes at the same time.
- **`service_nav_clicked` is mislabelled.** The path map has no entries for `experiment-system`, `case-studies`, or `planning-guide`, and `/lean-ai/cohort/` matches the `/lean-ai/` prefix so program clicks are counted as product clicks.
- **The funnel ends at the click.** Phase 2 of the PostHog spec (a `booking_completed` event from a GHL webhook) was never built. That is why three dead calendars went unnoticed: click counts look healthy while bookings from those pages are zero. Phase 2 is the control that would have caught it.

### 3.4 Readable by robots and LLMs

- **Strong foundation.** `llms.txt` is 348 lines, lists every indexable page with its meta description, and reproduces the FAQs. JSON-LD on 15 pages, all valid JSON, with sensible types (`Organization`, `WebSite`, `Service`, `FAQPage`, `HowTo`, `AboutPage`, `CollectionPage`). Canonical tags correct on every indexable page. `robots.txt` allows everything and points to the sitemap.
- **The value proposition is stated three ways.** The home title says "The Operating System for Mission-Driven Founders". `schema.json` and the home-page JSON-LD say Waya "streamlines operations, finance, people systems, and governance". `llms.txt` says Waya helps founders reach "product-market fit, scaling up 10x, and growing margins". An LLM asked what Waya does will get whichever one it read. Pick one sentence, put it in `_data/schema.json`, and generate the other two from it.
- **Program pages carry only `FAQPage`.** `experiment-system`, `lean-ai/cohort`, and `pre-pmf-mcp/cohort` have no `Service`, `Course`, or `Event` block, so the two paid programs are invisible as products in structured data.
- **The Organization logo points at the old WordPress path** (`/wp-content/uploads/2026/03/WAYA_logo-1.jpg`), which now soft-404s to the home page HTML.
- **`llms.txt` is hand-maintained.** It was correct on the day it was written. It will drift on the next page add, the same way `nav.json` did.

### 3.5 SEO

- **Titles are short and back-loaded.** "Lean AI – Waya" (14 characters), "About Us – Waya" (15), "Case Studies – Waya" (19). The home page is the only one with a title over 40 characters. Descriptions overshoot on 10 pages: home is 270 characters, about-us 227, pre-pmf-mcp 233, scale-up-program 213.
- **Open Graph and Twitter cards exist only on the home page.** Every other page shares on LinkedIn without an image.
- **No `404.html`.** Beyond the analytics damage above, Google will index broken URLs as soft-404 duplicates of the home page.
- **Heading order skips on 15 pages.** Section eyebrows are `<h5>` and card titles `<h3>` directly under `<h1>`. `lean-ai/setup` has no `h1` at all.
- **Images.** Over 100 `<img>` tags, none with `width`/`height`, none with `loading="lazy"`, nine without alt text. `scale-up-journey.png` is 7.2 MB, `mountain-sage.png` 2.2 MB, `north-star.png` 1.4 MB for an icon. These are the Largest Contentful Paint problem on the service pages.
- **`apply` and `welcome` have no robots meta and no canonical.** They are indexable with nothing telling Google what they are. They should be `noindex`, like `payments` already is.

### 3.6 Security and privacy

- **Headers are good.** HSTS, nosniff, frame-ancestors, referrer policy, and permissions policy all verified live. The one gap is a full Content-Security-Policy; today only `frame-ancestors` is set. A starter policy that allows self, `us.i.posthog.com`, `us-assets.i.posthog.com`, `api.leadconnectorhq.com`, `link.msgsndr.com`, `www.youtube-nocookie.com`, and `app.warmintro.net` would cover everything on the site.
- **Third-party scripts.** `link.msgsndr.com` form-embed scripts load on five pages without integrity hashes. They cannot be pinned because GHL rotates them; the CSP above is the mitigation.
- **No secrets committed.** The PostHog project key is public by design.
- **Consent without a policy.** The cookie banner has been live for a month and there is no privacy policy or terms page on the site. Both exist on the unmerged `legal-pages` branch, along with footer links from every page. There is also no way for a visitor to change a consent choice once made.
- **No deploy gate.** With no branch protection, any of three admins can push directly to `main`. The gate below fixes this.

### 3.7 Grammar, voice, and consistency

Mechanical sweeps only; a full read is what the content QA skill is for.

- **Forbidden words** from the QA skill's own list appear on three pages: "elevate", "empower", and "robust" on about-us, "unlock" on operations-audit, "transformational" on scale-up-program.
- **Double spaces after full stops** on eight pages.
- **Em dash policy is split.** The QA skill mandates spaced em dashes. The original service pages use 8 to 18 each. `experiment-system`, `lean-ai`, `lean-ai/cohort`, and `case-studies` use zero, and the legal-pages branch commit is titled "no em dashes". Decide once and lint for it.
- **Hyphen ranges** on case-studies where the brand rule is an en dash.
- No common misspellings or doubled words found. "Wayaframes" appears only on the retired page.

---

## 4. The discipline: one home per fact, checked on every pull request

### 4.1 Principles

1. **Each fact has exactly one source and everything else is generated or verified against it.** Nav and footer come from one partial. The UTM taxonomy comes from the three Notion tables. The value proposition comes from `_data/schema.json`. `llms.txt` and `sitemap.xml` come from the pages.
2. **Checks read from the source, never from a copy.** The review skills currently restate facts in their own "ground truth" sections, which is why they rot. Point them at the same `_data` files the CI reads.
3. **CI covers the mechanical 80 percent. The skills cover judgement.** Grammar beyond patterns, CTA placement, whether copy converts: those stay human-plus-Claude, run on the PR, with the report pasted into the PR description.
4. **Production is monitored, not just gated.** Dead calendars and dropped events are runtime failures. A nightly job catches what a PR check cannot.

### 4.2 Branch flow

```
feature branch  ──PR──▶  staging  (Cloudflare preview, Access-gated)  ──PR──▶  main  (www)
                          │                                                  │
                     site-checks must pass                            site-checks must pass
                                                                       + 1 approving review
```

Branch protection on both `staging` and `main`: require a pull request, require the `site-checks` status, block direct pushes, block force pushes. One approval on `main`. Admins included. This is a five-minute change in repository settings and is the single highest-leverage item in this document after fixing the calendars.

### 4.3 The checks

All of these run from one workflow on every PR. Static checks need no secrets. The Notion sync needs one integration token stored as a repository secret.

| # | Job | What it asserts | Source of truth |
|---|---|---|---|
| 1 | `structure` | Every page not on the allowlist contains the nav and footer blocks byte-for-byte from `_includes/nav.html` and `_includes/footer.html`. Every page pins the same `styles.css?v=` and `nav.js?v=`. Every page has charset, viewport, title, description, canonical, robots, OG, and the analytics tag. | `_includes/*`, `_data/pages.json` allowlist |
| 2 | `links` | Internal hrefs and `src` resolve. `#anchors` exist. External links return 2xx or 3xx on HEAD, with a known-flaky list (LinkedIn 999) treated as pass. Booking roots must return 200. | the pages |
| 3 | `utm` | Every `leadconnectorhq.com/widget/bookings/` href carries only `utm_button` from the allowed set. The root is Active in `_data/utm.json`. No Proposed or Retired token appears anywhere. Any campaign-context link matches `<token>_<audience>_<YYYYqN>` and uses a medium from the Code Legend. | `_data/utm.json`, synced from Notion |
| 4 | `analytics` | Analytics tag present on every page not allowlisted. Playwright loads three pages with consent pre-granted in localStorage, clicks a booking CTA, and asserts a `cta_schedule_call_clicked` capture with a non-null `location`, by intercepting requests to `us.i.posthog.com`. | `analytics.js` contract |
| 5 | `seo` | Title 30 to 60 characters, description 70 to 160, exactly one `h1`, no heading level skips (warn, not fail, until the eyebrow pattern is fixed), canonical equals the page path, `og:image` present, every indexable page in the sitemap and every sitemap entry on disk, every `<img>` has alt, width, height, and `loading` on anything after the hero. | the pages, `sitemap.xml` |
| 6 | `llm` | `llms.txt` lists every indexable page and its description equals the page's meta description. JSON-LD parses on every page and includes the required `@type` for the page class (Service pages: `Service` + `FAQPage`; program pages: `Course` or `Event` + `FAQPage`). Organization description equals `_data/schema.json`. | `_data/schema.json`, `_data/pages.json` |
| 7 | `content-lint` | `cspell` with a project dictionary (WayaFrames, Hoshin, Cheetah, and so on). Forbidden word list. Double spaces, hyphen ranges, "Wayaframes" variants, exclamation marks, em dash policy. | `_data/style.json` |
| 8 | `security` | `_headers` contains the required headers including CSP. No `http://`. `target="_blank"` has `noopener`. `gitleaks` for secrets. | `_headers` |
| 9 | `design` | Hex colours in page `<style>` blocks must be tokens from `styles.css` unless listed in a per-page exception file. `font-family` values must be the two token faces. Inline `style=` attributes limited to an allowlist. Asset budget: no image over 500 KB, no page over 300 KB of HTML. | `assets/styles.css` |

**Nightly, against production:** booking roots return 200; PostHog API reports at least one `$pageview` and one `cta_schedule_call_clicked` in the last 24 hours; a random unknown URL returns 404; external links still resolve. Failures open a GitHub issue.

### 4.4 Proposed workflow file

```yaml
# .github/workflows/site-checks.yml
name: site-checks
on:
  pull_request:
    branches: [main, staging]
  schedule:
    - cron: "0 6 * * *"   # nightly production monitor
jobs:
  static:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r scripts/requirements.txt
      - run: python scripts/check_site.py structure links utm seo llm security design
      - uses: streetsidesoftware/cspell-action@v6
        with: { files: "**/index.html llms.txt" }
      - uses: gitleaks/gitleaks-action@v2
  analytics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24 }
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test scripts/analytics.spec.ts
  monitor:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: python scripts/check_site.py monitor --base https://www.wayaframes.com
        env: { POSTHOG_API_KEY: ${{ secrets.POSTHOG_PERSONAL_KEY }} }
```

`scripts/check_site.py` is a single Python file. Each sub-command is a function that walks the 19 pages with regex and `json`, prints findings as `file:line`, and exits non-zero on any failure. The sweeps run during this review are its first draft; everything in section 3 was produced by them.

### 4.5 The UTM fix is a migration, not a lint

The site cannot pass check 3 until a decision is made, because the current scheme and the Notion rules are incompatible. The sequence:

1. Confirm the Notion rule stands: website buttons carry `utm_button` only, and a passthrough engine supplies the rest. Resolve the `so` / `social` conflict in the Code Legend.
2. Add `assets/attribution.js`: on load, read `utm_*` from the URL, store first-touch in localStorage, and on click append them to every `leadconnectorhq.com` link while preserving `utm_button`. Define `window.WAYA_ATTR_DEFAULTS` per page so a direct visitor still routes in GHL (for example `utm_source=wayaframes`, `utm_medium=web`, `utm_campaign=dataroom_direct_2026q4`, with `web` added to the Code Legend first).
3. Rewrite the 47 buttons to `?utm_button=<placement>`. Change `analytics.js` to read `utm_button` for `location` and to add the first-touch campaign as an event property.
4. Delete `button_mapping.txt`. Update `nav.json`, the QA skill's UTM section, and the UTM skill's root table to match. Point all three at `_data/utm.json`.
5. Turn on check 3.

### 4.6 Rollout order

**Today.** Fix the three dead booking roots in GHL or repoint the eleven buttons. Record a test booking for each and mark the Notion rows Live.

**This week.** Add `404.html`. Add the analytics tag to apply, payments, and welcome. Merge `legal-pages`. Add `noindex` to apply and welcome. Delete `pre-pmf-mcp/index.html`. Fix the Organization logo URL. Compress the three heaviest images. Fix `staging.wayaframes.com` TLS or retire the hostname from the docs.

**Next two weeks.** Branch protection. Extract `_includes/nav.html` and `_includes/footer.html` and make the pages match. Add `_data/pages.json` as the page allowlist. Ship the workflow with checks 1, 2, 5, 6, 8, and 9. Update the two review skills to read ground truth from `_data`.

**Following sprint.** The UTM migration in 4.5, the Notion sync, the Playwright analytics test, and the nightly monitor. Then PostHog Phase 2 (`booking_completed` from a GHL webhook), which is the control that makes dead calendars visible within a day instead of a month.

**Later, optional.** Replace the "byte-equal to the partial" rule with a real include step (Eleventy or a 60-line script) so the nav is written once rather than copied and verified. Lighthouse CI with a performance budget on the home page and one service page.

---

## Appendix A: page inventory as reviewed

| Page | Template | Analytics | JSON-LD | Sitemap | llms.txt | Inbound links |
|---|---|---|---|---|---|---|
| `/` | yes | yes | Organization, WebSite, ItemList, FAQPage | yes | yes | 11 |
| `/about-us/` | yes | yes | AboutPage, Organization | yes | yes | 11 |
| `/scale-up-program/` | yes | yes | Service, FAQPage | yes | yes | 11 |
| `/fundraising-narrative/` | yes | yes | Service, FAQPage | yes | yes | 0 (home grid only) |
| `/data-room-preparation/` | yes | yes | Service, FAQPage | yes | yes | 0 (home grid only) |
| `/financial-model-prep/` | yes | yes | Service, FAQPage | yes | yes | 0 (home grid only) |
| `/operations-audit/` | yes | yes | Service, FAQPage | yes | yes | 0 (home grid only) |
| `/case-studies/` | yes | yes | CollectionPage | yes | yes | 1 |
| `/lean-ai/` | yes | yes | Service, FAQPage | yes | yes | 1 |
| `/lean-ai/setup/` | yes | yes | HowTo | yes | yes | 1 |
| `/lean-ai/cohort/` | yes | yes | FAQPage | yes | yes | 11 |
| `/pre-pmf-mcp/cohort/` | yes | yes | FAQPage | yes | yes | 11 |
| `/experiment-system/` | yes | yes | FAQPage | yes | yes | 1 |
| `/planning-guide/` | partial | yes | FAQPage | yes | yes | 0 |
| `/pre-pmf-mcp/` | yes | yes | Service, FAQPage | no (redirected) | no | 0 |
| `/pre-pmf-mcp/apply/` | minimal | **no** | none | no | no | 2 |
| `/pre-pmf-mcp/payments/` | minimal | **no** | none | no (noindex) | no | 0 |
| `/pre-pmf-mcp/welcome/` | minimal | **no** | none | no | no | 0 |
| `/lean-ai/setup/app/` | generated | **no** | none | no (noindex) | no | 0 |

The four service pages with zero inbound links from other pages are reachable only from the home-page service grid. They are no longer in the nav dropdown. That is a product decision, but it means one home-page edit can orphan four paid services, which is what check 5's "in sitemap and reachable" rule guards.

## Appendix B: the UTM sources in play

| Source | Says website buttons should carry | Status |
|---|---|---|
| Notion UTM Placements (declared source of truth) | `utm_button` only, engine fills the rest | authoritative |
| `.claude/skills/waya-website-qa/SKILL.md` | `utm_source=wayaframes&utm_medium=landing_page&utm_campaign=<any>&utm_content=<location>` | contradicts Notion |
| `_data/nav.json` | same as QA skill, with `<page-slug>` as campaign | contradicts Notion |
| `button_mapping.txt` | `utm_source=<slug>&utm_button=<id>` | banned descriptive codes, contradicts both |
| `waya-utm-attribution` skill | `utm_button` only, engine fills the rest | matches Notion, but lists a dead root and ships without its engine file |
| The site itself | three different schemes across 19 pages | matches none of the above |

Notion data source IDs for the sync job: Products `0b630ea3-0152-49de-a489-4b8128e4d0fd`, Code Legend `ebf4ec2b-09db-45a2-b6c1-f68698e69d5d`, Placements `d16a82b3-4f00-43d1-8e63-69ebb3b0fe55`.
