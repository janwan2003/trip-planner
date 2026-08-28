# Product Hunt launch sheet

**Everything Product Hunt asks for, in the order it asks, ready to paste.** No
cross-referencing: the copy is inline here even where it duplicates
[launch-copy.md](launch-copy.md).

## Why this is a manual job

Product Hunt cannot be submitted by an agent, and this was checked three ways on
2026-08-28:

| Route | Result |
| --- | --- |
| Automated Chrome | Cloudflare interstitial, never clears |
| Second, independent automated browser | Hard block: "Sorry, you have been blocked… Ray ID a324fc9b3af36527" |
| API v2 | **No create-post mutation exists.** Write scope is partial and approval-only ("get in touch with us"), and the terms state the API "must not be used for commercial purposes" |

So this file is the deliverable, not a listing. Everything below is prepared; the clicking
is yours.

## Assets, already built

| Field | File | Size |
| --- | --- | --- |
| Thumbnail | `marketing/assets/ph-thumbnail-240.png` | 240×240 — PH's stated minimum. Regenerate with `python3 scripts/generate-ph-thumbnail.py` |
| Gallery 1 | `marketing/assets/gallery/ph-1.png` | 1270×760 |
| Gallery 2 | `marketing/assets/gallery/ph-2.png` | 1270×760 |
| Gallery 3 | `marketing/assets/gallery/ph-3.png` | 1270×760 |
| Gallery 4 | `marketing/assets/gallery/ph-4.png` | 1270×760 |
| Video | `https://youtu.be/__WmHyLytdI` | 0:48, public. Paste the URL; PH embeds it |

Gallery slides regenerate with `python3 scripts/generate-gallery-images.py`.

## The fields

**Name**

```
WeGoWhen
```

**Tagline** (60 characters max — this one is 57)

```
Find the days your whole group is actually free to travel
```

**Description** (260 max)

```
Group trips die in the date argument. WeGoWhen gives you one link to share: everyone taps the days they are free, and it returns the ranked consecutive date ranges that fit the most people — "these six can all go Fri 12 to Mon 15". No accounts, no emails.
```

**Links**

| Field | Value |
| --- | --- |
| Website | `https://wegowhen.com` |
| GitHub | `https://github.com/janwan2003/trip-planner` |
| X / Twitter | leave blank — there is no product account |

**Topics** — PH allows three. In priority order, take the first three that its autocomplete
actually offers:

```
Productivity · Travel · Calendar · Scheduling · Web App
```

**Pricing:** Free · **Platforms:** Web

**Promo code:** none.

**Makers:** yourself only. Do not add anyone who did not build it.

## First comment — post it yourself, immediately after the launch goes live

```
Hi Product Hunt.

I built WeGoWhen because every group trip I have tried to organise died in the same place: a chat thread where everyone says which weekend does not work for them, and nobody can hold it in their head.

Every scheduling tool I tried answered a different question. When2meet, Doodle and the rest are built for "which hour suits everyone" — the output is a grid of ticks over time slots. A trip is not an hour. It is a stretch of days, and what you actually want to know is which stretch the most people can make.

So that is what this does. The organiser picks an outer window and shares one link. Everyone else taps the days they are free — on a phone, in under a minute, no account, no email address. Then instead of showing you a grid, it names the answer: the consecutive date ranges that work, ranked by how many people they include and then by how long they are.

One honest note. It is new — it went live at the end of August and I am the only person who has used it in anger, so I would rather have your criticism than your upvote.

The thing I would most like feedback on: does the ranked-ranges output actually read as the answer, or do you still find yourself wanting the grid?
```

## Timing

- A Product Hunt day runs **00:01 to 23:59 Pacific**. Ranking is within the day, so
  launching at 00:01 PT gives the full 24 hours and launching at 14:00 PT gives nine.
- **Tue/Wed/Thu** are the competitive days; **Sat/Sun** are quieter, which for a first
  launch with no audience is arguably better — a top-5 on a Sunday beats page three on a
  Wednesday.
- You can schedule rather than publish live. Do that, so the launch does not depend on you
  being awake at 09:01 CET.

## On the day

1. Post the first comment above within a minute of going live.
2. Reply to every comment inside 30 minutes for the first few hours. This matters more than
   anything else on the list.
3. **Never ask for upvotes** — not in the comment, not in DMs, not in a group chat. It is
   against PH's rules, it is detectable, and it gets launches removed.
4. Tell people it launched; let them decide what to do. Sharing the link is fine, asking for
   the vote is not.
5. If it places top 5, the badge is a real dofollow-ish asset — add it to the footer next to
   the others in `index.html`, not in React, or verifiers will not see it.

## What this copy deliberately does not say

No user counts, no ratings, no testimonials, no "trusted by" line. There are zero users, and
the first comment says so outright. That is a choice: on Product Hunt an honest "this is new
and I want criticism" outperforms a confident claim a maker cannot back, and it cannot be
contradicted by anyone in the comments.
