# Prompt: post-acquisition turnaround, portrait cut and posters

Paste everything below the line into a new Claude Code session on `wayaframes/waya-website`, with Vince's raw recording
attached if you have it to hand.

---

Make the phone version of the post-acquisition turnaround case study video, plus two posters, and put them on the
website through the usual staging review.

## What exists

- The landscape video is live and approved: `assets/video/post-acquisition-turnaround-video-skill.mp4` (1920x1080,
  1:26, 30 fps, narrator plus Vince's own voice three times).
- Everything it was built from is in `docs/post-acquisition-turnaround-video/post-acquisition-turnaround-video-skill/`.
  Read `README.md` one folder up first, then `INSTRUCTIONS.md`, `ART.md`, `SCRIPT.md` and `FACTS.md`. The picture is
  rendered from `video.html`; the screens it shows are in `artifacts/`; the render, voice, music and mix scripts are in
  `render/`.
- The cash float video already went through this exact step. Its record says: "a second layout in the same page
  (`?layout=mobile`), every scene recomposed for 1080x1920, landscape untouched (byte-identical stills), rendered and
  muxed with v2's audio. Portrait poster shot from a portrait variant of the poster page." Do the same here.

## What to make

1. **Portrait cut, 1080x1920.** Same script, same audio, same timing, same scenes, recomposed for a tall frame. Add it
   as a second layout in `video.html` so the landscape render does not change. Check that the landscape stills are
   byte-identical before and after.
   - Audio: take it straight from the live landscape MP4 (`ffmpeg -i ...-skill.mp4 -vn -c:a copy`), so the two cuts
     match to the frame. Only go back to the raw recording if that is impossible.
   - Keep the file size near the others (10–16 MB, H.264 + AAC). Hard limit 25 MB per file.
2. **Landscape poster, 1920x1080: a new, simple card.** Vince's note: "simple thumbnail + graph showing contribution
   margin". Match the cash float poster (the "~100% → ~8%" card: flat cream background, small spaced-out label on top,
   the old number struck through in rust, a mustard arrow, the new result big in sage, one small caption line under it).
   Here it reads: label `CONTRIBUTION MARGIN`, old `~$1M/mo burn` struck, new `Profitable`, caption
   `Cheetah · 2023 · told by Vince`. A small two-point line falling from the burn to zero is fine if it stays simple.
3. **Portrait poster, 1080x1920.** The same card, stacked: label, old value, a down arrow, new value, caption.

Facts: say "profitable" and nothing more precise. Do not use the +$10K figure: they only just crossed over, and the
number looks odd on screen (Vince, 2026-10-22). Every other number comes from `FACTS.md`.

Do not bake a running-time chip into either poster. The site shows its own.

## Put it on the site

Work on a branch off `staging` and follow `docs/WEBSITE-CHECKLIST.md`.

- Files, in `assets/video/`:
  - `post-acquisition-turnaround-video-skill-portrait.mp4`
  - `post-acquisition-turnaround-video-skill-portrait-poster.jpg` (720x1280 JPG)
  - `post-acquisition-turnaround-video-skill-poster.jpg`, replaced with the new landscape card (1280x720 JPG)
- `case-studies/post-acquisition-turnaround/index.html`: give the `<video>` `data-portrait-src` and
  `data-portrait-poster`, and add the small portrait-swap script under it. Copy both from
  `case-studies/cash-float/index.html`. Leave the Schedule a Call button under the video where it is.
- `assets/proof/cases.js`: add `portrait` and `portraitPoster` to the post-acquisition `video` entry.
- `case-studies/scaling/index.html`: fill `data-portrait` and `data-poster-portrait` on the post-acquisition tile.
- Any new source (the mobile layout, the poster pages) goes in `post-acquisition-turnaround-video-skill/`. Only the
  final MP4s go in `assets/video/`. Drafts stay in Drive, because every file committed to git stays in its history.
- Check it on a phone-sized viewport (390x844, portrait) and on desktop. A phone held upright should get the tall cut
  and the tall poster on the case page and on the Scaling tile.

Show Vince the portrait cut and both posters before opening the PR. Then open a PR into `staging` (not `main`) and stop.
Vince reviews on staging and merges.
