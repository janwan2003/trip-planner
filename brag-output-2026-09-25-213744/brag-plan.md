# /brag plan: WeGoWhen, "person showing the tool" cut

**Brief from the owner:** it shouldn't feel like a commercial at all. It should look like a
real person showing the tool, with less polished visuals.

**Format:** vertical 1080×1920, 30fps, 37s. One continuous phone screen recording with
three plain jump cuts and captions like someone typed them into the app's own text tool.
No zooms, motion graphics, brand colours or end card.

## What makes it read as a person, not an ad

- It's a real session at human speed, not assembled screenshots. `work/record.mjs` drives
  the real mobile page (390px, 3x) through Chrome's screencast, so the recording has the
  real transitions, toasts and scrolling. The pauses are real, and so are the fiddly bits:
  a typo ("Lisbno") gets fixed, the date picker opens on the wrong month and takes two
  taps forward, "Link copied!" pops up, and a single day gets tapped after the drag.
- Taps show as a grey touch dot, like "show touches" on a phone.
- Captions are first person, lowercase and plain: white on a translucent black box in a
  system sans. They cut on and off with no animation.
- The only "later" is a jump cut captioned "a few days later…". Five made-up friends
  answered through the API between the takes.
- `brag.mp4` has a quiet music bed. `brag-no-music.mp4` is the same cut with no audio, for
  your own voice or a trending sound.

## Edit (recording seconds → output)

| Output | Recording | What happens | Caption |
|---|---|---|---|
| 0.0–14.0 | 0.9–14.9 | Home page, type the trip name (typo fixed), pick Nov 1 – 30, Create Trip | planning trips in the group chat never works, so i built this / you name the trip and pick roughly when |
| 14.0–29.0 | 15.4–30.4 | Tap Share ("Link copied!"), type "Jess", drag across the days, tap one more, Save | then drop the link in the group chat / everyone adds their name and drags over the days they're free / no app, no account, nobody has to sign up |
| 29.0–37.0 | 32.6–40.6 | Jump cut: six participants, back to trip view, scroll to Best Dates (Nov 12 – 16, 6/6), then the heat map | a few days later… / and it shows you the dates that work for everyone / it's free btw: wegowhen.com |

Filmed against `wrangler pages dev` with a throwaway local D1 (never production).
