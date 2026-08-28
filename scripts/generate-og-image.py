#!/usr/bin/env python3
"""Regenerate public/og-image.png, the 1200x630 link preview card.

Run when the brand palette, the wordmark or the headline changes:

    python3 scripts/generate-og-image.py

Needs Pillow and the two brand fonts (Fraunces for display, DM Sans for text).
Fonts are fetched from the google/fonts repository into a local cache the first
time; both are OFL licensed, and only the rendered PNG is committed.
"""
from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-image.png"
LOGO = ROOT / "public" / "logo.png"
CACHE = Path.home() / ".cache" / "wegowhen-fonts"

FONTS = {
    "fraunces": "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
    "dmsans": "https://github.com/google/fonts/raw/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf",
}

# The app's design tokens (src/index.css :root), converted from HSL to RGB.
CREAM = (252, 250, 246)        # --background 40 33% 98%
INK = (49, 37, 27)             # --foreground 25 30% 15%
MUTED_INK = (132, 116, 99)     # --muted-foreground 25 15% 45%
PRIMARY = (217, 118, 74)       # --primary 16 65% 55%
HEAT_LOW = (243, 240, 233)     # --heat-low 40 20% 94%
HEAT_MID = (232, 199, 155)     # --heat-medium 35 60% 75%
BORDER = (229, 221, 209)       # --border 35 20% 88%
CARD = (255, 255, 255)

W, H = 1200, 630
SCALE = 2  # supersample, then downscale, so text and corners stay crisp


def font(name: str, size: int, weight: int) -> ImageFont.FreeTypeFont:
    """Load a brand font at a weight. Both faces ship as variable fonts, so the
    weight (and Fraunces' optical size and wonk) are set per instance."""
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{name}.ttf"
    if not path.exists():
        urllib.request.urlretrieve(FONTS[name], path)  # noqa: S310 - fixed https URLs
    f = ImageFont.truetype(str(path), size)
    wanted = {"weight": weight, "optical size": size / SCALE, "wonky": 0, "softness": 0}
    try:
        axes = f.get_variation_axes()
    except OSError:
        return f  # static build of the font: accept the default instance
    values = []
    for axis in axes:
        label = axis["name"].decode() if isinstance(axis["name"], bytes) else axis["name"]
        target = wanted.get(label.strip().lower(), axis["default"])
        values.append(max(axis["minimum"], min(axis["maximum"], target)))
    f.set_variation_by_axes(values)
    return f


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def wrap(text: str, f: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    """Greedy wrap, measured with the real font so nothing overruns the column."""
    lines, line = [], ""
    for word in text.split():
        candidate = f"{line} {word}".strip()
        if f.getlength(candidate) <= max_width or not line:
            line = candidate
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def main() -> None:
    s = SCALE
    img = Image.new("RGB", (W * s, H * s), CREAM)

    # Warm wash in the bottom-right, so the card is not a flat rectangle.
    glow = Image.new("RGB", (W * s, H * s), CREAM)
    ImageDraw.Draw(glow).ellipse(
        [int(W * 0.55) * s, int(H * 0.25) * s, int(W * 1.35) * s, int(H * 1.5) * s],
        fill=(250, 238, 226),
    )
    img = Image.blend(img, glow.filter(ImageFilter.GaussianBlur(60 * s)), 0.9)
    d = ImageDraw.Draw(img)

    pad = 72 * s
    column = 560 * s  # text column: leaves the right third for the calendar card

    # --- brand row -------------------------------------------------------
    logo = Image.open(LOGO).convert("RGBA")
    mark = 64 * s
    logo.thumbnail((mark, mark), Image.LANCZOS)
    img.paste(logo, (pad - 4 * s, pad - 10 * s), logo)
    wordmark = font("fraunces", 36 * s, 600)
    d.text((pad + mark + 6 * s, pad), "WeGoWhen", font=wordmark, fill=INK)

    # --- headline --------------------------------------------------------
    head = font("fraunces", 58 * s, 600)
    y = pad + 104 * s
    for line in wrap("Find the days everyone can actually go.", head, column):
        d.text((pad, y), line, font=head, fill=INK)
        y += 70 * s

    sub = font("dmsans", 26 * s, 400)
    y += 20 * s
    body = "Everyone taps the days they are free. WeGoWhen ranks the date ranges that fit the most people."
    for line in wrap(body, sub, column):
        d.text((pad, y), line, font=sub, fill=MUTED_INK)
        y += 37 * s

    # --- footer line -----------------------------------------------------
    foot = font("dmsans", 25 * s, 500)
    fy = H * s - pad - 26 * s
    domain = "wegowhen.com"
    d.text((pad, fy), domain, font=foot, fill=PRIMARY)
    x = pad + foot.getlength(domain) + 20 * s
    d.text((x, fy), "\u00b7", font=foot, fill=BORDER)
    d.text((x + 20 * s, fy), "No account. Just a link.", font=foot, fill=MUTED_INK)

    # --- the product's signature: a heat-mapped month with a winning run -
    # 7 columns x 4 rows of day cells; the third row carries a run of four
    # consecutive days the whole group is free, which is the answer the app gives.
    cell, gap = 44 * s, 10 * s
    rows, cols = 4, 7
    grid_w = cols * cell + (cols - 1) * gap
    label = font("dmsans", 22 * s, 600)
    inner_pad = 28 * s
    card_w = grid_w + 2 * inner_pad
    card_h = rows * cell + (rows - 1) * gap + inner_pad * 2 + 44 * s
    card_x = W * s - pad - card_w
    card_y = (H * s - card_h) // 2
    rounded(d, [card_x, card_y, card_x + card_w, card_y + card_h], 24 * s, CARD, BORDER, 2 * s)

    heat = [
        [0, 1, 1, 0, 2, 1, 0],
        [1, 2, 1, 1, 0, 1, 2],
        [1, 3, 3, 3, 3, 1, 0],
        [0, 1, 2, 1, 1, 0, 1],
    ]
    colours = {0: HEAT_LOW, 1: (243, 231, 214), 2: HEAT_MID, 3: PRIMARY}
    gx = card_x + inner_pad
    gy = card_y + inner_pad
    for r, row in enumerate(heat):
        for c, level in enumerate(row):
            x0 = gx + c * (cell + gap)
            y0 = gy + r * (cell + gap)
            rounded(d, [x0, y0, x0 + cell, y0 + cell], 10 * s, colours[level])

    d.text((gx, gy + rows * (cell + gap) + 8 * s), "6 of 6 free  \u00b7  Fri 12 \u2013 Mon 15", font=label, fill=INK)

    img.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
