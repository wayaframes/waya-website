# QA Report Format

Use this exact structure for every audit output.

---

## Output template

```
# WayaFrames Website QA Report
**Date:** YYYY-MM-DD
**Pages audited:** [list every page file audited]
**Auditor:** Claude (waya-website-qa skill)

---

## Executive Summary
[2–4 sentences. Total issues found, severity breakdown, most critical finding.
Write this as if briefing the head of marketing in 30 seconds.]

---

## Issues by Severity

### 🔴 CRITICAL — Fix before any publish
[Issues that actively mislead prospects, break booking flows, or contradict
the brand on something material. Wrong booking URLs, broken UTMs, factual
contradictions between pages, missing CTAs on service pages.]

### 🟡 IMPORTANT — Fix this sprint
[Issues that undermine quality but don't break the funnel. Capitalisation
errors on product names, missing meta descriptions, forbidden words,
near-duplicate sections, orphaned pages.]

### 🔵 MINOR — Fix when convenient
[Cosmetic issues that won't affect conversion. Punctuation inconsistencies,
alt text on decorative images, redundant sentences.]

---

## Issue Log

For each issue, use this format:

**[CATEGORY CODE]-[NUMBER] | [SEVERITY EMOJI] | [Page]**
- **Check:** [Check ID from checks.md, e.g. "3.2 UTM parameter completeness"]
- **Found:** `[exact text, URL, or element that failed — use code formatting]`
- **Should be:** `[the correct version]`
- **Action:** [one sentence on what to change]

Example:
**CTG3-001 | 🔴 | /data-room-preparation/index.html**
- **Check:** 3.2 UTM parameter completeness
- **Found:** `https://api.leadconnectorhq.com/widget/bookings/dataroom-preparation?utm_source=wayaframes&utm_medium=landing_page&utm_campaign=main`
- **Should be:** URL must also include `&utm_content=hero` (or the appropriate location value)
- **Action:** Add `utm_content=hero` to the hero button URL on the data-room-preparation page.

---

## PASS Summary

List every check that passed cleanly, grouped by category.
Format: `✅ [Check ID] — [Page(s)]`

---

## Recommendations (beyond the checklist)

[Any issues spotted that don't fit a specific check — content gaps, journey
observations, image quality flags, messaging that's technically correct but
feels off-brand. Max 5 bullets. This is the head-of-marketing voice, not a
compliance checklist.]

---

## Files to update

[A flat list of every file that needs to change, with the number of issues in each.]
- `/data-room-preparation/index.html` — 3 issues
- `_data/faq.json` — 1 issue
```

---

## Severity assignment guide

| Condition | Severity |
|---|---|
| Wrong booking URL or broken UTM | 🔴 CRITICAL |
| Factual contradiction between pages | 🔴 CRITICAL |
| Missing hero CTA on service page | 🔴 CRITICAL |
| Canonical product name misspelled in heading or CTA | 🔴 CRITICAL |
| Missing JSON-LD on a page | 🟡 IMPORTANT |
| Forbidden word in body copy | 🟡 IMPORTANT |
| Missing meta description | 🟡 IMPORTANT |
| FAQ in HTML not in faq.json | 🟡 IMPORTANT |
| Near-duplicate section across pages | 🟡 IMPORTANT |
| Oxford comma missing | 🔵 MINOR |
| Decorative image missing alt text | 🔵 MINOR |
| Heading hierarchy skip | 🔵 MINOR |
| Redundant sentence on same page | 🔵 MINOR |
| Image filename not descriptive | 🔵 MINOR |
