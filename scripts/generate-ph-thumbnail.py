#!/usr/bin/env python3
"""Build the 240x240 square thumbnail Product Hunt shows next to the listing.

    python3 scripts/generate-ph-thumbnail.py

Writes marketing/assets/ph-thumbnail-240.png.

Product Hunt renders this small and on both light and dark chrome, so the mark sits on
the brand cream rather than on transparency: a transparent PNG picks up whatever is
behind it and the orange pin loses its edge against a dark background.

240x240 is Product Hunt's stated minimum for the thumbnail. The source is
public/favicon.png, which is the same mark the site and the share card use, so the three
cannot drift apart.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

from brand import CREAM

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "favicon.png"
OUT = ROOT / "marketing" / "assets" / "ph-thumbnail-240.png"

SIZE = 240
# The pin has its own internal whitespace, so 12% padding is enough to keep it off the
# edge without making the mark look lost at thumbnail scale.
PADDING = round(SIZE * 0.12)


def main() -> None:
    mark = Image.open(SRC).convert("RGBA")
    inner = SIZE - 2 * PADDING
    mark = mark.resize((inner, inner), Image.LANCZOS)

    canvas = Image.new("RGB", (SIZE, SIZE), CREAM)
    canvas.paste(mark, (PADDING, PADDING), mark)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(OUT, optimize=True)
    print(f"wrote {OUT.relative_to(ROOT)} at {canvas.size[0]}x{canvas.size[1]}")


if __name__ == "__main__":
    main()
