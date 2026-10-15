"""Watercolor explainer for the post-acquisition turnaround case study.
python wc_video.py stills 3,12,22,30,38,43   -> PNG stills
python wc_video.py video post-acquisition-turnaround-watercolor.mp4  -> 45s 1080p MP4
"""
import sys, os, math
import numpy as np
from scipy.ndimage import zoom, gaussian_filter, distance_transform_edt
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
LOGO = os.path.join(HERE, "..", "..", "assets", "logos", "waya-logo-charcoal-transparent.png")
W, H, FPS, DUR = 1920, 1080, 30, 45.0

def hexc(h): return np.array([int(h[i:i+2], 16) / 255 for i in (1, 3, 5)], np.float32)
CREAM, CHARCOAL, INK, STONE = hexc("#FAF7F1"), hexc("#383F3B"), hexc("#1F2422"), hexc("#6B6F6C")
MINT, RUST, TAN, MUSTARD, SAGE, FOG = (hexc(c) for c in ("#D3E9E0", "#D16C02", "#D0AE89", "#EAB62F", "#6A9D8A", "#B8BBB6"))
DEEP_SAGE = hexc("#3F6E5C")

def font(name, size): return ImageFont.truetype(os.path.join(FONTS, name + ".ttf"), size)
BOLD, MED = "SpaceGrotesk-Bold", "SpaceGrotesk-Medium"
BODY, BODY_SB = "PlusJakartaSans-Regular", "PlusJakartaSans-SemiBold"

def fbm(h, w, base, octaves, rng):
    out = np.zeros((h, w), np.float32); amp, tot = 1.0, 0.0
    for o in range(octaves):
        cell = max(base / 2 ** o, 2.0)
        g = rng.random((int(h / cell) + 4, int(w / cell) + 4)).astype(np.float32)
        out += amp * zoom(g, cell, order=3)[:h, :w]; tot += amp; amp *= 0.5
    out /= tot
    return (out - out.min()) / (np.ptp(out) + 1e-6)

def ease(x): x = np.clip(x, 0, 1); return x * x * (3 - 2 * x)

def fade(t, tout, tend):
    if tout is None or t < tout: return 1.0
    return float(1 - ease((t - tout) / (tend - tout)))

layers, seed = [], [0]
def rng():
    seed[0] += 1; return np.random.default_rng(seed[0] * 7919)

# ---------- watercolor washes ----------
def _pigment(box, f, g, color, op, t0, dur, out, edge, gran, r):
    x0, y0 = box; h, w = f.shape
    mask = np.clip((1.0 - f) / 0.05, 0, 1)
    dens = op * (1 - gran + gran * fbm(h, w, 70, 4, r)) * (0.88 + 0.12 * fbm(h, w, 9, 2, r))
    band = np.clip(mask - gaussian_filter(mask, 9), 0, 1)
    alpha = np.clip(mask * dens + band * op * edge, 0, 1).astype(np.float32)
    tmap = (t0 + dur * np.clip(g + 0.3 * (fbm(h, w, 90, 3, r) - 0.5), 0, 1.3)).astype(np.float32)
    layers.append(dict(kind="wash", x0=x0, y0=y0, alpha=alpha, tmap=tmap, color=color,
                       tout=out[0] if out else None, tend=out[1] if out else None))

def wash(cx, cy, rx, ry, color, op, t0, dur=2.2, out=None, edge=1.1, gran=0.4, wobble=0.45):
    r = rng(); pad = 1.45
    x0, x1 = max(0, int(cx - rx * pad)), min(W, int(cx + rx * pad))
    y0, y1 = max(0, int(cy - ry * pad)), min(H, int(cy + ry * pad))
    yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
    rad = np.hypot((xx - cx) / rx, (yy - cy) / ry)
    f = rad + wobble * (fbm(y1 - y0, x1 - x0, max(rx, ry) * 0.55, 3, r) - 0.5)
    _pigment((x0, y0), f, rad * 0.85, color, op, t0, dur, out, edge, gran, r)

def stroke(pts, width, color, op, t0, dur=1.4, out=None):
    r = rng(); xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    x0, x1 = max(0, int(min(xs) - width)), min(W, int(max(xs) + width))
    y0, y1 = max(0, int(min(ys) - width)), min(H, int(max(ys) + width))
    im = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(im).line([(x - x0, y - y0) for x, y in pts], fill=255, width=2)
    d = distance_transform_edt(np.asarray(im) == 0).astype(np.float32)
    h, w = d.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    along = (xx + x0 - min(xs)) / (max(xs) - min(xs))
    taper = 1 + 0.6 * np.clip(-along * 8, 0, None) + 0.6 * np.clip((along - 1) * 8, 0, None)
    f = d / (width / 2) * taper + 0.55 * (fbm(h, w, width * 0.9, 3, r) - 0.5)
    _pigment((x0, y0), f, along, color, op, t0, dur, out, 1.0, 0.45, r)

