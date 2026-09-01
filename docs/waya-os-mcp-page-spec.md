# Waya OS MCP — Page Build Spec

**Deliverable:** a marketing/product page for the **pro** Waya MCP (the diagnostic deck), built to sit on `wayaframes.com` alongside the Pre-PMF MCP page.
**Model for structure & styling:** `pre-pmf-mcp/index.html`. This page reuses the same shared stylesheet (`/assets/styles.css`), nav, footer, and section grammar. Only the content and a few page‑specific classes change.
**Leads with:** `/constraint-identification` and `/gap-analysis`. The rest of the diagnostic suite (`/a3-thinking`, `/experiment-design`, `/impact-effort`) is present but supporting.
**Pricing:** none on this page. The MCP is free to connect (no payments, no entitlements in the product today). CTAs drive to *connect the MCP* and *schedule a call* — not to tiers.

---

## 0. Positioning

| | Pre-PMF MCP (existing page) | **Waya OS MCP (this page)** |
|---|---|---|
| Who | Early founders searching for product-market fit | Operators and leaders with a real problem to solve — the number isn't moving, something's broken, resources are scattered |
| Job | Find your purpose, sharpen the idea, design the first experiments | Find the one thing that's actually constraining the goal, then get to the root of why it's stuck |
| Server / connector name | **Waya Pre-PMF** (`pre-mcp.wayaframes.com/mcp`) | **Waya OS** (`pro-mcp.wayaframes.com/mcp`) |
| Frame vocabulary | "Wayaframes" | "Wayaframes" (keep identical) |

**One-line pitch:** *Waya OS puts our diagnostic method — Lean practice plus startup know-how — inside the AI assistant you already use. It doesn't hand you a fix. It makes sure you're solving the right problem, for the right reason.*

**The core story the page tells (two moves, in order):**
1. **`/constraint-identification` — point the weapon.** Every system has exactly one constraint relative to a goal. Find it before you spend a dollar or an hour attacking anything.
2. **`/gap-analysis` — dig for the root.** Once you know *where*, get to *why* — turn a vague, contested problem into validated, evidence-backed root causes.

Everything else in the deck runs off those two: `a3-thinking` is the frame they sit inside, `experiment-design` turns root causes into tests, `impact-effort` ranks what to do first.

---

## 1. `<head>` / SEO

Mirror the Pre-PMF page's head block exactly in structure; swap the values.

- **`<title>`** — `Waya OS MCP – Waya`
- **`meta[name=description]`** — *"Waya OS is a diagnostic MCP for operators. It puts Waya's frameworks — Wayaframes — inside your AI assistant to find the one constraint blocking your goal, then get to the root of why it's stuck. Free to connect."*
- **`link[rel=canonical]`** — `https://www.wayaframes.com/waya-os-mcp/` *(final path is an open question — see §11)*
- **Open Graph** — `og:type=website`, `og:site_name=Waya`, `og:title`/`og:description` matching above, `og:url` = canonical.
- **`link[rel=icon]`** — `/assets/favicon.png` (unchanged)
- **`link[rel=stylesheet]`** — `/assets/styles.css?v=4` (unchanged)

### JSON-LD — Service
Same shape as Pre-PMF but **omit the `offers` array** (no pricing yet).

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Waya OS MCP",
  "url": "https://www.wayaframes.com/waya-os-mcp/",
  "description": "A diagnostic MCP with Wayaframes for operators and leaders. Includes guided frameworks for constraint identification and gap analysis, with A3 thinking, experiment design, and impact–effort prioritization.",
  "provider": { "@type": "Organization", "name": "Waya", "url": "https://www.wayaframes.com/" }
}
```

### JSON-LD — FAQPage
Same block as Pre-PMF, populated with the Q&As in §9.

---

## 2. Nav & Footer

**Reuse the shared `header.nav` and `footer` verbatim** from the Pre-PMF page. One change:

- In the **Products** dropdown, add this page above/below Pre-PMF MCP:
  ```html
  <a href="/waya-os-mcp/">Waya OS MCP</a>
  <a href="/pre-pmf-mcp/">Pre-PMF MCP</a>
  ```
- Nav "Schedule a Call" button: keep, update UTM → `utm_source=waya-os-mcp&utm_content=nav`.
- Footer "Services" list: add `<li><a href="/waya-os-mcp/">Waya OS MCP</a></li>`.

---

## 3. HERO  `<section class="hero compact">`

Same structure as Pre-PMF hero (background image, eyebrow, h1, sub, two CTAs).

- **Background image:** a darker, more operational hero than the pre-PMF mountain — suggest an existing asset in the ops/diagnostic register (e.g. a workshop/whiteboard or a topographic/terrain image). Placeholder: `/assets/images/hero/mountain-sage.png` until art is chosen.
- **eyebrow:** `Built by operators, for operators`
- **h1:** `Waya OS MCP`
- **sub:** `The diagnostic frameworks that find your real constraint — then get to the root of why it's stuck. Running right inside the AI assistant you already use.`
- **CTAs:**
  - primary `btn-rust` → `#setup` — **Add Waya OS**
  - secondary `btn-ghost-dark` → `#whats-inside` — **See the Frameworks**

