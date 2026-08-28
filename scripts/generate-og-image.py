#!/usr/bin/env python3
"""Regenerate public/og-image.png, the 1200x630 link preview card.

Run when the brand palette, the wordmark or the headline changes:

    python3 scripts/generate-og-image.py

Needs Pillow. Palette, fonts and the small drawing helpers come from scripts/brand.py.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

from brand import (
    BORDER,
    CARD,
    CREAM,
    HEAT_LOW,
    HEAT_MID,
    INK,
    MUTED_INK,
    PRIMARY,
    font,
    rounded,
    wrap,
)

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-image.png"
LOGO = ROOT / "public" / "logo.png"

W, H = 1200, 630
SCALE = 2  # supersample, then downscale, so text and corners stay crisp


def face(name: str, size: int, weight: int):
    """A brand face at a supersampled pixel size, with the optical size set from the
    size it will appear at once the image is scaled back down."""
    return font(name, size * SCALE, weight, optical_size=size)


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
    d.text((pad + mark + 6 * s, pad), "WeGoWhen", font=face("fraunces", 36, 600), fill=INK)

    # --- headline --------------------------------------------------------
    head = face("fraunces", 58, 600)
    y = pad + 104 * s
    for line in wrap("Find the days everyone can actually go.", head, column):
        d.text((pad, y), line, font=head, fill=INK)
        y += 70 * s

    sub = face("dmsans", 26, 400)
    y += 20 * s
    body = "Everyone taps the days they are free. WeGoWhen ranks the date ranges that fit the most people."
    for line in wrap(body, sub, column):
        d.text((pad, y), line, font=sub, fill=MUTED_INK)
        y += 37 * s

    # --- footer line -----------------------------------------------------
    foot = face("dmsans", 25, 500)
    fy = H * s - pad - 26 * s
    domain = "wegowhen.com"
    d.text((pad, fy), domain, font=foot, fill=PRIMARY)
    x = pad + foot.getlength(domain) + 20 * s
    d.text((x, fy), "·", font=foot, fill=BORDER)
    d.text((x + 20 * s, fy), "No account. Just a link.", font=foot, fill=MUTED_INK)

    # --- the product's signature: a heat-mapped month with a winning run -
    # 7 columns x 4 rows of day cells; the third row carries a run of four
    # consecutive days the whole group is free, which is the answer the app gives.
    cell, gap = 44 * s, 10 * s
    rows, cols = 4, 7
    grid_w = cols * cell + (cols - 1) * gap
    label = face("dmsans", 22, 600)
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

    d.text(
        (gx, gy + rows * (cell + gap) + 8 * s),
        "6 of 6 free  ·  Fri 12 – Mon 15",
        font=label,
        fill=INK,
    )

    img.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
