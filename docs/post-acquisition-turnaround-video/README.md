# Post-acquisition turnaround: two video cuts

Two videos of the same case study (`/case-studies/post-acquisition-turnaround/`), side by side for the team to compare.

| Video | What it is |
|---|---|
| `post-acquisition-turnaround-video-skill.mp4` | Narrated, 1:26, 1920x1080, 30 fps, voice and music. Made with the waya-video skill, 2026-10-16 to 10-18. Vince's story at Cheetah Technologies. Vince is heard in his own voice three times (the key line, the all-hands moment on camera, and the lens line on camera), from his take of 2026-10-16. The live copy is `assets/video/post-acquisition-turnaround-video-skill.mp4`. |
| `assets/video/post-acquisition-turnaround-video-skill-portrait.mp4` (site only) | The portrait cut, 1080x1920, made 2026-10-22: the same page with `?layout=mobile`, every scene recomposed, muxed with the live landscape MP4's audio stream (copied, so the two match to the frame). |
| `post-acquisition-turnaround-video-watercolor.mp4` | Silent, 45 s, 1920x1080, watercolor washes in the Waya palette. Made on 2026-10-03. |

Each has a `-poster.jpg` next to it. The site's posters are new cards (2026-10-22): `assets/video/post-acquisition-turnaround-video-skill-poster.jpg` (1280x720) and `-portrait-poster.jpg` (720x1280), shot from `post-acquisition-turnaround-video-skill/artifacts/poster-card.html` by `artifacts/shoot-poster.mjs`. The `-poster.jpg` in this folder is the old frame-grab poster, kept with this copy of the MP4.

## Sources
- `post-acquisition-turnaround-video-skill/`: everything behind the narrated cut. Script (`SCRIPT.md`), facts and sources
  (`FACTS.md`), Oren's instructions (`INSTRUCTIONS.md`), art direction (`ART.md`), the recording script for Vince
  (`VINCE-RECORDING.md`), the crew reviews, the page the video is rendered from (`video.html`), the screens it shows
  (`artifacts/`), and the voice, music, mix and audit scripts (`render/`). To re-render: in `render/`, `npm install`,
  then `node render.mjs --cap 0`, `node vo.mjs`, `python music.py`, `node mix.mjs`; the result lands in `render/out/`
  (gitignored) and is copied here.
- `post-acquisition-turnaround-video-watercolor/`: the Python renderer, fonts and its own README.

## Portrait cut and posters (2026-10-22)
`PORTRAIT-PROMPT.md` is the brief. What was done and how it was checked is round 5 in `post-acquisition-turnaround-video-skill/INSTRUCTIONS.md`; the seats are in its `ART.md` ("Portrait cut"). To re-render the portrait cut: in `render/`, `node render.mjs --layout mobile --cap 0 --crf 16 --out out/video-portrait-nocap.mp4` (add `--clip render/out/expert-vince.webm`, a VP9 copy of the take, where the browser cannot play H.264), then mux with the live landscape MP4's audio: `ffmpeg -i out/video-portrait-nocap.mp4 -i <landscape>.mp4 -map 0:v -map 1:a -c copy -movflags +faststart <portrait>.mp4`.