---

## 4. THE CHALLENGE  `<section id="challenge" class="bg-paper">`

Two-column (`.two-col`): body block left, image right — same as Pre-PMF.

- **section-eyebrow:** `The Challenge`
- **Body (two paragraphs):**
  > Most improvement work is busy work aimed at the wrong target. Teams pour effort into what they understand and control, the loudest complaint gets the budget, and a month later the main number still hasn't moved. When a problem *does* get attention, the fix usually chases a symptom — because no one stopped to ask why it's really happening.
  >
  > Waya OS puts the diagnostic method inside the assistant you already use. Two moves do the heavy lifting: **find the one constraint** that's actually blocking the goal, then **get to the root** of why it's stuck — with the evidence to back it up. Aim before you fire.
- **section-cta:** `btn-rust` → `#whats-inside` — **See the Frameworks**
- **Image:** an operator/whiteboard/diagnostic scene. Placeholder alt: *"An operator at a whiteboard mapping a system to find the bottleneck."*

---

## 5. WHAT'S INSIDE — WAYAFRAMES  `<section id="whats-inside">`

- **section-eyebrow:** `Wayaframes`
- **section-title:** `Point the weapon, then dig`
- **section-lead:** `Connect the MCP once and these become commands in your AI assistant. Each one facilitates a proven method with you, step by step, and hands you a real deliverable at the end.`

### 5a. Two featured frames (prominent — `.frames` grid, 2 columns)

**Card 1 — Constraint Identification**
- `.cmd`: `/constraint-identification`
- `h3`: `Constraint Identification`
- body:
  > Every system has exactly one constraint relative to a goal — one thing that, if you improved it, would move the number more than anything else. This Wayaframe locks in the goal, maps the system, pressure-tests your candidates against the comfort-and-control bias, and validates the real bottleneck before you spend a dollar attacking it. Then it points you at the right way to fix it.

**Card 2 — Gap Analysis**
- `.cmd`: `/gap-analysis`
- `h3`: `Gap Analysis`
- body:
  > A vague, contested problem becomes a validated set of root causes. It solidifies the problem against SMART‑P criteria, picks the right method — 5 Whys for a contained issue, Fishbone when it crosses departments — and facilitates the analysis until the causes are actionable and evidence-based. The output you can defend later, not a hunch.

### 5b. The rest of the diagnostic suite (supporting — a 3-up row of smaller cards)

Intro line above the row: `They don't run alone. Waya OS carries the frame they sit inside and the tools that turn a diagnosis into action:`

| `.cmd` | Title | One-liner |
|---|---|---|
| `/a3-thinking` | A3 Thinking | The master frame the others run inside. Adapts depth to the problem — a fifteen-minute quick pass or a full multi-week engagement — and opens the narrower methods at the right step. Default entry when you're not sure where to start. |
| `/experiment-design` | Experiment Design | Turns validated root causes into small, testable experiments with clear success criteria and a test–learn–revise loop. |
| `/impact-effort` | Impact–Effort | Ranks competing options — gaps, experiments, fixes — by impact against effort, so you act on the two or three that matter and park the rest. |

