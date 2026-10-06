# The Experiment System page — structure proposal

Source: *Experiment Platform Features* doc. Drafts live at
`/pre-pmf-mcp/experiment-system/option-a|b|c/` (all `noindex`).

## Where it sits in the sitemap

```
/                                   Home
├── /about-us/
├── /pre-pmf-mcp/cohort/            12 Weeks to PMF        ← conversion page
│   ├── /pre-pmf-mcp/experiment-system/   The Experiment System   ← NEW (explainer)
│   └── /pre-pmf-mcp/apply/         Apply (checkout)
├── /lean-ai/cohort/                4 Weeks to Higher Margins
└── /scale-up-program/ …
```

**Recommended URL: `/pre-pmf-mcp/experiment-system/`.** It's a child of the PMF
program, not a separate service. That keeps it in the same URL cluster as the page
it sells (cohort, apply) and tells search engines and LLMs the two belong together.

**How visitors reach it**
- Nav → Services dropdown, directly under "12 Weeks to PMF" (already in the drafts' nav).
- Cohort page, Module Four ("The experiment system") → add "See how the Experiment System works →".
- Home page: a short "Cut through the AI noise" teaser, if there's room.
- Footer Services list (already in the drafts' footer).
- `llms.txt` and `sitemap.xml` (priority 0.7) once the page is live.

**How it pushes visitors to the program** (built into all three drafts)
1. Hero CTA → `/pre-pmf-mcp/cohort/`.
2. A sticky, dismissible "Run this on your company" bar after the first screen.
3. A "Where you run it" strip: the Experiment System = weeks 4–12 of the program.
4. Final CTA → Apply (`/pre-pmf-mcp/apply/`), with "See the 12-week program" as the second button.

## Page narrative (same story in every option)

| # | Beat | Source doc features |
|---|------|---------------------|
| 1 | Hook: AI makes more output, not more truth | Framing (the "AI noise" angle) |
| 2 | The loop: Define → Build → Learn → Track → Analyze | §1 (the five layers) |
| 3 | Test the riskiest thing first | §5 risk/reward ranking from Business Case + Mission & Values |
| 4 | Evidence = paying customers, not your echo chamber | §9 contrarian thinking, §10 intent to buy |
| 5 | Focus: small verified tool stack, effort vs impact, drop-dead dates | §2, §3, §11 |
| 6 | Learn from every call | §1.3 Learn, §8, §10 |
| 7 | Bridge to 12 Weeks to PMF, then CTA | — |

## The three directions

| | A — The Loop | B — Signal from Noise | C — Experiment Lab |
|---|---|---|---|
| Feel | Familiar Waya (mountain hero) | Editorial, dark, cinematic | Product UI, hands-on |
| Hero widget | Mountain hero | Particle field: noise settles into a signal wave | Live experiment board |
| Main widgets | Noise→signal toggle, 5-node loop dial, risk/reward matrix, flip tiles | Tool-stack switch (16→5), "Who said yes?" evidence slider, sticky scroll story, drop-dead-date experiment | Experiment simulator, call→insight extractor, effort vs impact planner, comparison table |
| Best for | Brand consistency | Leading with the "AI noise" story | Showing the product and getting visitors to touch it |

## Open questions
- The doc says "four layers" but lists five (Define, Build, Learn, Track, Analyze). The drafts use five.
- All numbers in the widgets are illustrative and labelled that way. Swap in real cohort data once it exists.
- No testimonial yet. A single founder quote under the loop/simulator would help conversion.
