# Legal notice surfaces

Every place a legal notice, link or promise appears on or around wayaframes.com, and when it was last checked. `scripts/check_legal.py` reads this file: it confirms every `snippet:<id>` exists in `_data/legal.json`, and it flags any "Last checked" date older than 90 days or a surface never checked.

The wording of the pages is the HTML in `privacy-policy/`, `terms-of-service/`, `data-handling/` and `support/`. The short notices pasted into other tools are the snippets in `_data/legal.json`.

**How to use it.** When a page, a snippet or a promise changes, work down the rows that mention it, fix each surface, and put today's date (YYYY-MM-DD) in "Last checked". A surface nobody has looked at says "not yet checked". Check every row once a quarter. Run `python scripts/check_legal.py` before you merge.

Keep this file factual. Open questions, gaps and ticket numbers go in the private ticket board, not here: this repo is public.

## Website

| Surface | What it carries | Notice | Last checked |
|---|---|---|---|
| The four legal pages | The wording itself | n/a | 2026-10-22 |
| Footer on every page | Links to Privacy Policy, Terms, How We Handle Your Data, Support (`check_legal.py` checks all pages) | n/a | 2026-10-22 |
| Embedded setup app, `lean-ai/setup/app/` | No footer. A tool loaded in an iframe on `lean-ai/setup/`, which has the footer | n/a | 2026-10-22 |
| `sitemap.xml` and `llms.txt` | The four page URLs and dates | n/a | 2026-10-22 |
| Cookie banner, `assets/analytics.js` | Cookie notice with Decline and Accept | n/a | 2026-10-22 |
| Pages with an embedded form: case studies, solutions, lean-ai, planning guide, naama-moran bundle, experiment-platform/apply | The form, plus the page footer | `snippet:form_footer` | not yet checked |
| Program checkout, `pre-pmf-mcp/payments/` | Checkout form; footer legal links | `snippet:checkout_terms` | not yet checked |
| Program booking page and booking confirmation email | Refund terms and how to cancel | `snippet:program_booking_terms` | not yet checked |
| Welcome page after payment, `experiment-platform/welcome/` | Footer legal links | n/a | not yet checked |

## GoHighLevel

| Surface | What it carries | Notice | Last checked |
|---|---|---|---|
| Booking pages (every calendar) | Call-recording notice | `snippet:call_recording_booking` | not yet checked |
| Booking confirmation email | Call-recording notice | `snippet:call_recording_confirmation_email` | not yet checked |
| Calendar invite text | Call-recording notice | `snippet:call_recording_invite` | not yet checked |
| Opening line of every call | Said aloud before the recorder starts | `snippet:call_recording_opening_line` | not yet checked |
| Forms | Short notice under the form | `snippet:form_footer` | not yet checked |
| Email footers and sequences | Postal address, unsubscribe line | `snippet:email_footer` | not yet checked |
| Offer to continue after a program | Price, "only if you say yes", how to cancel | `snippet:continued_access_offer` | not yet checked |
| Reply to a cancellation email | End date, no further charge | `snippet:cancellation_reply` | not yet checked |

## Outreach

| Surface | What it carries | Notice | Last checked |
|---|---|---|---|
| Outreach sequence footers | Postal address, unsubscribe line | `snippet:email_footer` | not yet checked |

## Product sign-in

| Surface | What it carries | Notice | Last checked |
|---|---|---|---|
| Sign-in Terms and Privacy links | Links to the two pages | n/a | not yet checked |
| Server metadata | Privacy and terms URLs | n/a | not yet checked |

## Mailbox

| Surface | What it carries | Notice | Last checked |
|---|---|---|---|
| `info@wayaframes.com` | Receives data requests, cancellations and support | n/a | not yet checked |
