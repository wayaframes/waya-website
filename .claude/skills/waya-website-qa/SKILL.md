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
- `_data/faq.json` — canonical FAQ source
- `_data/nav.json` — canonical navigation structure
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

### Canonical booking URLs (flag any deviation)
- Fundraising Narrative: `https://api.leadconnectorhq.com/widget/bookings/fundraising-narrative`
- Data Room Preparation: `https://api.leadconnectorhq.com/widget/bookings/dataroom-preparation`
- Financial Model Preparation: `https://api.leadconnectorhq.com/widget/bookings/financial-model-preparation`
- All other CTAs: `https://api.leadconnectorhq.com/widget/bookings/waya-consultation`

### Canonical UTM structure (flag missing or malformed params)
Every booking URL must have:
- `utm_source=wayaframes`
- `utm_medium=landing_page`
- `utm_campaign=<value>` — must be present, any non-empty value is acceptable
- `utm_content=<location>` — must be one of: `nav`, `hero`, `challenge`, `pullquote`, `final_cta`, `footer`

### Canonical footer structure (4 columns, left to right)
1. Logo + caption: "We have walked the path, faced the storms, and know how critical a guide can be."
2. About us: Home, About us
3. Services: Scale Up Program, Financial Model Preparation, Data Room Preparation, Fundraising Narrative
4. Social: LinkedIn (naamamoran), YouTube (@Waya-Frames), Substack (@themessymiddlefiles)
- Bottom bar: "© Copyright 2026 – WayaFrames – All rights reserved."

### Canonical nav structure
Home → About Us → Services (dropdown) → Schedule a Call (CTA button)
Services dropdown order: Scale Up Program, Fundraising Narrative, Data Room Preparation, Financial Model Preparation, Operations Audit

### Brand voice rules (flag violations)
- No emoji in body copy or headings
- No exclamation marks anywhere
- Forbidden words: "unlock", "elevate", "transformational", "game-changer", "empower", "leverage" (as a verb), "delve", "tapestry"
- Tone: direct, founder-to-founder, no corporate fluff
- No passive voice in CTAs ("Book a call" not "A call can be booked")
