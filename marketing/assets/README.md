# Screenshots and gallery images

Everything here is generated, and reproducible. Nothing is a mock-up: each image is the
real app, running against a local `wrangler pages dev` with a local D1, so no demo data
ever touches production.

## Regenerating

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
pnpm run build
pnpm exec wrangler pages dev --port 8794 --ip 127.0.0.1 &
scripts/seed-demo-trip.sh                     # six people, one obvious winning range
```

Then the screenshots, at a device scale factor of 2 so they downscale sharply:

```bash
shot() { google-chrome --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size="$2" --virtual-time-budget=9000 \
  --screenshot="$3" "$1"; }

cd marketing/assets
shot http://127.0.0.1:8794/                        1440,900  01-home-desktop.png
shot http://127.0.0.1:8794/trip/alps26             1440,1150 02-trip-desktop.png
shot http://127.0.0.1:8794/when2meet-alternative   1440,1000 05-when2meet-comparison.png
shot http://127.0.0.1:8794/faq                     1440,1000 08-faq.png
shot http://127.0.0.1:8794/                        390,844   06-home-mobile.png
shot http://127.0.0.1:8794/trip/alps26             390,1000  07-trip-mobile.png
```

`03-best-dates.png`, `04-heatmap.png` and `09-mobile-calendar.png` are crops of
`02-trip-desktop.png` and `07-trip-mobile.png`. Then:

```bash
python3 scripts/generate-gallery-images.py    # gallery/ph-1..4.png at 1270x760
```

## What each one is for

| File | Size | Use |
| --- | --- | --- |
| `01-home-desktop.png` | 2880×1800 | Directory listings, "the product" shot |
| `02-trip-desktop.png` | 2880×2300 | The one that shows the whole idea: heat map plus ranked ranges |
| `03-best-dates.png` | 732×976 | The output, close up. The single most persuasive image here |
| `04-heatmap.png` | 1500×1372 | Per-day consensus, close up |
| `05-when2meet-comparison.png` | 2880×2000 | For posts about the When2meet comparison |
| `06-home-mobile.png` | 780×1688 | "Works on a phone" |
| `07-trip-mobile.png` | 780×2000 | Mobile trip page, full |
| `08-faq.png` | 2880×2000 | Rarely needed; here for completeness |
| `09-mobile-calendar.png` | 752×910 | Mobile crop where the calendar is actually readable |
| `gallery/ph-1..4.png` | 1270×760 | Product Hunt gallery, in order |

## The demo trip

"Ski week in the Alps", 4–27 December 2026, six participants — Ada, Ben, Chidi, Dana,
Elif, Frank. All six are free Friday 11 to Monday 14 December, which is why the top row
of Best Dates reads **6 of 6, 11 Dec – 14 Dec, 4 days**, with a five-person weekend and a
longer four-person stretch below it. The data is deliberately uneven: a demo where
everyone is free for everything shows nothing.

## Still missing

A 60–90 second demo video. Product Hunt launches with video get materially more
engagement, and none of the above substitutes for it. Screen-record the real flow:
create a trip, share the link, two people mark availability, the answer appears.
