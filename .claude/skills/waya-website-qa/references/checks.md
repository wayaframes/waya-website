# Waya Website QA Checks

Work through every check below for every page being audited.
Mark each as PASS, FAIL, or N/A. Every FAIL must appear in the report with:
- The page it was found on
- The exact text or element that failed
- The correct version

---

## CATEGORY 1: Product Name Consistency

**1.1 — Canonical spelling**
Scan every instance of each product name. Flag any capitalisation or spelling variant
that doesn't match the canonical names in SKILL.md. Check headings, body copy,
nav, footer, alt text, meta tags, JSON-LD, and button labels.

**1.2 — "WayaFrames" vs "Waya"**
"Waya" (short form) is acceptable in informal body copy only. It must never appear
in headings, CTAs, service names, or JSON-LD. Flag any short-form usage outside
of body copy.

**1.3 — Service name agreement across pages**
For each service, confirm the name is spelled identically on every page that
references it. A service called "Data Room Preparation" on its own page must not
be "Dataroom Prep" in a cross-sell mention on another page.

---

## CATEGORY 2: Cross-Page Content Consistency

**2.1 — Service descriptions match**
Pull the description of each service from its own page. Then find every mention of
that service on other pages (nav, footer, cross-sell sections, FAQs). Confirm the
description is consistent in meaning. Flag contradictions or meaningfully different
framings (e.g., one page says "one-hour session", another says "two-hour session").

**2.2 — Pricing and duration consistency**
Any mention of session length, deliverable count, or engagement duration must be
identical across all pages. Flag any disagreement (e.g., "3 WayaFrames" on one
page vs "2 WayaFrames" on another).

**2.3 — Stage/audience consistency**
The audience description for each service must be consistent. Flag if one page says
"Seed through Series B+" and another says "Series A and beyond" for the same service.

**2.4 — FAQ consistency**
Compare FAQ content in each page's FAQ section against `_data/faq.json`.
Flag any answer that differs from the canonical version — even slightly reworded
answers that change meaning. Flag any FAQ that appears in the HTML but not in
`faq.json` (undocumented FAQ = needs to be added to the source of truth).

**2.5 — Founder/team claims**
Any claim about the founding team (names, backgrounds, number of years experience,
previous companies) must be identical across all pages and the About page.

---

## CATEGORY 3: CTA and Link Integrity

**3.1 — Booking URL correctness**
Every CTA button and link must use the canonical booking URL for its service (see
SKILL.md). Flag any URL that points to the wrong service slug, a deprecated URL,
or a generic URL where a service-specific URL should be used.

**3.2 — UTM parameter completeness**
Every booking URL must carry all four UTM parameters. Flag any URL missing
`utm_source`, `utm_medium`, `utm_campaign`, or `utm_content`. Flag any `utm_content`
value that doesn't match the button's location (e.g., hero button using `footer`).

**3.3 — UTM campaign value present**
`utm_campaign` must have a non-empty value. Flag `utm_campaign=` or `utm_campaign=%20`.

**3.4 — Internal link accuracy**
Every internal link (`href` pointing to `/page/`) must resolve to a page that actually
exists in the site directory. Flag any link pointing to a non-existent page or a
deprecated URL (e.g., `/fundraising-audit/` instead of `/fundraising-narrative/`).

**3.5 — Footer service links**
Verify all four service links in the footer point to the correct canonical URLs. Verify
the social links point to the three correct profiles. Verify the logo links to the homepage.

**3.6 — Nav links and dropdown order**
Confirm nav links match `_data/nav.json`. Confirm the Services dropdown lists all
five services in the correct order. Confirm the CTA button points to the correct URL.

**3.7 — No dead or placeholder links**
Flag any `href="#"`, `href="javascript:void(0)"`, `href="TBD"`, or obviously
placeholder anchor text like "Click here", "Link", "Page 1".

---

## CATEGORY 4: Grammar, Spelling, and Typos

