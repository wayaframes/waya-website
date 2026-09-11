# Report Format

Produce the report in this exact structure. The goal is that the user can act on it
top-to-bottom without asking a follow-up question.

Severity:
- **P0 — Critical.** Breaks security, indexing, or a primary conversion path. Fix now.
  (e.g. 404'd primary CTA, page missing from index, secret committed, broken JSON-LD.)
- **P1 — High.** Meaningfully hurts security posture, SEO, or conversion. Fix this week.
  (e.g. no CSP, missing meta description, no above-the-fold CTA, PostHog not firing.)
- **P2 — Polish.** Best-practice gaps and cosmetics. Fix when convenient.

---

```markdown
# Waya Website — Technical Audit
**Scope:** <pages audited>  ·  **Date:** <date>  ·  **Verification:** static + browser (localhost:8080)

## Summary
<2–4 sentences: overall health, the single most important thing to fix, and how many
findings by severity.>

| Area | Status | Notes |
|---|---|---|
| Security | ⚠️ | No CSP; 2 links missing rel=noopener |
| Design | ✅ | |
| Links | ❌ | 1 internal 404 |
| SEO | ⚠️ | 2 duplicate meta descriptions |
| JSON-LD / LLM | ❌ | 2 pages have none; 1 price drift |
| PostHog | ❌ | Not installed |
| Performance / a11y | ✅ | |

## P0 — Critical
### <short title>
- **Page:** <page> · **Location:** `path/to/file.html:123`
- **Problem:** <what's wrong, with the evidence — the status code, the mismatched value, etc.>
- **Why it matters:** <impact on security / ranking / conversion, one line>
- **Fix:** <the specific change; include the corrected snippet when short>

## P1 — High
<same structure>

## P2 — Polish
<same structure, can be terser — one bullet per finding is fine>

## Cross-cutting notes
<Anything that spans pages: e.g. "nav/footer are copied into 10 pages, so every fix below
must be applied to all of them" or "recommend adding a shared JSON-LD block via the same
copy discipline.">

## Prioritised action list
1. <most important fix> — <pages affected>
2. ...
(Ordered so the user can execute top-down. Group "apply to all 10 pages" items clearly.)
```

Rules for the report:
- **Every finding cites `file:line`.** No line = you didn't actually verify it.
- **Quote the evidence.** "JSON-LD `price` is `1500`, page shows `$2,000`" beats "price mismatch".
- **No inflated severity and no praise padding.** If an area is genuinely clean, one ✅ row
  and move on.
- **End by offering to apply the P0/P1 fixes**, and remind the user that duplicated
  nav/footer/analytics means a fix typically edits all pages, not one.