# ---------- text & ink ----------
def wrap(text, fnt, maxw):
    lines = []
    for para in text.split("\n"):
        cur = ""
        for word in para.split(" "):
            test = (cur + " " + word).strip()
            if fnt.getlength(test) <= maxw or not cur: cur = test
            else: lines.append(cur); cur = word
        lines.append(cur)
    return lines

def text(s, x, y, fname, size, color, tin, out=None, maxw=1640, lh=1.15, track=0, align="left"):
    fnt = font(fname, size)
    lines = wrap(s, fnt, maxw) if maxw else s.split("\n")
    im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
    for i, ln in enumerate(lines):
        ly = y + i * size * lh
        if track:
            lw = sum(fnt.getlength(c) + track for c in ln)
            cx = x - lw / 2 if align == "center" else x
            for c in ln:
                d.text((cx, ly), c, font=fnt, fill=255); cx += fnt.getlength(c) + track
        else:
            lx = x - fnt.getlength(ln) / 2 if align == "center" else x
            d.text((lx, ly), ln, font=fnt, fill=255)
    bb = im.getbbox()
    a = np.asarray(im.crop(bb), np.float32) / 255
    layers.append(dict(kind="text", x0=bb[0], y0=bb[1], alpha=a, color=color, tin=tin,
                       tout=out[0] if out else None, tend=out[1] if out else None, rise=14))

def ink_grid(ox, oy, cols, rows, cw, ch, tin, out):
    r = rng(); pad = 10
    im = Image.new("L", (cols * cw + 2 * pad, rows * ch + 2 * pad), 0); d = ImageDraw.Draw(im)
    def wobbly(p, q):
        n = 24; pts = []
        for i in range(n + 1):
            u = i / n; j = r.normal(0, 0.9)
            pts.append((p[0] + (q[0] - p[0]) * u + (j if p[0] == q[0] else 0),
                        p[1] + (q[1] - p[1]) * u + (j if p[1] == q[1] else 0)))
        d.line(pts, fill=int(r.uniform(190, 255)), width=3)
    for c in range(cols + 1): wobbly((pad + c * cw, pad - 4), (pad + c * cw, pad + rows * ch + 4))
    for rr in range(rows + 1): wobbly((pad - 4, pad + rr * ch), (pad + cols * cw + 4, pad + rr * ch))
    a = gaussian_filter(np.asarray(im, np.float32) / 255, 0.7) * 0.8
    layers.append(dict(kind="text", x0=ox - pad, y0=oy - pad, alpha=a, color=CHARCOAL, tin=tin,
                       tout=out[0], tend=out[1], rise=0, slow=1.2))

def image_layer(path, cx, cy, width, tin):
    im = Image.open(path).convert("RGBA")
    im = im.resize((width, int(im.height * width / im.width)), Image.LANCZOS)
    a = np.asarray(im, np.float32)[..., 3] / 255
    layers.append(dict(kind="text", x0=cx - width // 2, y0=cy - im.height // 2, alpha=a, color=CHARCOAL,
                       tin=tin, tout=None, tend=None, rise=10))

# ---------- dots (one product scattered across locations) ----------
def dot_sprite(color, size, r):
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32); c = (size - 1) / 2
    rad = np.hypot(xx - c, yy - c) / (size * 0.36)
    f = rad + 0.35 * (fbm(size, size, size * 0.5, 2, r) - 0.5)
    mask = np.clip((1 - f) / 0.12, 0, 1)
    band = np.clip(mask - gaussian_filter(mask, 2.5), 0, 1)
    return np.clip(mask * (0.55 + 0.2 * fbm(size, size, 6, 2, r)) + band * 0.6, 0, 1).astype(np.float32), color

# ============================ STORYBOARD ============================
L = 140  # left margin

# 1. Title (0-7s)
O1 = (6.2, 7.0)
wash(520, 600, 640, 430, SAGE, 0.30, 0.1, 2.6, O1)
wash(1520, 300, 520, 330, MINT, 0.75, 0.5, 2.4, O1)
wash(1640, 860, 260, 170, MUSTARD, 0.32, 1.4, 1.8, O1)
text("CASE STUDY  ·  FOOD DISTRIBUTION", L, 330, MED, 26, RUST, 1.2, O1, track=3)
text("A post-acquisition\noperations turnaround", L, 385, BOLD, 104, INK, 1.6, O1, maxw=None, lh=1.06)
text("How a warehouse burning $1M a month in contribution margin got back to profitable.", L, 655, BODY, 38, CHARCOAL, 2.7, O1, maxw=1050, lh=1.4)

