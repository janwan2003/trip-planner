"""Brand palette and font loading, shared by the image generators in this directory.

The colours are the app's own design tokens from `src/index.css`, converted from HSL to
RGB. If the palette changes there, change it here, or the generated images stop looking
like the product.

Both faces ship as variable fonts and are fetched from the google/fonts repository into
a local cache on first use. Both are OFL licensed; only the rendered PNGs are committed.
"""
from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

CACHE = Path.home() / ".cache" / "wegowhen-fonts"

FONT_URLS = {
    "fraunces": "https://github.com/google/fonts/raw/main/ofl/fraunces/Fraunces%5BSOFT%2CWONK%2Copsz%2Cwght%5D.ttf",
    "dmsans": "https://github.com/google/fonts/raw/main/ofl/dmsans/DMSans%5Bopsz%2Cwght%5D.ttf",
}

CREAM = (252, 250, 246)        # --background 40 33% 98%
INK = (49, 37, 27)             # --foreground 25 30% 15%
MUTED_INK = (132, 116, 99)     # --muted-foreground 25 15% 45%
PRIMARY = (217, 118, 74)       # --primary 16 65% 55%
HEAT_LOW = (243, 240, 233)     # --heat-low 40 20% 94%
HEAT_MID = (232, 199, 155)     # --heat-medium 35 60% 75%
BORDER = (229, 221, 209)       # --border 35 20% 88%
CARD = (255, 255, 255)


def font(name: str, size: int, weight: int, optical_size: float | None = None) -> ImageFont.FreeTypeFont:
    """One instance of a brand face. `size` is in pixels of the image being drawn, so
    pass `optical_size` separately when drawing supersampled."""
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / f"{name}.ttf"
    if not path.exists():
        urllib.request.urlretrieve(FONT_URLS[name], path)  # noqa: S310 - fixed https URLs
    f = ImageFont.truetype(str(path), size)
    wanted = {
        "weight": weight,
        "optical size": optical_size if optical_size is not None else size,
        "wonky": 0,
        "softness": 0,
    }
    try:
        axes = f.get_variation_axes()
    except OSError:
        return f  # a static build of the font: accept the default instance
    values = []
    for axis in axes:
        label = axis["name"].decode() if isinstance(axis["name"], bytes) else axis["name"]
        target = wanted.get(label.strip().lower(), axis["default"])
        values.append(max(axis["minimum"], min(axis["maximum"], target)))
    f.set_variation_by_axes(values)
    return f


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


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def fit(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    """Scale an image to fit inside `box` without distorting it."""
    copy = image.copy()
    copy.thumbnail(box, Image.LANCZOS)
    return copy
