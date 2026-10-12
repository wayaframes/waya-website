# The Waya Experiment Program — promo video script (draft 6)

**Length:** 2:11, voiced. The customer's pain is the first 29 s; Waya is the remaining 102 s.
**Voice:** a synthesized neural voice (edge-tts, en-US-AndrewNeural at +5%, which is 10% faster than draft 4) as the
placeholder for the real voiceover. The lines are Oren's (2026-10-12), personalised to Sam. The timing sheet is
`render/out/vo-timing.txt`.
**Shape:** Sam's story. He ran operations at a marketing agency and lost every Sunday to client reports,
so he quit to build the tool that writes them. He sells to "anyone who sends client reports", gets nothing,
and finds the Waya Experiment Program. The coach's questions narrow the customer to agencies. Round 1 of
experiments shows LinkedIn DMs fail and agency founder communities work, that freelancers will not pay and
agencies with five or more clients will. Round 2 is agencies only, on the premium report. Twelve paying agencies.
**Focus:** human-led. The coach appears first and stays on screen in every Waya scene. The assistant and the
tools come second, and the point made about them is that you connect only what each round needs.
**The Tracker** (the side panel showing where the founder is) appears only beside the chat: the assistant
intro, the business case, the register. Never during the loop, the quote, or the ending.
**Clutter:** one card at a time in the loop. At the quote everything else drops to a whisper.
**Format:** 16:9, 1920×1080, 30 fps. Voiceover plus on-screen text. Music restless for 25 s, then calm.
**Look:** the website's own brand. Cold, dark palette for the pain; cream from the moment the coach appears.
**Names:** the product is **the Waya Experiment Program**. The word MCP appears nowhere. Sam is he.

What changed from draft 2 (Oren, 2026-10-11): 75 s with a 25/50 split; Sam has a company and a story;
the agency as the customer is a revelation reached by iterating; channels that work and channels that don't;
the coach leads, then the assistant and tools; the Tracker only beside the chat; the quote stands alone.

---

## The script

| # | Time | What we see | Voiceover |
|---|---|---|---|
| 1 | 0:00–0:11 | Dark desk. Sam at a laptop. Calendar: Sunday · 11:40 pm · client reports due Monday 9 am. Three reports stack up. Sam's name card. | Meet Sam. He ran operations at an agency and lost every Sunday to client reports. So he quit to build the tool that writes them. |
| 2 | 0:11–0:16 | Sixteen tool chips rain into a pile. Counter climbs to 16. | He signed up for everything. |
| 3 | 0:16–0:25 | Three cards, one at a time: landing page, 0 visitors · survey, 3 responses · chatbot, "Great idea!" | A landing page for everyone. Nobody came. Three friends answered the survey. The chatbot loved every idea. |
| 4 | 0:25–0:29 | Sam, head in hands. | Six months. No customer. |
| 5 | 0:29–0:41 | Cream. The coach tile, centre, waving. Title. "Hands-on guidance from a coach who has built several companies." | Then Sam joined the Waya Experiment Program. He got hands-on guidance from a business coach who has built several companies before, and who built this program to guide founders week by week. |
| 6 | 0:41–0:58 | Coach left. The AI assistant opens with the coach's first message. The Tracker on the right. A strip: Connected for round 1 · 2 of 16. | The Waya team guides founders like Sam to build their company and reach product-market fit, using a proven methodology, with Sam's own AI assistant and Sam's own tools. Sam connected only what he needed for each experiment round, even though he isn't a technical founder. |
| 7 | 0:58–1:07 | The business case, one hard question at a time. "Who loses a whole day a week to this?" "Anyone who sends client reports." "And who would pay to get that day back?" The chatbot pops up and is swiped away. "Agencies." The Tracker marks Mission & values done. | Together, Sam and the Waya coach wrote the business case and the mission and values document, one hard question at a time. |
| 8 | 1:07–1:17 | Everything fades to a whisper. The quote alone: "I think about my company. I don't let AI slop think for me." | The Waya methodology asks founders to think hard about their company. It doesn't let AI slop think for him. Sam uses AI tools consciously and deliberately. |
| 9 | 1:17–1:29 | The register takes the chat's place: four assumptions, riskiest first, kill date. Then the ring draws and **Define** lights. | The business case generates assumptions about the business and the product, ranked by effort and risk. The experiment system designs ways to validate them. |
| 10 | 1:29–1:44 | **Build** lights: "The tooling to reach agency founders. Two tools, not sixteen." Fourteen chips struck through, CRM and Email lit. "12 interviews booked." Then **Track** lights on "tracked in a CRM": two channels against the pass line, LinkedIn DMs 4.6% below, agency founder communities 14% above. | Sam wanted to reach agency founders, so the Waya platform helped him build the tooling to find them. He connected with them, set up interviews, and talked with potential customers about his product. He tracked every meeting and conversation in a CRM. |
| 11 | 1:44–1:56 | **Analyze** lights. Four verdicts flip one by one: LinkedIn DMs rejected · founder communities accepted · freelancers rejected · agencies with 5+ clients accepted. The ring spins into Round 2 · agencies only · the premium report. | At the end of each round, the Analyze phase helped Sam see which channels worked best, and confirm his signal by meticulously validating with customers, until he found the ones who paid. |
| 12 | 1:56–2:05 | Sam on a call with Dana (agency, 7 clients, paying). Coach tile, weekly hour. Chart: 12 agencies. "Evidence, not opinions." | The Waya Experiment Program helped founders like Sam find product-market fit through this lightweight, yet meticulous, methodology. |
| 13 | 2:05–2:11 | Waya wordmark. "Stop guessing. Start experimenting." 12 weeks · 5–7 founders · mid-November 2026 · wayaframes.com | Do you want to get to product-market fit? Stop guessing and generating. Start experimenting, with Waya. |

