# Post-acquisition turnaround: two video cuts

Two videos of the same case study (`/case-studies/post-acquisition-turnaround/`), side by side for the team to compare.

| Video | What it is |
|---|---|
| `post-acquisition-turnaround-video-skill.mp4` | Narrated, 1:18.5, 1920x1080, 30 fps, voice and music. Made with the waya-video skill on 2026-10-16. Vince's story at Cheetah Technologies. **Draft:** Vince's on-camera clip is a striped placeholder and the narrator stands in for his lens line until his recording arrives. Landscape only; the portrait cut follows approval. |
| `post-acquisition-turnaround-video-watercolor.mp4` | Silent, 45 s, 1920x1080, watercolor washes in the Waya palette. Made on 2026-10-03. |

Each has a `-poster.jpg` next to it.

## Sources
- `post-acquisition-turnaround-video-skill/`: everything behind the narrated cut. Script (`SCRIPT.md`), facts and sources
  (`FACTS.md`), Oren's instructions (`INSTRUCTIONS.md`), art direction (`ART.md`), the recording script for Vince
  (`VINCE-RECORDING.md`), the crew reviews, the page the video is rendered from (`video.html`), the screens it shows
  (`artifacts/`), and the voice, music, mix and audit scripts (`render/`). To re-render: in `render/`, `npm install`,
  then `node render.mjs --cap 0`, `node vo.mjs`, `python music.py`, `node mix.mjs`; the result lands in `render/out/`
  (gitignored) and is copied here.
- `post-acquisition-turnaround-video-watercolor/`: the Python renderer, fonts and its own README.
