# Facts — post-acquisition turnaround

Sources:
- **[DOC]** Google Doc "Waya_CaseStudy_MA-Turnaround.docx" (https://docs.google.com/document/d/1pOsYBva_5xeRjSHv6b7STPPPOYpo37hu/edit), two parts: the case study and "The Story" told by Vince.
- **[PAGE]** `case-studies/post-acquisition-turnaround/index.html` (staging), the page the video will live on.
- **[ABOUT]** `about-us/index.html`.

The script may only state what this file supports. Anything else is invented and must be flagged.

## Site constraints
- "Company names are withheld." [PAGE] → never say or show the client's name (the doc names it; the video does not). Describe it as "a food distributor" / "a venture-backed food-distribution startup" [DOC].
- Page eyebrow: "Case Study · Food distribution · A3, gap analysis". Headline: "A post-acquisition operations turnaround"; deck: "From about $1M a month in contribution margin burn to profitable." [PAGE]
- Methods named on the site: A3, gap analysis. [PAGE]
- CTA on the page: "Schedule a Call" / "See Lean AI" ("run the same methods yourself with Lean AI"). [PAGE]

## People
- Vince = Vincent Matranga, Waya co-founder; Lean process optimization, Toyota Production Systems trained; previously co-founded the company in the case (named on About page, withheld here). [ABOUT]
- The story is "told by Vince", fall 2022. [DOC]
- Vince took over as COO and ran it "command and control". [DOC]
- Na'ama (Waya co-founder) slept at the warehouse; 16-hour days. [DOC]

## Timeline and context [DOC]
- September 2022: the company had just bought three regional food distributors, about $24M in revenue between them.
- Pre-pandemic the company was at $150M in sales; ~$30M at the time; needed volume for the warehouse.
- New ops leadership ran the integration; tore out aisles, put up narrow-aisle racking for the acquired products. Goal: a profitable building by Q1 2023.
- Sept 29: co-founder flags the racking feels off; racking not finished.
- Go-live October 2022. "Day one, it all hits the fan": numbers crater, customers yelling at CS and sales, orders short, trucks late.
- 100+ pallets of fresh food with zero tracking, rotting, found out back.
- A box of frozen pizza dough sat in the dry warehouse so long the yeast woke up and it puffed up "like a hot air balloon".
- Customers got 3 of every 4 items they ordered.
- Vince forklifted close to a million dollars of food into dumpsters, two a day.
- Churn wiped out about as much revenue as two of the three acquired companies brought; net gain only the third, ~$8M.
- October 22: Vince finds the root cause "in a few hours".

## The problem (numbers) [PAGE][DOC]
- Fill rate ~75%.
- Shrink 17–18% for the month; 28% in one week; full pallets of food thrown out.
- On-time delivery as low as 24% (under 40%).
- ~22% of orders shipped with an error; defects peaked above 20,000 PPM [DOC only].
- Physical count: errors in 90% of storage locations.
- Nightly replenishment jobs ~70 → over 300.
- Burning ~$1M a month in contribution margin.

## Root cause [PAGE][DOC]
- Tempting to blame the crews; gap analysis found something more precise.
- Warehouse physically rebuilt: new racking, new freezer, hundreds of new locations. WMS logic never updated.
- Old locations kept old rules (old aisles still in the system after being torn down [DOC]); new ones had none; many had no dimensions.
- Replenishment sent product to slots too small; left others empty; scattered single SKUs across as many as 886 locations.
- "The system recreated the mess faster than crews could clear it." / "The crews fix the building by day and the system undoes it by night." [DOC]
- No full (wall-to-wall) inventory count of the acquired businesses → counts not trusted, product double-bought.

## What we did — two tracks, at once, "because neither worked alone" [PAGE]
- Track one, stop the bleeding by hand: daily triage — clear staging lanes and trailers, replenish the top 1,000 items, consolidate each SKU to one location, cycle-count by aisle; corporate staff trained and on the floor. Execs, sales, engineers and supply chain cycle counting in a freezer [DOC].
- Track two, fix the cause: rebuild the WMS into a hybrid slotting model (fixed locations for fast movers, dynamic slots for the rest); re-zone to the new racking; consolidation logic instead of scattering.
- Then: barcode scanning with QA hard-stops across receiving, picking, loading, delivery; written into daily standard work "so it survives the next reorg".

## Results [PAGE][DOC]
- Contribution margin: ~$1M/mo burn → ~$260K/mo (Mar 2023) → profitable (Oct 2023).
  (Doc table says "~$260K (Mar 2023)"; story says "$260K by March". The page writes "~$260K/mo"; it is the burn reduced to $260K — say "burn down to about $260K a month by March".)
- Shrink ~17–18% (peak ~28%) → ~2%.
- Fill rate ~75% → 99%+ (by March 2023 [DOC story]).
- On-time delivery under 40% (as low as 24%) → ~90%+.
- Orders with an error ~22% → ~3% (through 2024 [DOC]).
- Softer side: floor operators watched the whole company show up in the freezer next to them; "Sales never fully trusts ops again." [DOC]

## The Waya lens [PAGE]
- In a fulfillment crisis, the instinct is to add labor or assign blame. Here the root cause was system logic undoing the crews' work. Separate the symptom from the cause, run manual triage and the systemic fix at the same time, then standardize the fix so it survives the next reorg.

## Proper nouns the voice may say
- Waya (WEIGH-ya, respelled "Wayya"), Na'ama (NAH-AH-MAH, "Nah-ah-mah") — in pronunciations.json.
- Vince — plain English, no respelling needed.
- WMS — say "warehouse system" / "warehouse management system", not the acronym.
