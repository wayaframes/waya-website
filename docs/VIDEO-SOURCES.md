# Case study videos: where the sources live

The site serves only the final cuts and their posters, from `assets/video/`. Everything behind them lives in Google
Drive, in the team's case study videos folder:
https://drive.google.com/drive/folders/1kTjHIVVmk2X1aG3_1A_YBGddvHVNTYZ9 (team access).

| Case study page | Files on the site (`assets/video/`) | Sources |
|---|---|---|
| `cash-float` | `cash-float-video*` | Drive: [`cash-float-video`](https://drive.google.com/drive/folders/1HicLZxsA142h19Y5LE3osnXQ9JO-RB1l) |
| `customer-support` | `customer-support-video*` | Drive: [`support-response-video`](https://drive.google.com/drive/folders/1tE39L0MfUYSN4UNVChFzJTkzmA7J3Hc-) |
| `hospital-patient-wait` | `hospital-patient-wait-video*` | Drive: [`gi-turnaround-video`](https://drive.google.com/drive/folders/1vIIuyEnFRIB4bPwGlN92YDgNTEhfx6qJ) |
| `warehouse-quality` | `warehouse-quality-video*` | Drive: [`quality-check-video`](https://drive.google.com/drive/folders/1G-jI-vT9-bYULo0RVoypugzt4bAQYO5s) |
| `post-acquisition-turnaround` | `post-acquisition-turnaround-video-skill*` | This repo: `docs/post-acquisition-turnaround-video/` |
| `ap-automation-margin` | `restaurant-ap-margin*` | Not recorded here |
| `lean-ai` (the `/lean-ai/` product page, not a case study) | `lean-ai-video*` | Private repo: [`lean-ai/` in `wayaframes/waya-videos`](https://github.com/wayaframes/waya-videos/tree/main/lean-ai) |

Newer videos live in the private video repo `wayaframes/waya-videos`, one folder per page, instead of Drive. The
folder's `README.md` says which cut is final and lists every final's size and md5.

Each Drive folder has a `README.md`; start there, because it says which cut is final. Each folder also holds the
brief, facts, script, art direction, Vince's instructions, the raw recording, every draft cut, and the files to
rebuild the video (`source/` or `sources/`).

**Why they are not in this repo:** the repo is public. The notes name suppliers and carry working details that stay
internal.

**Adding a video:**
- Only the approved final MP4s (landscape, plus the 1080x1920 portrait) and their posters go in `assets/video/`.
- Posters are JPGs at 1280x720 and 720x1280, with no running-time chip printed on them.
- Everything else stays in the private video repo (or in Drive, for the older videos above).
- Wire the files in the way `case-studies/cash-float/` does. A page that is not a case study
  copies the `.video-wrap` styles into its own `<style>` (as `lean-ai/index.html` does).
- The full steps, including the button under the video and the iPhone check, are in
  `docs/WEBSITE-CHECKLIST.md`, section 3a. Videos are served through
  `functions/assets/video/[[path]].js` so visitors can skip ahead; keep it.
