/* Case results and "Solutions" groups: the one source the proof components read.
   Every number here is copied from the case study pages; change both together.
   headline/metrics: before/after are numbers for charts (null when a value is not numeric),
   fmtBefore/fmtAfter are the text to show, better says which direction is an improvement. */
window.WAYA_CASES = {
  "ap-automation-margin": {
    url: "/case-studies/ap-automation-margin/",
    title: "From 20% to 70% gross margin",
    kicker: "Restaurant AP automation",
    company: null,
    industry: "Restaurant software",
    method: "Continuous improvement",
    summary: "We built invoice extraction into the app and moved from batches to one invoice at a time.",
    timeframe: "March to October 2016",
    chart: { label: "Gross margin", axis: "Gross margin (%)", before: 20, after: 70, unit: "%", fmtBefore: "~20%", fmtAfter: "~70%", better: "up", xBefore: "Mar 2016", xAfter: "Oct 2016" },
    headline: { label: "Gross margin", before: 20, after: 70, unit: "%", fmtBefore: "~20%", fmtAfter: "~70%", better: "up" },
    metrics: [
      { label: "Invoice with line items, all-in", before: 3.34, after: 0.97, unit: "$", fmtBefore: "$3.34", fmtAfter: "$0.97", better: "down" },
      { label: "Line-item turnaround", before: 1440, after: 30, unit: "min", fmtBefore: "24 hours", fmtAfter: "under 30 minutes", better: "down" }
    ]
  },
  "warehouse-quality": {
    url: "/case-studies/warehouse-quality/",
    title: "Better quality with fewer QC staff",
    kicker: "Cheetah · Warehouse",
    company: "Cheetah",
    industry: "Food distribution",
    method: "Kaizen, A3",
    summary: "We tracked each picker's accuracy and checked only 1 in 10 carts for the most reliable pickers.",
    timeframe: null,
    chart: { label: "QC staff per 100 orders", axis: "QC staff per 100 orders (FTEs)", before: 7, after: 2, unit: "FTE", fmtBefore: "7 FTEs", fmtAfter: "2 FTEs", better: "down", xBefore: "Before", xAfter: "After" },
    headline: { label: "Carts with a picking error", before: 72, after: 10, unit: "%", fmtBefore: "~72%", fmtAfter: "~10%", better: "down" },
    metrics: [
      { label: "Gross margin", before: 10, after: 22.5, unit: "%", fmtBefore: "~10%", fmtAfter: "20–25%", better: "up" },
      { label: "QC staff per 100 orders", before: 7, after: 2, unit: "FTE", fmtBefore: "7 FTEs", fmtAfter: "2 FTEs", better: "down" }
    ]
  },
  "post-acquisition-turnaround": {
    url: "/case-studies/post-acquisition-turnaround/",
    title: "A post-acquisition operations turnaround",
    kicker: "Cheetah · M&A",
    company: "Cheetah",
    industry: "Food distribution",
    method: "A3, gap analysis",
    summary: "We found the warehouse system was never updated for the new racking, and rebuilt it while triaging by hand.",
    timeframe: "To October 2023",
    chart: { label: "Shrink", axis: "Shrink (%)", before: 18, after: 2, unit: "%", fmtBefore: "~17–18%", fmtAfter: "~2%", better: "down", xBefore: "After go-live", xAfter: "After the fix" },
    headline: { label: "Contribution margin", before: -1000, after: null, unit: "$K/mo", fmtBefore: "~$1M/mo burn", fmtAfter: "Profitable", better: "up" },
    metrics: [
      { label: "Shrink", before: 18, after: 2, unit: "%", fmtBefore: "~17–18%", fmtAfter: "~2%", better: "down" },
      { label: "Fill rate", before: 75, after: 99, unit: "%", fmtBefore: "~75%", fmtAfter: "99%+", better: "up" }
    ]
  },
  "cash-float": {
    url: "/case-studies/cash-float/",
    title: "Cutting the cash float 90%",
    kicker: "Cheetah · Finance",
    company: "Cheetah",
    industry: "Food distribution",
    method: "Gap analysis",
    summary: "We linked each customer payment to its supplier invoice, so the supplier was paid straight from it.",
    timeframe: null,
    chart: { label: "Cash fronted for product", axis: "Product cost fronted (%)", before: 100, after: 8, unit: "%", fmtBefore: "~100%", fmtAfter: "~8%", better: "down", xBefore: "Before", xAfter: "After" },
    headline: { label: "Cash fronted for product", before: 100, after: 8, unit: "%", fmtBefore: "~100%", fmtAfter: "~8%", better: "down" },
    metrics: [
      { label: "Working capital freed", before: null, after: 1, unit: "$M", fmtBefore: "", fmtAfter: "~$1M", better: "up" },
      { label: "Delivery to cash", before: 3.5, after: 2, unit: "days", fmtBefore: "3–4 days", fmtAfter: "1–3 days", better: "down" }
    ]
  },
  "planning-okrs": {
    url: "/case-studies/planning-okrs/",
    title: "Cutting seven goals to three",
    kicker: "14-person startup · Planning",
    company: null,
    industry: "Software",
    method: "Annual and quarterly planning",
    summary: "We cut seven unranked goals to three objectives set on the real bottleneck.",
    timeframe: null,
    chart: { label: "Company goals", axis: "Company goals (count)", before: 7, after: 3, unit: "goals", fmtBefore: "6–7 unranked", fmtAfter: "3 objectives", better: "down", xBefore: "Before the offsite", xAfter: "After" },
    headline: { label: "Company goals", before: 7, after: 3, unit: "goals", fmtBefore: "6–7 unranked", fmtAfter: "3 objectives", better: "down" },
    metrics: [
      { label: "ARR, as the company went on to grow", before: 7.3, after: 10, unit: "$M", fmtBefore: "$7.3M", fmtAfter: "~$10M", better: "up" },
      { label: "Team", before: 14, after: 24, unit: "people", fmtBefore: "14 people", fmtAfter: "24 people", better: "up" }
    ]
  },
  "sole-supplier": {
    url: "/case-studies/sole-supplier/",
    title: "Replacing a sole supplier in 14 months",
    kicker: "Cheetah · Supply chain",
    company: "Cheetah",
    industry: "Food distribution",
    method: "Kaikaku, scenario planning",
    summary: "We built the company's own warehouse and direct sourcing in 14 months, while the old business kept running.",
    timeframe: "14 months from July 2018",
    chart: { label: "Annualized revenue", axis: "Revenue ($M)", before: 75, after: 155, unit: "$M", fmtBefore: "~$75M", fmtAfter: "~$155M", better: "up", xBefore: "Jul 2018", xAfter: "14 months later" },
    headline: { label: "Time to rebuild the supply chain", before: null, after: 14, unit: "months", fmtBefore: "", fmtAfter: "14 months", better: "down" },
    metrics: [
      { label: "Revenue during the transition", before: 75, after: 155, unit: "$M", fmtBefore: "~$75M", fmtAfter: "~$155M", better: "up" },
      { label: "Supply model", before: null, after: null, unit: "", fmtBefore: "One supplier", fmtAfter: "Owned warehouses, direct sourcing", better: "up" }
    ]
  },
  "customer-support": {
    url: "/case-studies/customer-support/",
    title: "From a 22-hour to a 6-minute support response",
    kicker: "Cheetah · Support",
    company: "Cheetah",
    industry: "Food distribution",
    method: "A3, SIPOC",
    summary: "We built in-app ticket intake that routes each request to the right person automatically.",
    timeframe: null,
    chart: { label: "First response", axis: "First response time (hours)", before: 22, after: 0.1, unit: "hours", fmtBefore: "22 hours", fmtAfter: "6 minutes", better: "down", xBefore: "Before", xAfter: "After" },
    headline: { label: "First response", before: 1320, after: 6, unit: "min", fmtBefore: "22 hours", fmtAfter: "6 minutes", better: "down" },
    metrics: [
      { label: "Tickets assigned correctly, automatically", before: 10, after: 95, unit: "%", fmtBefore: "10%", fmtAfter: "95%", better: "up" },
      { label: "Tickets submitted in the app", before: 10, after: 70, unit: "%", fmtBefore: "10%", fmtAfter: "70%", better: "up" }
    ]
  },
  "hospital-patient-wait": {
    url: "/case-studies/hospital-patient-wait/",
    title: "Cutting a 5-month patient wait to 2",
    kicker: "Hospital · GI suite",
    company: null,
    industry: "Healthcare",
    method: "Kaizen",
    summary: "We sped up room changeover and fixed pre-op readiness so the next patient was ready on time.",
    timeframe: null,
    chart: { label: "Referral to procedure wait", axis: "Wait (months)", before: 5, after: 2, unit: "months", fmtBefore: "5 months", fmtAfter: "2 months", better: "down", xBefore: "Before", xAfter: "After" },
    headline: { label: "Referral to procedure wait", before: 5, after: 2, unit: "months", fmtBefore: "5 months", fmtAfter: "2 months", better: "down" },
    metrics: [
      { label: "Room turnover", before: 29, after: 23.7, unit: "min", fmtBefore: "29 min", fmtAfter: "23.7 min", better: "down" },
      { label: "Procedures per room per day", before: 10.4, after: 11.4, unit: "procedures", fmtBefore: "10.4", fmtAfter: "11.4", better: "up" }
    ]
  }
};

