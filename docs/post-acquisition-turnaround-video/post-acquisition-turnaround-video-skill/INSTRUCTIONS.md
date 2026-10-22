# Acceptance list — post-acquisition turnaround video

Every instruction Oren gives, verbatim, with how it is checked. Items are never removed.

| # | Instruction (verbatim) | Check | Status |
|---|---|---|---|
| 1 | "create a new video for this case study, use the /waya-video skill" (source: the Google Doc + `case-studies/post-acquisition-turnaround/`) | Every claim traceable to `FACTS.md` | verified (draft 1, 78.52 s) |
| 2 | "The video needs to be between 1 min and 1:30, no longer than 1:30." | ffprobe duration ≥ 60.0 s and ≤ 90.0 s (target ~80 s) | verified (draft 1, 78.52 s) |
| 3 | "Do not create the portrait version before I approve the landscape version" | No portrait work until Oren approves the landscape MP4 | done (the landscape cut is approved and live; portrait brief of 2026-10-22, #34) |
| 4 | Length pick: "About 1:20" | Script sized to ~80 s | verified (draft 1, 78.52 s) |
| 5 | Look pick: "Waya house look" | Art review against reference frames | verified (draft 1, 78.52 s) |
| 6 | Protagonist pick: "Vince, first-person" (company unnamed) | Vince is the protagonist, named as Waya co-founder (client naming: see item 10, which supersedes "company unnamed") | verified (draft 1, 78.52 s) |
| 7 | Expert pick: "I'll supply a Vince clip" | Expert widget plays Oren's Vince clip (placeholder until supplied) | verified (draft 3, 86.06 s) |
| 8 | "I need you to give me a script for vince to record and I will give you that video." | `VINCE-RECORDING.md` delivered: lines, timing per widget appearance, framing/recording specs | verified (draft 1, 78.52 s) |
| 9 | "Until then, use a placeholder" | Widget shows a clearly-marked placeholder until the clip arrives; swapped in before delivery | verified (draft 3, 86.06 s) |
| 10 | Anonymity: "You can explicitly name Cheetah Technologies and Na'ama" | Script may name Cheetah Technologies and Na'ama; overrides the page's "Company names are withheld" for this video | verified (draft 1, 78.52 s) |
| 11 | Vince's audio: "Only on the lens line" | The lens line plays in Vince's own recorded voice (narrator placeholder until the clip arrives); clip muted elsewhere | verified (draft 3, 86.06 s) |
| 12 | Na'ama: "Include one beat" | One Na'ama beat in the script (e.g. she slept at the warehouse), pronounced NAH-AH-MAH | verified (draft 1, 78.52 s) |
| 13 | Script: "Approved, go ahead" (with items 10–12 applied) | Voicing and animation proceed on the revised script | verified (draft 1, 78.52 s) |
| 14 | "The website will be fixed." (page still says "Company names are withheld") | Not a video item; noted for publishing | noted |
| 15 | Line 1 reads as if Waya existed in 2022: "Fix it" | Line 1 = "Vince, now a Waya co-founder, was at Cheetah Technologies, …" | verified (draft 1, 78.52 s) |
| 16 | COO timing: "verifying, proceed and we will fix later" | "took over as COO" stays on screen; easy to change later | open |
| 17 | Close card: "Schedule a call." primary | "Schedule a Call" is the primary button on the close card | verified (draft 1, 78.52 s) |
| 18 | "make sure that the link is is https://staging.waya-website.pages.dev/case-studies/post-acquisition-turnaround/ add the UTM according to the site UTM rules." | Clarified: "The button under the video on the page", domain "www.wayaframes.com". At publishing: a Schedule a Call button under the video on case-studies/post-acquisition-turnaround/, booking link built by scripts/utm_link.py with utm_button only (placement 'video' must first be added to utm.json, pending Oren's OK), check_utm.py 0 failures | open (publishing) |
| 19 | Button tag: "use the \"video\" tag" | utm.json website_buttons.allowed includes "video"; button href = waya-consultation?utm_button=video; Notion mirror updated at publishing | open (publishing) |
| 20 | "put both videos on the page, the top one is the skill generated video, beneath it the watercolor video" | case-studies/post-acquisition-turnaround/: skill video first, watercolor beneath (edit was interrupted by Oren; on hold) | on hold |
| 21 | "I have the video from Vince, I want you to edit it according to the script and put it in the widget that you carved out for it." (take: Downloads/IMG_9128.MOV) | Widget plays Vince's clip at all four appearances; lens line in his own voice, lip-synced; lens scene re-timed to his words | verified (draft 3, 86.06 s) |
| 22 | "This version needs to go into the post-acquisition-turnaround video branch" | Committed on branch post-acquisition-turnaround-video only | open |
| 23 | "tell the audion tech to try to compress the volume of the video" | Dynamic-range compression on Vince's line and the final mix; report LRA and LUFS before/after | verified (draft 3, 86.06 s) |

| 24 | "The clip of Vince at the beginning is confusing, please remove it between the timing 0:00 - 0:06, you can show a stils image, in a widget thats not a video widget." | 0–6 s: no Vince video; a still photo of Vince in a non-video card | verified (draft 3, 86.06 s) |
| 25 | "I'd like the animation director to make the forklift animation look a bit more professional, less stick figure" | Forklift/dumpster scene redrawn as a polished illustration; art review | verified (draft 3, 86.06 s) |
| 26 | "0:22-0:30 remove the video of vince, its distracting." | No Vince video 22–30 s | verified (draft 3, 86.06 s) |
| 27 | "\"Found the cause not not the crews\" - this sentence doesn't make sense. Please fix it to align with the principles of Lean Methodology." | Line 6 rewritten (process, not people; go and see); re-voiced; screen text matches | verified (draft 3, 86.06 s) |
| 28 | "Na'ama sleeping in the warehouse - get the animation director to make it look more professional" | Na'ama beat redrawn as a polished illustration; art review | verified (draft 3, 86.06 s) |
| 29 | "The video of Vince talking at 0:36-0:53 vinces voice isnt' audible at all, its all under the voiceover." | Vince's talking video is shown only while his own voice is heard | verified (draft 3, 86.06 s) |
| 30 | "When Vince is talking in the last scene there is a lot of echo, can you remove it?" | Room echo removed from his lens line; measured before/after | verified (draft 3, 86.06 s) |
| 31 | "Is there a more relevant version of the video that Vinces voice is part of the video in the earlier clips that are not only the last 2 seconds?" | Answered with options; Oren picked "Three moments" (#32) | done |

| 32 | Vince's voice: "Three moments" | Vince's own voice on (1) the key line, his words "every day the warehousing crew was fixing the problems, and the IT system was recreating them every night" (text alone, no face), (2) the all-hands beat in the two tracks, on camera ("So we got everyone, executive, sales team, operators. 24-7, we ran that until we cleaned up the warehouse."), (3) the lens line; ≤ 90 s | verified (draft 3, 86.06 s) |
| 33 | Line 6: "Process, not people" | Line 6 = "On October twenty-second, Vince went to the floor and found the cause: the process, not the people." | verified (draft 3, 86.06 s) |

## Round 5 (2026-10-22): the portrait cut and two posters (Vince, `../PORTRAIT-PROMPT.md`)

| # | Instruction (verbatim) | Check | Status |
|---|---|---|---|
| 34 | "Portrait cut, 1080x1920. Same script, same audio, same timing, same scenes, recomposed for a tall frame." | ffprobe 1080x1920, 30 fps, same frame count as the landscape MP4; every landscape element on screen at the same times (stills compared side by side) | verified (1080x1920, 30 fps, 2,582 frames, 86.07 s; the live landscape MP4's frames match the page timeline to the frame; independent art review: every landscape element present at the same times in both cuts) |
| 35 | "Add it as a second layout in `video.html` so the landscape render does not change. Check that the landscape stills are byte-identical before and after." | `?layout=mobile`; every one of the 2,582 landscape frames hashed (md5 of the PNG) before and after the change: identical | verified (all 2,582 frames hashed in five full passes, two of the old page and three of the new: 2,572 byte-identical in every pass; the other 10 also vary between two passes of the old page itself, and each renders byte-identical from the old and the new page when rendered directly) |
| 36 | "Audio: take it straight from the live landscape MP4 (`ffmpeg -i ...-skill.mp4 -vn -c:a copy`), so the two cuts match to the frame." | md5 of the portrait MP4's audio stream = md5 of the live landscape MP4's | verified (audio stream md5 302374e3… in both files) |
| 37 | "Keep the file size near the others (10–16 MB, H.264 + AAC). Hard limit 25 MB per file." | ffprobe codecs; file size | verified (H.264 High + AAC LC 48 kHz stereo, 10.4 MB, crf 16) |
| 38 | "Landscape poster, 1920x1080: a new, simple card." Vince's note: "simple thumbnail + graph showing contribution margin". Label `CONTRIBUTION MARGIN`, old `~$1M/mo burn` struck, new `Profitable`, caption `Cheetah · 2023 · told by Vince`; "A small two-point line falling from the burn to zero is fine if it stays simple." | Text exactly as given; matches the cash float card; 1280x720 JPG | verified (1280x720, 31 KB; the small line is drawn like the site's own chart, the burn falling to zero; Vince: "looks good", 2026-10-22) |
| 39 | "Portrait poster, 1080x1920. The same card, stacked: label, old value, a down arrow, new value, caption." | 720x1280 JPG | verified (720x1280, 35 KB; Vince: "looks good", 2026-10-22) |
| 40 | "Facts: say "profitable" and nothing more precise. Do not use the +$10K figure" (Vince, 2026-10-22) | No number on either poster but ~$1M/mo and the two dates | verified (on the posters: ~$1M/mo, Oct 2022, Oct 2023, 2023; no other figure) |
| 41 | "Do not bake a running-time chip into either poster. The site shows its own." | No chip | verified |
| 42 | Put it on the site: the three files in `assets/video/`; the case page's `<video>` gets `data-portrait-src`, `data-portrait-poster` and the portrait-swap script; `cases.js` gets `portrait` and `portraitPoster`; the Scaling tile gets `data-portrait` and `data-poster-portrait`. "Leave the Schedule a Call button under the video where it is." | Diff; the button unchanged | verified (diff; the Schedule a Call button is unchanged under the video) |
| 43 | "Check it on a phone-sized viewport (390x844, portrait) and on desktop. A phone held upright should get the tall cut and the tall poster on the case page and on the Scaling tile." | Browser check at 390x844 and 1440x900 | verified (390x844: the case page loads the 1080x1920 cut with the tall poster in a 9:16 frame; the Scaling tile plays the tall cut with the tall poster; 1440x900: landscape on both) |
| 44 | "Show Vince the portrait cut and both posters before opening the PR. Then open a PR into `staging` (never `main`) and stop." | Vince's OK; PR base `staging`; not merged | done (Vince, 2026-10-22: "looks good"; PR into `staging`, not merged by the session) |

## House-rule overrides for this video
- Rule 28 (two cuts): portrait cut deferred until Oren approves the landscape cut (item 3). Lifted: the portrait cut is round 5.
- Rule 4 (respect the site's constraints): the client may be named, Cheetah Technologies, and Na'ama too (item 10).