*(Styling: render 5b cards in the supporting style — e.g. the Pre-PMF page's `.frame` with `background: var(--waya-paper)` so they read as secondary to the two featured cards. See §10.)*

---

## 6. HOW THEY WORK TOGETHER — THE DIAGNOSTIC LOOP  `<section id="loop" class="bg-paper">`

*Replaces the Pre-PMF "Pricing" slot. Uses a horizontal/stacked three-step flow styled like the Pre-PMF `.weeks` timeline cards (see §10, `.loop`).*

- **section-eyebrow:** `How it fits together`
- **section-title:** `Aim. Diagnose. Attack.`
- **section-lead:** `The frameworks are a sequence, not a menu. Each one hands off to the next — and Waya OS routes you to the right step so you don't skip the one you need.`

**Step 1 — Aim  ·  `/constraint-identification`**
> Find the one constraint blocking the goal and validate it moves the number. Most companies never do this — they attack whatever's loudest. *Output: a named, validated constraint and where to point next.*

**Step 2 — Diagnose  ·  `/gap-analysis`**
> Now that you know *where*, get to *why*. Drill the constraint to root causes you can defend with evidence. *Output: validated root causes, via 5 Whys or Fishbone.*

**Step 3 — Attack  ·  `/experiment-design` · `/impact-effort` · A3**
> Turn root causes into experiments, rank them by impact and effort, and run the test–learn–revise loop. Break this constraint and the next one surfaces — the loop begins again. *Output: prioritized experiments with success criteria.*

Footnote line under the flow: `Not sure which step you're on? Start with /a3-thinking — it opens the right method for you.`

- **section-cta:** `btn-rust` → `#setup` — **Add Waya OS**

---

## 7. A WORKED EXAMPLE  `<section id="example">`

*Replaces the Pre-PMF "4-week Program" slot. A concrete before/after so the abstraction lands. Styled with the `.week`-style cards (§10, `.example-step`).*

- **section-eyebrow:** `What it looks like`
- **section-title:** `From "everything's on fire" to one validated cause`
- **section-lead:** `A revenue-growth goal that wouldn't budge, run through the loop.`

**The setup**
> Goal: grow monthly revenue from \$500K to \$800K this quarter. Three teams each swear they're the bottleneck. Ops has already cut its error rate from 50% to 5% — and sales still hasn't moved.

**Step 1 · Constraint Identification**
> Candidates get pressure-tested against the goal. Ops improved and the number didn't move — so ops wasn't the constraint for *this* goal. Upstream test: sales isn't slow, it's drowning in unqualified leads. **Validated constraint: lead quality.** 60% of pipeline is unqualified; sales closes 40% of qualified leads and 3% of the rest.

**Step 2 · Gap Analysis**
> Drill *why* lead gen produces 60% unqualified leads. 5 Whys traces it to a targeting spec no one owns. **Root cause, with evidence — not a hunch.**

**Step 3 · Attack**
> Design an experiment on the targeting spec, size it against the alternatives with impact–effort, run it, watch the goal metric. If revenue moves, the constraint was real. If it doesn't, back to Step 1 — and that's the method working, not failing.

- **section-cta:** `btn-rust` → the booking URL (`utm_content=example_cta`) — **Schedule a Call**

*(Optional entry-note line, in `.entry-note` style: "Every number here is illustrative — the point is the sequence, not the figures.")*

---

## 8. SETUP / HOW IT WORKS  `<section id="setup" class="bg-paper">`

Same `.steps` list structure as Pre-PMF.

- **section-eyebrow:** `Getting Started`
- **section-title:** `Connect it once, use it forever`
- **section-lead:** `Waya OS works with any AI assistant that supports MCP, like Claude. Connect it once and the Wayaframes show up as commands you can invoke any time. Free to connect — no payment, no seat.`
- **Steps:**
  1. **Add the MCP:** connect **Waya OS** (`pro-mcp.wayaframes.com/mcp`) as a custom connector in your assistant and sign in.
  2. **Aim:** run `/constraint-identification` to find the one thing actually blocking your goal — or `/a3-thinking` if you're not sure where to start.
  3. **Diagnose:** run `/gap-analysis` on the constraint to reach root causes you can defend.
  4. **Attack:** turn causes into tests with `/experiment-design`, rank them with `/impact-effort`, and run the loop.

*(If a short connect walkthrough exists for the Pre-PMF page, reuse its component here with the Waya OS name and URL.)*

---

## 9. CTA BAND + FAQ + FINAL CTA

### CTA band  `<section class="cta-band">`
- **h2:** `The number doesn't move by working harder. It moves by working on the right thing.`
- **p:** `Waya OS finds the one constraint that's actually in the way, gets to the root of why, and points you at the fix — inside the assistant you already use. Free to connect.`
- **button** `btn-pill-cream` → `#setup` — **Add Waya OS**

### FAQ  `<section id="faq" class="faq">`
- **section-eyebrow:** `Frequently Asked Questions`
- **section-title:** `Everything you need to know about Waya OS`
- Items (first one `open`), also mirrored into the FAQPage JSON-LD:

1. **What is Waya OS?** — It's a Waya MCP — a small server you connect to your AI assistant — that adds a set of Wayaframes: guided, step-by-step diagnostic frameworks the assistant runs with you. It helps you find the one constraint blocking your goal and get to the root of why it's stuck, instead of guessing from a blank chat.
2. **What is a Wayaframe?** — A facilitated framework that runs inside your AI assistant. Instead of a blank chat, the assistant walks you through a proven method — asking the right questions in the right order — and produces a real deliverable at the end: a validated constraint, a set of root causes, a ranked list of experiments.
3. **How is this different from the Pre-PMF MCP?** — The Pre-PMF MCP is for founders still searching for product-market fit — purpose, idea, first experiments. Waya OS is for operators with a real problem to solve: it diagnoses *where* the constraint is and *why* it's happening. Different job, same Waya method, one login across both.
4. **What's the difference between constraint identification and gap analysis?** — Constraint identification is the compass: of everything you could work on, which one thing actually blocks the goal? Gap analysis is the drill: given that thing, why is it happening? You point with one and dig with the other.
5. **Who is this for?** — Founders, operators, and leaders past the earliest stage — anyone whose improvement work isn't moving the main number, who's deciding where to spend scarce resources, or who needs a diagnosis that holds up later. It's domain-independent: ops, sales, hiring, support, finance, product.
6. **What does it cost?** — Waya OS is free to connect today — no payment and no seat. When you want a specialist to run the diagnosis with you, you can schedule a call.
7. **What do I need to run it?** — An AI assistant that supports MCP, such as Claude. Connect the Waya OS connector once and the Wayaframes become commands you can invoke any time.

### Final CTA  `<section id="book" class="final-cta">`
- **h2:** `Find the real constraint`
- **p:** `Connect Waya OS and run your first diagnosis today. When you want a specialist in the room, we're right here.`
- **button** `btn-rust` → `#setup` — **Add Waya OS**

---

## 10. Page-specific CSS

Keep the Pre-PMF page's `.cmd` and `.frames`/`.frame` blocks **as-is** (identical styling). Then:

- **Drop** the Pre-PMF pricing block: `.tiers`, `.tier`, `.tier-*`, `.btn-ghost-rust` — unless "Schedule a Call" reuses `.btn-ghost-rust` (it may; keep it if so).
- **Supporting frames (5b):** add a modifier, e.g. `.frame.supporting { background: var(--waya-paper); }` and render the 3-up row as its own `.frames.frames-3 { grid-template-columns: repeat(3,1fr); }`.
- **Diagnostic loop (§6):** reuse/rename the Pre-PMF `.weeks`/`.week` timeline as `.loop`/`.loop-step` — same card styling (cream card, rounded, `--shadow-1`), a rust step label (`Aim` / `Diagnose` / `Attack`) in the `.week-label .wk` style, and the `/command` chip inline. The green `.coaching` callout maps nicely to the *Output:* line — reuse `.coaching`/`.badge`/`.detail` (badge = "Output", detail = the deliverable).
- **Worked example (§7):** reuse the same `.week`-derived cards (`.example-step`), one per step, with the `.task` chips for the sub-points.
- Keep the `@media (max-width:720px)` collapse rules; extend them to `.frames-3` and `.loop`.

**No new colors, fonts, or shadows.** Everything comes from `styles.css` variables (`--waya-rust`, `--waya-sage`, `--waya-cream`, `--waya-paper`, `--waya-charcoal`, `--waya-ink`, `--waya-mint`, `--border-1`, `--shadow-1/3`, `--font-display`, `--font-body`).

---

## 11. Build notes & open questions

1. **`/constraint-identification` is not yet in the served pro deck.** The live Waya OS (pro) deck currently serves `gap-analysis`, `experiment-design`, `impact-effort`, and `a3-thinking` (per `README.md` / `content-moves/`). Constraint identification exists as a Waya *skill* but hasn't been cut into a content-moves method for the MCP. **Decision needed:** ship the page ahead of the framework (and gate the `/constraint-identification` CTA/copy until it lands), or hold the page until the method is added to the deck. The page copy leads with it as requested — flag this so marketing and product stay in sync.
2. **Page path.** Proposed `/waya-os-mcp/`. Alternatives: `/pro-mcp/` (matches the internal "pro" name and the `pro-mcp.` subdomain) or `/waya-os/`. Pick one and set canonical + nav + footer + UTMs to match.
3. **Connector name shown to users** is **Waya OS** (not "Pro" or "Waya Pro OS," which is the internal WorkOS app name). Use "Waya OS" in all user-facing copy; reserve "pro deck" for internal notes.
4. **No pricing / no tiers** by decision. If a paid tier or the specialist engagement later gets a price, the Pre-PMF `.tiers` block is the ready-made pattern to drop back in.
5. **Booking link:** reuse the Pre-PMF LeadConnector URL (`https://api.leadconnectorhq.com/widget/bookings/waya-consultation`) with `utm_source=waya-os-mcp` and a per-placement `utm_content`.
6. **Hero + challenge art:** needs an operational/diagnostic image distinct from the Pre-PMF mountain. Placeholder assets referenced until chosen.
7. **Voice:** grounded operator tone — no hype, short declaratives, "aim before you fire." Matches the Pre-PMF page and Waya's house voice.
