/* Case results and case study groups: the one source the proof components read.
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
    method: "A3, root cause analysis",
    summary: "We built invoice extraction into the app and moved from batches to one invoice at a time.",
    timeframe: "March to October 2016",
    chart: { label: "Gross margin", axis: "Gross margin (%)", before: 20, after: 70, unit: "%", fmtBefore: "~20%", fmtAfter: "~70%", better: "up", xBefore: "Mar 2016", xAfter: "Oct 2016" },
    story: {
      "problem": "An invoice with line items cost $3.34 to process, all of what it brought in. Gross margin sat near 20%.",
      "diagnosis": "Every line item was typed by hand, twice, then checked line by line. Invoices waited in batches, and only one person on one shift could verify them.",
      "fixes": [
        "Built extraction into the app, so a processor typed 3 fields instead of a whole invoice",
        "Moved from batches to one invoice at a time, first in, first out",
        "Trained the night shift to verify, so two shifts worked the queue"
      ],
      "results": [
        {
          "label": "Invoice with line items, all-in",
          "fmtBefore": "$3.34",
          "fmtAfter": "$0.97"
        },
        {
          "label": "Line-item turnaround",
          "fmtBefore": "24 hours",
          "fmtAfter": "under 30 minutes"
        }
      ]
    },
    video: {
      "src": "/assets/video/restaurant-ap-margin.mp4",
      "poster": "/assets/video/restaurant-ap-margin-poster.jpg",
      "portrait": "/assets/video/restaurant-ap-margin-portrait.mp4",
      "portraitPoster": "/assets/video/restaurant-ap-margin-portrait-poster.jpg",
      "duration": "1:14",
      "caption": "Watch how margin went from 20% to 70%"
    },
    headline: { label: "Gross margin", before: 20, after: 70, unit: "%", fmtBefore: "~20%", fmtAfter: "~70%", better: "up" },
    metrics: [
      { label: "Invoice with line items, all-in", before: 3.34, after: 0.97, unit: "$", fmtBefore: "$3.34", fmtAfter: "$0.97", better: "down" },
      { label: "Line-item turnaround", before: 1440, after: 30, unit: "min", fmtBefore: "24 hours", fmtAfter: "under 30 minutes", better: "down" }
    ]
  },
  "warehouse-quality": {
    url: "/case-studies/warehouse-quality/",
    title: "Margin up 15 points, with better quality",
    kicker: "Cheetah · Warehouse",
    company: "Cheetah",
    industry: "Food distribution",
    method: "A3, Kaizen",
    summary: "We tracked each picker's accuracy and checked only 1 in 10 carts for the most reliable pickers.",
    timeframe: null,
    chart: { label: "Gross margin", axis: "Gross margin (%)", before: 10, after: 22.5, unit: "%", fmtBefore: "~10%", fmtAfter: "20–25%", better: "up", xBefore: "Before", xAfter: "After" },
    story: {
      "problem": "A manager checked every picked cart, item by item: about 13 minutes per order, and roughly 7 in 10 carts still had an error.",
      "diagnosis": "Quality was inspected at the end of the line instead of built into the pick. With no data on who was reliable, the only safe policy was to check everyone, every time.",
      "fixes": [
        "Tracked each picker's error rate and speed in the app",
        "Paid a bonus on both, earned only when a cart shipped clean",
        "Checked 1 in 10 carts for pickers under 1% errors, and put anyone who slipped back on full checks"
      ],
      "results": [
        {
          "label": "Carts with a picking error",
          "fmtBefore": "~72%",
          "fmtAfter": "~10%"
        },
        {
          "label": "Carts requiring QC",
          "fmtBefore": "100%",
          "fmtAfter": "30%"
        },
        {
          "label": "Gross margin",
          "fmtBefore": "~10%",
          "fmtAfter": "20–25%"
        }
      ]
    },
    video: {
      "src": "/assets/video/warehouse-quality-video.mp4",
      "poster": "/assets/video/warehouse-quality-video-poster.jpg",
      "portrait": "/assets/video/warehouse-quality-video-portrait.mp4",
      "portraitPoster": "/assets/video/warehouse-quality-video-portrait-poster.jpg",
      "duration": "1:57",
      "caption": "Watch how gross margin went from 10% to 20–25%"
    },
    headline: { label: "Gross margin", before: 10, after: 22.5, unit: "%", fmtBefore: "~10%", fmtAfter: "20–25%", better: "up" },
    metrics: [
      { label: "Carts with a picking error", before: 72, after: 10, unit: "%", fmtBefore: "~72%", fmtAfter: "~10%", better: "down" },
      { label: "Carts requiring QC", before: 100, after: 30, unit: "%", fmtBefore: "100%", fmtAfter: "30%", better: "down" }
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
    chart: { label: "Contribution margin", axis: "Monthly burn ($M)", before: 1, after: 0, unit: "$M", fmtBefore: "~$1M/mo burn", fmtAfter: "Profitable", better: "down", xBefore: "After go-live", xAfter: "Oct 2023" },
    story: {
      "problem": "After three acquisitions, fulfillment fell apart: fill rate near 75%, shrink at 17–18%, on-time delivery as low as 24%, and about $1M a month in contribution margin burned.",
      "diagnosis": "The warehouse had been rebuilt with new racking and hundreds of new locations, but the warehouse system's logic was never updated. The system undid the crews' work faster than they could clear it.",
      "fixes": [
        "Triaged by hand every day: cleared staging, replenished the top 1,000 items, one location per product",
        "Rebuilt the warehouse system's slotting for the new layout, so it consolidated stock instead of scattering it",
        "Added barcode checks across receiving, picking, loading and delivery, written into daily standard work"
      ],
      "results": [
        {
          "label": "Contribution margin",
          "fmtBefore": "~$1M/mo burn",
          "fmtAfter": "profitable (Oct 2023)"
        },
        {
          "label": "Fill rate",
          "fmtBefore": "~75%",
          "fmtAfter": "99%+"
        },
        {
          "label": "On-time delivery",
          "fmtBefore": "under 40%",
          "fmtAfter": "~90%+"
        }
      ]
    },
    video: {
      "src": "/assets/video/post-acquisition-turnaround-video-skill.mp4",
      "poster": "/assets/video/post-acquisition-turnaround-video-skill-poster.jpg",
      "duration": "1:26",
      "caption": "Watch how a $1M monthly burn became a profitable operation"
    },
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
    method: "A3, gap analysis",
    summary: "We linked each customer payment to its supplier invoice, so the supplier was paid straight from it.",
    timeframe: null,
    chart: { label: "Cash fronted for product", axis: "Product cost fronted (%)", before: 100, after: 8, unit: "%", fmtBefore: "~100%", fmtAfter: "~8%", better: "down", xBefore: "Before", xAfter: "After" },
    story: {
      "problem": "The company paid its supplier almost at once but was paid by customers 3–4 days later, fronting the cash on about 70% of revenue. A $200K supplier credit line capped growth.",
      "diagnosis": "Supplier payments weren't linked to customer billing. The data to link them already existed; nothing connected it.",
      "fixes": [
        "Split each payment at delivery: the product share went straight to the supplier, matched to its invoice",
        "Gave the supplier a portal showing each payout against its invoices, to the cent",
        "Reconciled monthly and automated every mismatch away"
      ],
      "results": [
        {
          "label": "Working capital freed",
          "fmtBefore": "",
          "fmtAfter": "~$1M"
        },
        {
          "label": "Supplier line of credit",
          "fmtBefore": "$200K, maxed out",
          "fmtAfter": "no longer needed"
        },
        {
          "label": "Delivery to cash",
          "fmtBefore": "3–4 days",
          "fmtAfter": "1–3 days"
        }
      ]
    },
    video: {
      "src": "/assets/video/cash-float-video.mp4",
      "poster": "/assets/video/cash-float-video-poster.jpg",
      "portrait": "/assets/video/cash-float-video-portrait.mp4",
      "portraitPoster": "/assets/video/cash-float-video-portrait-poster.jpg",
      "duration": "1:49",
      "caption": "Watch how the cash float fell 90%"
    },
    headline: { label: "Cash fronted for product", before: 100, after: 8, unit: "%", fmtBefore: "~100%", fmtAfter: "~8%", better: "down" },
    metrics: [
      { label: "Working capital freed", before: null, after: 1, unit: "$M", fmtBefore: "", fmtAfter: "~$1M", better: "up" },
      { label: "Delivery to cash", before: 3.5, after: 2, unit: "days", fmtBefore: "3–4 days", fmtAfter: "1–3 days", better: "down" }
    ]
  },
  "planning-okrs": {
    url: "/case-studies/planning-okrs/",
    title: "ARR increased from $7.3M to $10M",
    kicker: "14-person startup · Planning",
    company: null,
    industry: "Software",
    method: "Annual and quarterly planning",
    summary: "We cut seven unranked goals to three objectives set on the real bottleneck.",
    timeframe: null,
    chart: { label: "ARR", axis: "ARR ($M)", before: 7.3, after: 10, unit: "$M", fmtBefore: "$7.3M", fmtAfter: "~$10M", better: "up", xBefore: "Before the offsite", xAfter: "End of Q1" },
    story: {
      "problem": "The company planned to triple revenue, but the CEO's goals were six or seven, unranked, and the team named prioritization as its top blocker.",
      "diagnosis": "The goals lived in one person's head, so each function worked toward a different one and \"urgent\" was the only signal.",
      "fixes": [
        "Ran a four-day offsite that opened with the team's own survey answers",
        "Cut seven goals to three, all set on the real bottleneck: collections",
        "Turned \"test 10–30 agents\" into three agent workflows: deal desk, close, and collect"
      ],
      "results": [
        {
          "label": "ARR",
          "fmtBefore": "$7.3M",
          "fmtAfter": "~$10M by end of Q1"
        },
        {
          "label": "Company goals",
          "fmtBefore": "6–7 unranked",
          "fmtAfter": "3 objectives, 17 key results"
        },
        {
          "label": "Team",
          "fmtBefore": "14 people",
          "fmtAfter": "24 people"
        }
      ]
    },
    headline: { label: "ARR", before: 7.3, after: 10, unit: "$M", fmtBefore: "$7.3M", fmtAfter: "~$10M", better: "up" },
    metrics: [
      { label: "Company goals", before: 7, after: 3, unit: "goals", fmtBefore: "6–7 unranked", fmtAfter: "3 objectives", better: "down" },
      { label: "Team", before: 14, after: 24, unit: "people", fmtBefore: "14 people", fmtAfter: "24 people", better: "up" }
    ]
  },
  "sole-supplier": {
    url: "/case-studies/sole-supplier/",
    title: "Replacing a sole supplier in 14 months",
    kicker: "Cheetah · Supply chain",
    company: "Cheetah",
    industry: "Food distribution",
    method: "A3, Kaikaku, scenario planning",
    summary: "We built the company's own warehouse and direct sourcing in 14 months, while the old business kept running.",
    timeframe: "14 months from July 2018",
    chart: { label: "Revenue through its own warehouse", axis: "Annualized revenue ($M)", before: 75, after: 155, unit: "$M", fmtBefore: "0% of ~$75M", fmtAfter: "100% of ~$155M", better: "up", xBefore: "Jul 2018", xAfter: "14 months later" },
    story: {
      "problem": "The whole business ran on one supplier. In July 2018, at about $75M in annualized revenue, that supplier said the partnership no longer worked.",
      "diagnosis": "Getting better at buying from the supplier couldn't fix depending on it. The system itself was the constraint, so it needed a redesign, not small improvements.",
      "fixes": [
        "Designed the new supply chain backward from the target state, across five scenarios",
        "Turned a seven-flows gap analysis into a build list: pricing, 2,800 SKUs, a warehouse, a 35-person crew",
        "Ran it as a separate team and tested it with a worst-case drill before go-live"
      ],
      "results": [
        {
          "label": "Revenue through its own warehouse",
          "fmtBefore": "0% of ~$75M",
          "fmtAfter": "100% of ~$155M"
        },
        {
          "label": "Time to rebuild",
          "fmtBefore": "",
          "fmtAfter": "14 months"
        },
        {
          "label": "Supply model",
          "fmtBefore": "One supplier",
          "fmtAfter": "owned warehouses and direct sourcing"
        }
      ]
    },
    headline: { label: "Revenue through its own warehouse", before: 0, after: 155, unit: "$M", fmtBefore: "0% of ~$75M", fmtAfter: "100% of ~$155M", better: "up" },
    metrics: [
      { label: "Time to rebuild the supply chain", before: null, after: 14, unit: "months", fmtBefore: "", fmtAfter: "14 months", better: "down" },
      { label: "Supply model", before: null, after: null, unit: "", fmtBefore: "One supplier", fmtAfter: "Owned warehouses, direct sourcing", better: "up" }
    ]
  },
  "customer-support": {
    url: "/case-studies/customer-support/",
    title: "From a 22-hour to a 6-minute support response",
    kicker: "Cheetah · Support",
    company: "Cheetah",
    industry: "Food distribution",
    method: "A3, SIPOC, 5 Whys",
    summary: "We built in-app ticket intake that routes each request to the right person automatically.",
    timeframe: null,
    chart: { label: "First response", axis: "First response time (hours)", before: 22, after: 0.1, unit: "hours", fmtBefore: "22 hours", fmtAfter: "6 minutes", better: "down", xBefore: "Before", xAfter: "After" },
    story: {
      "problem": "First response to a support ticket averaged 22 hours. Requests came in over five disconnected channels, and about half were resolved outside any system.",
      "diagnosis": "There was no structured front door. A person had to read, sort and route every message, and the most common questions had no self-service path.",
      "fixes": [
        "In-app intake: the customer picks the order and the issue, which creates a tagged ticket",
        "Automatic routing to the right agent, with every channel feeding one system",
        "Self-service for invoices, credits, returns and truck location, and agents allowed to approve small credits"
      ],
      "results": [
        {
          "label": "First response",
          "fmtBefore": "22 hours",
          "fmtAfter": "6 minutes"
        },
        {
          "label": "Tickets assigned correctly, automatically",
          "fmtBefore": "10%",
          "fmtAfter": "95%"
        },
        {
          "label": "Tickets submitted in the app",
          "fmtBefore": "10%",
          "fmtAfter": "70%"
        }
      ]
    },
    video: {
      "src": "/assets/video/customer-support-video.mp4",
      "poster": "/assets/video/customer-support-video-poster.jpg",
      "portrait": "/assets/video/customer-support-video-portrait.mp4",
      "portraitPoster": "/assets/video/customer-support-video-portrait-poster.jpg",
      "duration": "1:49",
      "caption": "Watch how first response went from 22 hours to 6 minutes"
    },
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
    method: "A3, Kaizen, 5 Whys",
    summary: "We sped up room changeover and fixed pre-op readiness so the next patient was ready on time.",
    timeframe: null,
    chart: { label: "Referral to procedure wait", axis: "Wait (months)", before: 5, after: 2, unit: "months", fmtBefore: "5 months", fmtAfter: "2 months", better: "down", xBefore: "Before", xAfter: "After" },
    story: {
      "problem": "A two-room GI suite took about 29 minutes to turn a room over, capping each room near 10 procedures a day while more than 560 patients waited up to five months.",
      "diagnosis": "Changeover was only part of it. Often the next case couldn't start because the physician was elsewhere or the next patient wasn't ready.",
      "fixes": [
        "Standard work for room turnover, with supplies staged where each step needs them",
        "A standard GI order set and recovery protocol in the records system",
        "Pre-op readiness: IV placement priority, prep and fasting screening, a cleaner handoff"
      ],
      "results": [
        {
          "label": "Referral to procedure wait",
          "fmtBefore": "5 months",
          "fmtAfter": "2 months (target was 3)"
        },
        {
          "label": "Room turnover",
          "fmtBefore": "29 min",
          "fmtAfter": "23.7 min"
        },
        {
          "label": "Procedures per room per day",
          "fmtBefore": "10.4",
          "fmtAfter": "11.4"
        }
      ]
    },
    video: {
      "src": "/assets/video/hospital-patient-wait-video.mp4",
      "poster": "/assets/video/hospital-patient-wait-video-poster.jpg",
      "portrait": "/assets/video/hospital-patient-wait-video-portrait.mp4",
      "portraitPoster": "/assets/video/hospital-patient-wait-video-portrait-poster.jpg",
      "duration": "1:50",
      "caption": "Watch how the patient wait went from 5 months to 2"
    },
    headline: { label: "Referral to procedure wait", before: 5, after: 2, unit: "months", fmtBefore: "5 months", fmtAfter: "2 months", better: "down" },
    metrics: [
      { label: "Room turnover", before: 29, after: 23.7, unit: "min", fmtBefore: "29 min", fmtAfter: "23.7 min", better: "down" },
      { label: "Procedures per room per day", before: 10.4, after: 11.4, unit: "procedures", fmtBefore: "10.4", fmtAfter: "11.4", better: "up" }
    ]
  }
};

window.WAYA_GROUPS = {
  "margins-and-cash": {
    title: "Improving Margins",
    url: "/case-studies/improving-margins/",
    hook: "Revenue is up. Margin isn't, and cash is tied up in the work.",
    promise: "Find where margin and cash leak out of the operation, fix the cause, and keep the gain.",
    promiseLines: ["Find where margin and cash leak out of the operation,", "fix the cause,", "and keep the gain."],
    programLabel: "the 8 Weeks to Higher Margins program",
    methods: "A3 thinking, gap analysis, root cause analysis, Kaizen",
    cases: ["ap-automation-margin", "warehouse-quality", "cash-float"],
    bridge: "The method behind these results, A3 thinking from the problem to the fix, is what we run with you in the 8 Weeks to Higher Margins program. A Waya expert guides you through your own margin problem while you learn alongside other operators doing the same.\n\nLean AI keeps the method running after the eight weeks end.",
    program: { name: "8 Weeks to Higher Margins", url: "/lean-ai/cohort/" },
    root: "ops-intro-call"
  },
  "scaling-through-change": {
    title: "Scaling",
    url: "/case-studies/scaling/",
    hook: "An acquisition, a lost supplier, or a growth plan with seven priorities. The business still has to run.",
    promise: "Keep the company running while the plan changes underneath it.",
    programLabel: "the Scale Up Program",
    methods: "A3 thinking, gap analysis, Kaikaku, scenario planning, annual and quarterly planning",
    cases: ["post-acquisition-turnaround", "sole-supplier", "planning-okrs"],
    bridge: "It starts with a Hoshin workshop to agree on the few goals that matter, then 3–6 months of embedded implementation alongside your team, so the fix and the business run together.",
    program: { name: "Scale Up Program", url: "/scale-up-program/" },
    root: "waya-consultation"
  },
  "faster-service": {
    title: "Improving Customer Outcomes",
    url: "/case-studies/improving-customer-outcomes/",
    hook: "Customers wait hours for an answer. Patients wait months for a procedure.",
    promise: "Cut the time between someone asking and your team delivering.",
    programLabel: "the Scale Up Program",
    methods: "A3 thinking, SIPOC, 5 Whys, Kaizen",
    cases: ["customer-support", "hospital-patient-wait"],
    bridge: "Both of these cases took months of work inside the operation. That is what the Scale Up Program is: 3–6 months of embedded implementation alongside your team, so the fix and the business run together.",
    program: { name: "Scale Up Program", url: "/scale-up-program/" },
    root: "ops-intro-call"
  }
};
