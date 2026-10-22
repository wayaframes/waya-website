# Legal pages changelog

Every published version of the four legal pages, newest first:

- Privacy Policy: `/privacy-policy/`
- Terms of Service: `/terms-of-service/`
- How Waya Handles Your Data: `/data-handling/`
- Support: `/support/`

The version and date here match `_data/legal.json`. Run `python scripts/check_legal.py` before you add an entry. Each entry records what changed in plain words, who read it, and whether customers were told.

## 2026-10-22: first version

**Published:** to be filled in on the day `staging` is merged to `main`.
**Pages:** all four.
**Reviewed by:** Vince (wording, rounds of 2026-09-16, 2026-10-08 and 2026-10-19), Oren (review edits of 2026-10-19 to 2026-10-22).
**Customer notice:** none. This is the first published version.

What the pages say, in short:

- **Privacy Policy:** what Waya collects through the services, the website and calls, and why, with a legal basis for each purpose. Which kinds of providers process it. How long it is kept, including call recordings and transcripts for up to 2 years. Data requests are answered within 30 days of receiving the request. Session content is never used to train AI models.
- **Terms of Service:** what Waya is, acceptable use, ownership of your content, and the review of session records by the team, including personal methodologies (Mission & Values, Ikigai). Programs and fees: a full refund before the first session, continued access after a program only if the buyer agrees, cancel at any time by email with effect at the end of the paid period, and what happens to access when a program is not continued. Not professional advice, warranties, liability, termination.
- **How Waya Handles Your Data:** what is stored, where, who can read it, how it is protected, and how to get a copy or have it deleted.
- **Support:** how to get help and how to make a data request.

Sources for this version: the Oct 19 and Oct 21 review edits on branch `legal-pages-edits`, and the 22 Oct changes: 30 days counted from receipt, a legal basis for each website purpose, a sentence on other people's information, the personal-methodologies paragraph, the "After a program ends" section, and the "access is locked down" wording.

<!--
Template for the next entry (copy above the previous one):

## YYYY-MM-DD: one-line summary

**Published:** YYYY-MM-DD
**Pages:** which of the four
**Reviewed by:** names and date
**Customer notice:** none / email on YYYY-MM-DD / in-product notice

- What changed, in plain words, page by page.
-->
