# /brag plan — WeGoWhen

**What it is:** a free web app that finds the stretch of days a group of friends can all
travel, from one shared link.
**For:** the one friend who always ends up organising the trip.
**What sets it apart:** whole trips, not meeting slots. It answers "these six people can all
go for these five days", not "which hour on Tuesday". No accounts, nothing for friends to
sign up to.
**Most impressive claim:** it ranks the actual date ranges for you (Best Dates) instead of
leaving a grid of ticks to decode.
**Visual hook:** the group-chat mess everybody knows, then the heat map filling in.
**Real UI shown:** the home page, the create-trip form being filled in, the calendar being
dragged across, the group heat map, the Best Dates card. All filmed from the real app
(`wrangler pages dev`, a throwaway local D1, a made-up demo trip).
**Tone:** `default`: warm, punchy, clean. Uses the app's own palette (cream `40 33% 98%`,
terracotta `16 65% 44%`, amber accent) and fonts (Fraunces for display, DM Sans for body).
**Share caption:** see `share-copy.txt`.

## Angle

"Planning a trip in the group chat?" A trip is a stretch of days, not an hour. Show the
chaos, then the tool quietly fixing it in four real screens.

## Storyboard (landscape 1920×1080, 30fps, ~22.5s)

Music: `happy-beats-business-moves-vol-10` (≈110 BPM, beat ≈0.545s). The logo lands on the
strong beat at ≈20.2s.

| # | Time | Scene | On screen | Sound |
|---|---|---|---|---|
| 1 | 0.0–3.8 | Hook | Four chat bubbles pop in on the beat ("who's free in June?", "I can do the 12th-ish", "not the weekend of the 19th", "wait, which June??"), blur back; headline "Planning a trip in the group chat?" | soft pops per bubble |
| 2 | 3.8–6.6 | Reveal | Real home page slides up, slow push-in on the real h1 "Find the days your group can actually go" | whoosh-free soft switch |
| 3 | 6.6–9.6 | Create | Real form card: "Lisbon, June 2027" types in, dates fill, cursor clicks Create Trip. Caption: "Name it. Pick the dates. Share the link." | quiet key taps, click |
| 4 | 9.6–13.4 | Mark | Real calendar: cursor drags June 10 → 16, cells fill. Caption: "Friends drag across the days they're free." Sub: "No account, no email." | soft ticks under music |
| 5 | 13.4–16.6 | Heat map | Real group heat map fills in person by person, 1 → 6. Caption: "Watch the group's days light up." | soft rising taps |
| 6 | 16.6–19.4 | Best dates | Real Best Dates card, top range highlighted. Caption: "Get the days everyone can actually go." | one soft bell |
| 7 | 19.4–22.5 | Outro | Logo + WeGoWhen, "wegowhen.com", "Free. No accounts. Just a link." | music resolves, fade |

Durations: 3.8 + 2.8 + 3.0 + 3.8 + 3.2 + 2.8 + 3.1 = 22.5s.
