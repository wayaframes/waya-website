---
name: waya-website-qa
description: >
  Run a full content and conversion QA audit on the WayaFrames website directory. Use this
  skill whenever the user asks to "QA the site", "review the content", "check for
  inconsistencies", "run a content audit", "review before publish", "check the pages",
  "proofread the site", or any variation of reviewing website content for quality,
  consistency, or accuracy. This skill ALSO owns CTA placement and conversion — trigger it
  for "are my CTAs in the right place", "are the CTAs positioned to drive traffic and
  engagement", "why isn't this page converting", "review the customer journey", or any
  question about CTA position, prominence, or conversion. Also trigger when the user says
  "the site is ready to review", "check this page before we push", or uploads/references
  HTML files from the waya-website repo. This skill catches content and conversion problems
  — not code bugs, security, SEO, or analytics, which belong to waya-website-tech-audit —
  before they reach production.
---

# Waya Website Content QA

You are a head-of-marketing-level reviewer with the standard of "this needs to be tight."
Your job is to catch every content problem that would embarrass the brand, confuse a
prospect, or undermine the customer journey — before it goes live.

## How to run this skill

### 1. Locate the files

If the user provides a directory path, read all `.html` files under it recursively.
If they upload or paste specific pages, work with those.
If no path is given, ask: "Which directory or pages should I audit?"

Always read these files alongside the HTML:
- `index.html` — the source of truth for nav and footer (`docs/WEBSITE-CHECKLIST.md`, section 0); every other page must match its `<header class="nav">` and `<footer>`
- `_data/faq.json` — canonical FAQ source
- `_data/nav.json` — a copy of the nav and footer links in `index.html`; if the two disagree, `index.html` wins and `nav.json` is the stale one
- `_data/schema.json` — canonical service names and descriptions

### 2. Run all checks in `references/checks.md`

Load `references/checks.md` now. It contains the full checklist organised into 8 categories.
Work through every check for every page. Do not skip categories.

### 3. Produce the QA Report

Output a structured report using the format in `references/report-format.md`.
Load that file before writing the report.

---

## Ground truth — memorise these before auditing

### Canonical product names (exact spelling, exact capitalisation)
| Canonical name | Common wrong variants to flag |
|---|---|
| WayaFrames | Wayaframes, wayaframes, Waya Frames, waya-frames |
| Scale Up Program | Scale-Up Program, Scale up Program, ScaleUp |
| Fundraising Narrative | Fundraising narrative, fundraising Narrative |
| Data Room Preparation | Data room preparation, Dataroom Preparation, Data-Room |
| Financial Model Preparation | Financial model preparation, Financial Model Prep (as a heading — slug is fine) |
| Operations Audit | Operations audit, Ops Audit (as a heading — abbreviation is fine in body copy only) |
| Expert Network | expert network, Expert network |

### Canonical booking roots and UTM rules
The reference definition is `_data/utm.json` in this repo. Read it; do not rely on this section.
- Live booking roots are the entries under `roots` with `"status": "live"` (as of 2026-10-12: `waya-consultation`, `ops-intro-call`). Any other root slug is a CRITICAL finding.
- Website buttons carry **only** `utm_button=<placement>` with a value from `website_buttons.allowed`. A button that hardcodes `utm_source`, `utm_medium`, `utm_campaign` or `utm_content` is a CRITICAL finding (it overrides the real campaign; the engine in `assets/analytics.js` fills those in).
- Each page declares `window.WAYA_ATTR_DEFAULTS` with a `utm_campaign` of the form `<product>_<audience>_<period>` using a product token from `products`.
- Run `python scripts/check_utm.py` and report its failures verbatim instead of re-deriving them.

### Canonical footer structure (5 columns, left to right)
Copied from the `<footer>` in `index.html`. If it has changed since, `index.html` wins.
1. Logo (links to `/`) + caption: "We have walked the path, faced the storms, and know how critical a guide can be."
2. About Us: Home (`/`), About Us (`/about-us/`)
3. Programs: Scale Up Program (`/scale-up-program/`), 12 Weeks to PMF (`/experiment-platform/cohort/`), 8 Weeks to Higher Margins (`/lean-ai/cohort/`)
4. Case Studies: Improving Margins (`/case-studies/improving-margins/`), Scaling (`/case-studies/scaling/`), Improving Customer Outcomes (`/case-studies/improving-customer-outcomes/`), All case studies (`/case-studies/`)
5. Schedule a Call button (`waya-consultation?utm_button=footer`), then social: LinkedIn (naamamoran), YouTube (@Waya-Frames)
- Bottom bar, legal links: Privacy Policy (`/privacy-policy/`), Terms of Service (`/terms-of-service/`), How We Handle Your Data (`/data-handling/`), Support (`/support/`)
- Bottom bar, copyright: "© Copyright 2026 – Waterbear LLC – All rights reserved."

### Canonical nav structure
Copied from the `<header class="nav">` in `index.html`. If it has changed since, `index.html` wins.
Home → About Us → Case Studies (dropdown) → Programs (dropdown) → Schedule a Call (CTA button, `waya-consultation?utm_button=nav`)
Case Studies dropdown order: Improving Margins, Scaling, Improving Customer Outcomes, All case studies
Programs dropdown order: Scale Up Program, 12 Weeks to PMF, 8 Weeks to Higher Margins

### Page titles
Titles end " – Waya" (en dash), not "WayaFrames" (`docs/WEBSITE-CHECKLIST.md`, section 2). Check 6.1 has the full rule.

### Brand voice rules (flag violations)
- No emoji in body copy or headings
- No exclamation marks anywhere
- Forbidden words: "unlock", "elevate", "transformational", "game-changer", "empower", "leverage" (as a verb), "delve", "tapestry"
- Tone: direct, founder-to-founder, no corporate fluff
- No passive voice in CTAs ("Book a call" not "A call can be booked")
