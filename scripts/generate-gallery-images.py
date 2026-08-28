#!/usr/bin/env python3
"""Build the Product Hunt gallery images from the raw screenshots.

    python3 scripts/generate-gallery-images.py

Reads marketing/assets/*.png — the screenshots taken against a local
`wrangler pages dev`, see marketing/assets/README.md — and writes
marketing/assets/gallery/*.png at 1270x760, the size Product Hunt renders.

Each slide is one caption and one screenshot on the brand background. The captions
are claims about what the product does, and nothing here says anything about adoption:
there is none to report.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

from brand import BORDER, CARD, CREAM, INK, MUTED_INK, font, wrap

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "marketing" / "assets"
OUT_DIR = ASSETS / "gallery"

W, H = 1270, 760

SLIDES = [
    # (screenshot, heading, body, fit)
    # "top" scales to the frame width and keeps the top of the page, which is where the
    # story is. "contain" fits the whole image, for the cropped cards that are already
    # exactly the thing worth showing.
    (
        "01-home-desktop.png",
        "Share one link. No accounts.",
        "The organiser sets an outer window and sends the link through whatever chat the group already uses.",
        "top",
    ),
    (
        "04-heatmap.png",
        "Everyone taps the days they are free",
        "A heat map shows how many people can make each day, so consensus is readable at a glance.",
        "contain",
    ),
    (
        "03-best-dates.png",
        "Get the answer, not a grid",
        "The consecutive date ranges that work, ranked by how many people can make the whole stretch.",
        "contain",
    ),
    (
        "09-mobile-calendar.png",
        "Built for the phone it arrives on",
        "Tap a day, or hold and drag across several. A participant is finished in under a minute.",
        "contain",
    ),
]


def slide(source: Path, heading: str, body: str, mode: str) -> Image.Image:
    img = Image.new("RGB", (W, H), CREAM)
    d = ImageDraw.Draw(img)

    pad = 48
    head_font = font("fraunces", 38, 600)
    body_font = font("dmsans", 20, 400)

    y = pad
    for line in wrap(heading, head_font, W - 2 * pad):
        d.text((pad, y), line, font=head_font, fill=INK)
        y += 46
    y += 4
    for line in wrap(body, body_font, W - 2 * pad):
        d.text((pad, y), line, font=body_font, fill=MUTED_INK)
        y += 28

    frame_top = y + 22
    frame_w = W - 2 * pad
    frame_h = H - frame_top - pad // 2

    shot = Image.open(source).convert("RGB")
    if mode == "contain":
        scale = min(frame_w / shot.width, frame_h / shot.height)
    else:
        scale = frame_w / shot.width
    # Never enlarge past native resolution: the screenshots are taken at a device scale
    # factor of 2, so downscaling is what keeps them sharp.
    scale = min(scale, 1.0)
    shot = shot.resize((max(1, round(shot.width * scale)), max(1, round(shot.height * scale))), Image.LANCZOS)
    if shot.height > frame_h:
        shot = shot.crop((0, 0, shot.width, frame_h))

    x = pad + (frame_w - shot.width) // 2
    d.rounded_rectangle(
        [x - 2, frame_top - 2, x + shot.width + 2, frame_top + shot.height + 2],
        radius=14,
        fill=CARD,
        outline=BORDER,
        width=2,
    )
    img.paste(shot, (x, frame_top))
    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for index, (source, heading, body, mode) in enumerate(SLIDES, start=1):
        out = OUT_DIR / f"ph-{index}.png"
        slide(ASSETS / source, heading, body, mode).save(out, optimize=True)
        print(f"wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