window.WAYA_GROUPS = {
  "margins-and-cash": {
    title: "Margins and Cash",
    url: "/solutions/margins-and-cash/",
    hook: "Revenue is up. Margin isn't, and cash is tied up in the work.",
    promise: "Find where margin and cash leak out of the operation, fix the cause, and keep the gain.",
    steps: [
      { title: "Measure the gap", method: "Gap analysis", seen: ["ap-automation-margin", "cash-float"], text: "Put a cost on every step and a number on the cash tied up, against where you need to be." },
      { title: "Find the cause on the floor", method: "A3, root cause analysis", seen: ["ap-automation-margin", "warehouse-quality"], text: "Walk the real process: double entry, inspecting every cart, paying suppliers before customers pay you." },
      { title: "Build the fix into the system", method: "Kaizen, standard work", seen: ["warehouse-quality", "ap-automation-margin"], text: "Change the process and the software together, then keep the metric visible so the gain holds." }
    ],
    cases: ["ap-automation-margin", "warehouse-quality", "cash-float"],
    bridge: "The methods behind these results (measuring the gap, finding the cause on the floor, and building the fix into the system) are what we run with you in 4 Weeks to Higher Margins. You work on your own margin problem alongside operators who have done it, and Lean AI keeps the method running after the four weeks end.",
    program: { name: "4 Weeks to Higher Margins", url: "/lean-ai/cohort/" },
    root: "ops-intro-call"
  },
  "scaling-through-change": {
    title: "Scaling Through Change",
    url: "/solutions/scaling-through-change/",
    hook: "An acquisition, a lost supplier, or a growth plan with seven priorities. The business still has to run.",
    promise: "Keep the company running while the plan changes underneath it.",
    steps: [
      { title: "Separate the symptom from the cause", method: "Gap analysis", seen: ["post-acquisition-turnaround"], text: "Gap analysis before blame: find what is actually breaking, not who." },
      { title: "Design the target, then work back", method: "Kaikaku, scenario planning", seen: ["sole-supplier"], text: "Plan for the futures you might face and turn each gap into something to build." },
      { title: "Run the fix and the business together", method: "A3, planning cadence", seen: ["post-acquisition-turnaround", "planning-okrs"], text: "Triage by hand while the real fix lands, then set a cadence the team keeps after we leave." }
    ],
    cases: ["post-acquisition-turnaround", "sole-supplier", "planning-okrs"],
    bridge: "It starts with a Hoshin workshop to agree on the few goals that matter, then 3–6 months of embedded implementation alongside your team, so the fix and the business run together.",
    program: { name: "Scale Up Program", url: "/scale-up-program/" },
    root: "waya-consultation"
  },
  "faster-service": {
    title: "Faster Service",
    url: "/solutions/faster-service/",
    hook: "Customers wait hours for an answer. Patients wait months for a procedure.",
    promise: "Cut the time between someone asking and your team delivering.",
    steps: [
      { title: "Map the flow, role by role", method: "SIPOC, process mapping", seen: ["customer-support", "hospital-patient-wait"], text: "Every channel, every handoff, every place a request waits." },
      { title: "Find what stops the next case from starting", method: "5 Whys", seen: ["hospital-patient-wait", "customer-support"], text: "Ask why until you reach the cause: no front door, no data, no one ready." },
      { title: "Standardize the fast path", method: "Standard work, self-service", seen: ["customer-support", "hospital-patient-wait"], text: "Self-service and routing for the common cases, people for the ones that need judgment." }
    ],
    cases: ["customer-support", "hospital-patient-wait"],
    bridge: "The Operations Audit is where we start this work with you: a one-hour deep dive into the constraint holding your operation back, a written report on how to fix it, and three WayaFrames to start on it right away. If you want help putting it into practice, the Scale Up Program picks up from there.",
    program: { name: "Operations Audit", url: "/operations-audit/" },
    root: "ops-intro-call"
  }
};