One wording change from Oren's notes: "mission and vision document" is voiced as "mission and values document", which is the
name of the Wayaframe and what the Tracker shows. Say the word and it goes back.

## Sam's story, in one paragraph

Sam ran operations at a marketing agency and spent every Sunday night assembling client reports by hand. He quit
to build the tool that writes them, and sold it to anyone who sends a client report. Nobody came. With the coach
he answered one question he had skipped: who loses a whole day a week to this, and who would pay to get it back.
Agencies, not freelancers. Round 1 tested two channels and two customers at once. LinkedIn DMs got 4.6% replies and
failed the 8% pass line; agency founder communities got 14% and passed. Freelancers would not pay; agencies with
five or more clients would. Round 2 was agencies only, on the premium report. By week twelve, twelve agencies paid.

## Build

`video.html` beside this file is the animation, and it plays with the finished sound. Serve the website folder
(any static server, for example `python -m http.server 8811` from the repo root) and open
`/docs/experiment-module-video/video.html`; press the play button, since browsers only start sound after a click.
Space pauses, R restarts, the arrow keys skip five seconds, `?t=55` freezes at a second. `player.html` beside it just
plays the finished MP4. Two commands make the video:

```bash
node render/render.mjs --cap 0 --out out/waya-experiment-program-nocap.mp4
```

```bash
node render/vo.mjs
```

The first captures the page with the Chrome on this machine (1080p, 30 fps, no captions). The second reads the
cue list from `video.html`, speaks each line, lays it at its cue, prints a timing sheet that flags any line
longer than its slot, and muxes the result to `render/out/waya-experiment-program-vo.mp4`. Swap the placeholder
voice for a recorded one by dropping WAV files named `cue-00.wav` … into `render/out/vo/` and re-running.

The soundtrack is composed and synthesized in code, no samples and no licence to clear:

```bash
python render/music.py --dur 131.5
```

```bash
node render/mix.mjs --music -10 --duck 4
```

`music.py` writes `render/out/music.wav`: D minor drone and pulse for the dark opening, a lift to F major as the
screen warms, layers added through the loop, a crescendo on the Dana call, pads only for the last two cards.
`mix.mjs` puts it 10 dB under the voice, dips it a further 4 dB while the voice speaks, and muxes the result to
`render/out/waya-experiment-program-final.mp4`. Replace `music.wav` with a licensed track of the same length and
re-run the mix to swap it.

**Mobile.** The same page carries a portrait layout (`?layout=mobile`, 1080×1920): every scene re-laid top to bottom,
the coach and the Tracker side by side above the chat, the loop ring above its card, Sam at the foot of the frame.
Render and mix it with:

```bash
node render/render.mjs --layout mobile --cap 0 --out out/waya-experiment-program-mobile-nocap.mp4
```

```bash
node render/mix.mjs --music -10 --duck 4 --video out/waya-experiment-program-mobile-nocap.mp4 --out out/waya-experiment-program-mobile-final.mp4
```