# 2. The problem (7-16s)
O2 = (15.2, 16.0)
wash(330, 160, 560, 260, TAN, 0.40, 7.0, 2.2, O2)
wash(1700, 980, 520, 260, RUST, 0.16, 7.4, 2.4, O2)
text("Three acquisitions later, fulfillment fell apart.", L, 150, BOLD, 72, INK, 7.5, O2, maxw=1700)
stats = [("~75%", "fill rate"), ("28%", "shrink in a single week, with full pallets thrown out"),
         ("24%", "on-time delivery at the lowest point"), ("~$1M", "contribution margin burned every month")]
for i, (num, lab) in enumerate(stats):
    x, t = L + i * 420, 9.0 + i * 1.15
    wash(x + 115, 545, 165, 100, RUST, 0.30, t - 0.25, 1.3, O2, wobble=0.5)
    text(num, x + 10, 482, BOLD, 108, INK, t + 0.2, O2, maxw=None)
    text(lab, x + 10, 650, BODY, 28, CHARCOAL, t + 0.45, O2, maxw=340, lh=1.35)

# 3. Root cause (16-25s) + 4. Two tracks (25-34s) share a rack grid
O3, O34 = (24.2, 25.0), (33.2, 34.0)
GX, GY, COLS, ROWS, CW, CH = 1060, 380, 7, 5, 100, 86
wash(1420, 600, 520, 380, FOG, 0.30, 16.2, 2.4, O34)
wash(330, 200, 520, 230, MINT, 0.6, 16.4, 2.0, O34)
text("The crews weren't the problem.", L, 150, BOLD, 72, INK, 16.6, O3)
text("The warehouse had been rebuilt: new racking, a new freezer, hundreds of new locations. Its system logic never was.",
     L, 400, BODY, 36, CHARCOAL, 17.8, O3, maxw=800, lh=1.42)
text("So one product ended up scattered across as many as 886 locations.", L, 690, BODY_SB, 34, RUST, 21.4, O3, maxw=800, lh=1.4)
ink_grid(GX, GY, COLS, ROWS, CW, CH, 18.4, O34)

text("Two tracks, at the same time.", L, 150, BOLD, 72, INK, 25.2, O34)
stroke([(L - 20, 455), (520, 448), (930, 458)], 128, TAN, 0.55, 26.0, 1.3, O34)
text("1   Stop the bleeding by hand", L + 10, 410, BOLD, 38, INK, 26.6, O34, maxw=None)
text("Daily triage, one location per product, cycle counts", L + 58, 466, BODY, 25, CHARCOAL, 26.9, O34, maxw=None)
stroke([(L - 20, 640), (520, 648), (930, 638)], 128, SAGE, 0.42, 27.5, 1.3, O34)
text("2   Fix the cause in the system", L + 10, 596, BOLD, 38, INK, 28.1, O34, maxw=None)
text("Rebuilt slotting logic, barcode checks, standard work", L + 58, 652, BODY, 25, CHARCOAL, 28.4, O34, maxw=None)
TCOL, TROW = 3, 2
TX, TY = GX + TCOL * CW + CW / 2, GY + TROW * CH + CH / 2
wash(TX, TY, 72, 58, SAGE, 0.45, 31.0, 0.9, O34, wobble=0.3)
text("One product, one location.", GX + 3 * CW + CW / 2, GY + ROWS * CH + 34, BODY_SB, 30, DEEP_SAGE, 31.4, O34, maxw=None, align="center")

r = rng()
cells = [(c, rr) for c in range(COLS) for rr in range(ROWS) if (c, rr) != (TCOL, TROW)]
pick = r.permutation(len(cells))[:16]
DOTS = []
for k, ci in enumerate(pick):
    c, rr = cells[ci]
    start = (GX + c * CW + CW / 2 + r.uniform(-22, 22), GY + rr * CH + CH / 2 + r.uniform(-16, 16))
    ang, rad = k * 2.4, 6 + 3.2 * math.sqrt(k)
    end = (TX + rad * math.cos(ang) * 1.4, TY + rad * math.sin(ang))
    DOTS.append(dict(start=start, end=end, tin=19.4 + k * 0.12, tmove=28.8 + k * 0.1,
                     sprite=dot_sprite(MUSTARD if k % 3 else RUST, 34, r)))