**4.1 — Spell check**
Check all visible text on every page. Flag spelling errors. Pay extra attention to:
- Homophone errors (their/there/they're, its/it's, your/you're)
- Missing articles (a/an/the)
- Wrong prepositions

**4.2 — Grammar**
Flag subject-verb disagreement, dangling modifiers, sentence fragments that aren't
intentional (some fragments are brand voice — use judgment), and run-on sentences.

**4.3 — Punctuation**
Flag missing full stops, double spaces, inconsistent use of em dash vs en dash vs
hyphen. The brand uses em dash (—) with spaces on both sides. Flag hyphens used
where em dashes should appear.

**4.4 — Oxford comma**
The brand uses the Oxford comma. Flag any list of three or more items missing it.

**4.5 — Number formatting**
Flag inconsistent number formatting (e.g., "3-6 months" vs "3–6 months" — the
latter with en dash is correct).

---

## CATEGORY 5: Brand Voice and Tone

**5.1 — Forbidden words**
Scan all body copy for: "unlock", "elevate", "transformational", "game-changer",
"empower", "leverage" (when used as a verb), "delve", "tapestry", "synergy",
"holistic", "robust", "seamless". Flag every instance.

**5.2 — Emoji**
Flag any emoji in headings, body copy, CTAs, or meta descriptions. Emoji in
HTML comments or `<title>` tags are also flagged.

**5.3 — Exclamation marks**
Flag any exclamation mark in visible text.

**5.4 — Passive voice in CTAs**
Every CTA must be imperative and active. Flag passive constructions ("A call can
be scheduled", "Our team can be reached").

**5.5 — Corporate filler**
Flag sentences that are pure filler with no information content — e.g., "We are
committed to excellence", "Our team is passionate about results". These should be
replaced with specifics.

**5.6 — First-person consistency**
The site speaks as "we" (the company). Flag any switch to third person ("WayaFrames
believes that...") in body copy — third person is only appropriate in JSON-LD and
meta descriptions.

---

## CATEGORY 6: Structural and Navigation Integrity

**6.1 — Page title tags**
Every page must have a `<title>` tag. It must include "WayaFrames" and a
page-specific description. Flag missing titles or generic titles ("Home", "Page").

**6.2 — Meta descriptions**
Every page must have a `<meta name="description">` tag with 120–160 characters.
Flag missing meta descriptions, those under 120 chars, or those over 160 chars.

**6.3 — H1 uniqueness**
Every page must have exactly one `<h1>`. Flag pages with zero H1s or more than one.

**6.4 — Heading hierarchy**
Headings must descend in order (H1 → H2 → H3). Flag any case where a heading
level is skipped (e.g., H1 followed directly by H3).

**6.5 — JSON-LD presence and accuracy**
Every page must have a `<script type="application/ld+json">` block. The
`Organization` block must be present on every page. Service pages must also have
a `Service` block. Compare values against `_data/schema.json` — flag any
description, name, or URL that differs from the canonical source.

**6.6 — Canonical tags**
Every page should have `<link rel="canonical">` pointing to its own absolute URL
(`https://www.wayaframes.com/...`). Flag missing canonical tags.

**6.7 — Open Graph tags**
Each page should have `og:title`, `og:description`, `og:url`, and `og:image`.
Flag missing Open Graph tags.

**6.8 — Alt text on all images**
Every `<img>` must have a non-empty `alt` attribute. Flag missing alt text and
generic alt text ("image", "photo", "img1.png").

---

## CATEGORY 7: Repetition and Redundancy

**7.1 — Near-duplicate sentences**
Flag sentences that appear more than once on the same page with only minor wording
changes (e.g., "We work with founders" and "We help founders" appearing in the same
section). One or the other — not both.

**7.2 — Cross-page near-duplicate sections**
Flag sections that are almost identical across multiple pages when they shouldn't be
(e.g., a "who this is for" section that's copy-pasted verbatim). Cross-page consistency
is good; verbatim copying of body sections is lazy and hurts SEO.

**7.3 — Repeated image files**
Flag the same image file (`src`) used more than once on the same page. Also flag
if the same hero image appears across multiple service pages — each service page
should have a distinct hero.

**7.4 — Image filename red flags**
Flag images with filenames like `image1.png`, `photo.jpg`, `screenshot.png`,
`unnamed.png`, `copy-of-hero.jpg`. These suggest placeholder or unoptimised assets.
Flag images with no descriptive filename.

**7.5 — Redundant CTAs**
If the same CTA button text and URL appears more than four times on a single page,
flag it. Four instances (nav, hero, body, final CTA) is the intended maximum.

---

## CATEGORY 8: Customer Journey and Conversion Integrity

**8.1 — Above-the-fold CTA present**
Every page must have a primary CTA button visible without scrolling (in the hero
section). Flag any page where the hero section has no CTA.

**8.2 — CTA hierarchy clarity**
Each page should have one dominant CTA (e.g., "Book a Data Room session") and at
most one secondary CTA (e.g., "Learn about the Scale Up Program"). Flag pages
where two CTAs compete equally with the same visual weight.

**8.3 — Social proof present**
Every service page should include at least one testimonial, case study reference,
or named client outcome. Flag service pages with no social proof.

**8.4 — FAQ section present on service pages**
Every service page must have an FAQ section. Flag any service page missing it.
Confirm the FAQ section pulls the correct entries for that page (check the `pages`
array in `faq.json`).

**8.5 — "Who this is for" section clarity**
Every service page must clearly state the target audience. Flag vague or missing
audience definitions (e.g., a page that only says "for founders" without any stage,
company type, or timing qualifier).

**8.6 — No orphaned pages**
Every page in the site directory must be reachable from the nav or footer. Flag any
`index.html` in a folder that has no inbound link from nav, footer, or another page.

**8.7 — Contact/booking friction**
Count the number of clicks required to reach a booking page from each service page.
If it's more than one click (i.e., the page doesn't have a direct booking link), flag it.

**8.8 — Mobile breakpoint**
Confirm the stylesheet has a breakpoint at ≤960px. Flag any page that doesn't
include a responsive CSS rule. (Visual QA on device is a separate manual step —
this check confirms the rule exists in the CSS.)

**8.9 — CTA repeated at decision points**
A single CTA at the top isn't enough to capture intent that builds as the visitor
reads. Every page should offer the booking CTA again at natural decision points:
after the value proposition / "who this is for", after social proof, and at the end
of the page. Flag long service pages (anything past ~two screens) that go from the
hero CTA to the footer with no CTA in between — that's engaged traffic given no way
to act at the moment they're convinced.

**8.10 — CTA visual prominence**
The primary CTA must be the most visually prominent interactive element on the page —
strong colour contrast against its surroundings, clearly button-shaped, not blending
into body links. Flag primary CTAs that are visually indistinct from secondary links,
or that sit below a wall of competing coloured elements.

**8.11 — Mobile tap target**
On mobile, the CTA must be an easy thumb target — at least ~44px tall and not crowded
against adjacent links. Flag CTAs that render small, thin, or tightly packed at the
≤960px breakpoint. Small mobile tap targets quietly bleed the majority of traffic,
which is on phones.

**8.12 — Placement is measurable**
Every CTA's `utm_content` must name its placement (`nav`, `hero`, `challenge`,
`pullquote`, `final_cta`, `footer`) so analytics can tell which placements actually
drive bookings (tag correctness is checked in 3.2 — here confirm the placement value
is meaningful and distinct per location, not `hero` on every button). Without this you
can't tell an underperforming placement from a well-placed one.
