# Acceptance list — post-acquisition turnaround video

Every instruction Oren gives, verbatim, with how it is checked. Items are never removed.

| # | Instruction (verbatim) | Check | Status |
|---|---|---|---|
| 1 | "create a new video for this case study, use the /waya-video skill" (source: the Google Doc + `case-studies/post-acquisition-turnaround/`) | Every claim traceable to `FACTS.md` | verified (draft 1, 78.52 s) |
| 2 | "The video needs to be between 1 min and 1:30, no longer than 1:30." | ffprobe duration ≥ 60.0 s and ≤ 90.0 s (target ~80 s) | verified (draft 1, 78.52 s) |
| 3 | "Do not create the portrait version before I approve the landscape version" | No portrait work until Oren approves the landscape MP4 | open |
| 4 | Length pick: "About 1:20" | Script sized to ~80 s | verified (draft 1, 78.52 s) |
| 5 | Look pick: "Waya house look" | Art review against reference frames | verified (draft 1, 78.52 s) |
| 6 | Protagonist pick: "Vince, first-person" (company unnamed) | Vince is the protagonist, named as Waya co-founder (client naming: see item 10, which supersedes "company unnamed") | verified (draft 1, 78.52 s) |
| 7 | Expert pick: "I'll supply a Vince clip" | Expert widget plays Oren's Vince clip (placeholder until supplied) | open |
| 8 | "I need you to give me a script for vince to record and I will give you that video." | `VINCE-RECORDING.md` delivered: lines, timing per widget appearance, framing/recording specs | verified (draft 1, 78.52 s) |
| 9 | "Until then, use a placeholder" | Widget shows a clearly-marked placeholder until the clip arrives; swapped in before delivery | open |
| 10 | Anonymity: "You can explicitly name Cheetah Technologies and Na'ama" | Script may name Cheetah Technologies and Na'ama; overrides the page's "Company names are withheld" for this video | verified (draft 1, 78.52 s) |
| 11 | Vince's audio: "Only on the lens line" | The lens line plays in Vince's own recorded voice (narrator placeholder until the clip arrives); clip muted elsewhere | open |
| 12 | Na'ama: "Include one beat" | One Na'ama beat in the script (e.g. she slept at the warehouse), pronounced NAH-AH-MAH | verified (draft 1, 78.52 s) |
| 13 | Script: "Approved, go ahead" (with items 10–12 applied) | Voicing and animation proceed on the revised script | verified (draft 1, 78.52 s) |
| 14 | "The website will be fixed." (page still says "Company names are withheld") | Not a video item; noted for publishing | noted |
| 15 | Line 1 reads as if Waya existed in 2022: "Fix it" | Line 1 = "Vince, now a Waya co-founder, was at Cheetah Technologies, …" | verified (draft 1, 78.52 s) |
| 16 | COO timing: "verifying, proceed and we will fix later" | "took over as COO" stays on screen; easy to change later | open |
| 17 | Close card: "Schedule a call." primary | "Schedule a Call" is the primary button on the close card | verified (draft 1, 78.52 s) |
| 18 | "make sure that the link is is https://staging.waya-website.pages.dev/case-studies/post-acquisition-turnaround/ add the UTM according to the site UTM rules." | Clarified: "The button under the video on the page", domain "www.wayaframes.com". At publishing: a Schedule a Call button under the video on case-studies/post-acquisition-turnaround/, booking link built by scripts/utm_link.py with utm_button only (placement 'video' must first be added to utm.json, pending Oren's OK), check_utm.py 0 failures | open (publishing) |
| 19 | Button tag: "use the \"video\" tag" | utm.json website_buttons.allowed includes "video"; button href = waya-consultation?utm_button=video; Notion mirror updated at publishing | open (publishing) |

## House-rule overrides for this video
- Rule 28 (two cuts): portrait cut deferred until Oren approves the landscape cut (item 3).
- Rule 4 (respect the site's constraints): the client may be named, Cheetah Technologies, and Na'ama too (item 10).
