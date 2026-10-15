# Post-acquisition turnaround: watercolor video (45 s)

An earlier, silent cut of the post-acquisition turnaround case study, made on 2026-10-03. Separate from the narrated
video in `../post-acquisition-turnaround-video/`.

- `post-acquisition-turnaround-watercolor.mp4`: 1920x1080, 30 fps, 45 s, H.264, no audio, 14.8 MB.
- `post-acquisition-turnaround-watercolor-poster.jpg`: the title frame (5 s).
- `wc_video.py`: the renderer. Watercolor washes in the Waya palette, generated frame by frame with numpy and Pillow,
  encoded with the ffmpeg bundled in `imageio-ffmpeg`. The storyboard (scenes, text, timings) is the middle
  section of the file.
- `fonts/`: TTF copies of the site's Space Grotesk and Plus Jakarta Sans (Pillow cannot read the site's woff2).

Scenes: title (0–7 s), the problem in four numbers (7–16 s), root cause with one product scattered across a rack
grid (16–25 s), the two tracks while the product consolidates into one location (25–34 s), results (34–41 s),
end card (41–45 s).

## Render

```bash
pip install numpy pillow scipy imageio imageio-ffmpeg
python wc_video.py stills 5,14,23,32,39,44
python wc_video.py video post-acquisition-turnaround-watercolor.mp4
```

Stills land next to the script (`still_*.png`, gitignored). A full render takes a few minutes.

## Where it was used

On the 2026-10-03 `case-studies-split` branch it sat under the hero of `/case-studies/post-acquisition-turnaround/`
as `/assets/videos/post-acquisition-turnaround.mp4`. That branch was superseded by the split now on `staging`, which
does not include this video.

## Open point

The subtitle on the title card says "a warehouse burning $1M a month". The case study says the operation was
burning it; change the wording in `wc_video.py` before reusing the cut.