# 5. Results (34-41s) then end card
O5 = (40.0, 40.8)
wash(420, 220, 620, 300, MINT, 0.85, 34.0, 2.0, O5)
wash(1500, 800, 640, 360, SAGE, 0.26, 34.4, 2.4, O5)
wash(1720, 230, 220, 150, MUSTARD, 0.30, 35.2, 1.6, O5)
text("From burning $1M a month to profitable.", L, 150, BOLD, 72, INK, 34.6, O5)
results = [("Shrink", "~18%  →  ~2%"), ("Fill rate", "~75%  →  99%+"),
           ("On-time delivery", "<40%  →  90%+"), ("Orders with an error", "~22%  →  ~3%")]
for i, (lab, val) in enumerate(results):
    y, t = 395 + i * 135, 35.8 + i * 0.75
    text(lab, L, y + 14, BODY_SB, 36, STONE, t, O5, maxw=None)
    wash(1040, y + 38, 250, 62, SAGE, 0.28, t - 0.1, 1.0, O5, wobble=0.55)
    text(val, 820, y, BOLD, 62, INK, t + 0.2, O5, maxw=None)

wash(960, 470, 760, 330, MINT, 0.7, 40.5, 2.2)
wash(1560, 860, 300, 150, MUSTARD, 0.22, 41.0, 1.8)
wash(380, 860, 260, 140, TAN, 0.3, 41.2, 1.8)
image_layer(LOGO, 960, 420, 380, 41.1)
text("Read the full case study", 960, 590, BODY, 36, CHARCOAL, 41.7, maxw=None, align="center")
text("wayaframes.com/case-studies", 960, 645, BOLD, 50, RUST, 42.0, maxw=None, align="center")

# ============================ RENDER ============================
pr = np.random.default_rng(1)
PAPER = (1 - 0.035 * fbm(H, W, 3, 2, pr) - 0.03 * fbm(H, W, 40, 3, pr))[..., None].astype(np.float32)

def render(t):
    fr = np.empty((H, W, 3), np.float32); fr[:] = CREAM
    for Ly in layers:
        v = fade(t, Ly["tout"], Ly["tend"])
        if v <= 0: continue
        a, x0, y0 = Ly["alpha"], Ly["x0"], Ly["y0"]
        if Ly["kind"] == "wash":
            if t < Ly["tmap"].min(): continue
            a = a * ease((t - Ly["tmap"]) / 0.6) * v
            h, w = a.shape; reg = fr[y0:y0 + h, x0:x0 + w]
            reg *= 1 - a[..., None] * (1 - Ly["color"])
        else:
            e = float(ease((t - Ly["tin"]) / (0.7 * Ly.get("slow", 1))))
            if e <= 0: continue
            dy = int(round((1 - e) * Ly["rise"])); y = y0 + dy
            h, w = a.shape; h = min(h, H - y)
            reg = fr[y:y + h, x0:x0 + w]; aa = (a[:h] * e * v)[..., None]
            reg *= 1 - aa; reg += aa * Ly["color"]
    v = fade(t, *O34)
    for D in DOTS:
        e = float(ease((t - D["tin"]) / 0.35)) * v
        if e <= 0: continue
        m = float(ease((t - D["tmove"]) / 1.6))
        x = D["start"][0] + (D["end"][0] - D["start"][0]) * m
        y = D["start"][1] + (D["end"][1] - D["start"][1]) * m
        a, col = D["sprite"]; s = a.shape[0]
        xi, yi = int(x - s / 2), int(y - s / 2)
        reg = fr[yi:yi + s, xi:xi + s]
        reg *= 1 - (a * e)[..., None] * (1 - col)
    fr *= PAPER
    return (np.clip(fr, 0, 1) * 255).astype(np.uint8)

if __name__ == "__main__":
    mode = sys.argv[1]
    if mode == "stills":
        for s in sys.argv[2].split(","):
            Image.fromarray(render(float(s))).save(os.path.join(HERE, f"still_{s}.png"))
    else:
        import imageio.v2 as imageio
        wr = imageio.get_writer(sys.argv[2], fps=FPS, codec="libx264", quality=8, pixelformat="yuv420p",
                                macro_block_size=8, ffmpeg_params=["-preset", "slow", "-movflags", "+faststart"])
        n = int(DUR * FPS)
        for i in range(n):
            wr.append_data(render(i / FPS))
            if i % 150 == 0: print(f"{i}/{n}", flush=True)
        wr.close(); print("done")
