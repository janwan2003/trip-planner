# Product Hunt launch sheet

**Everything Product Hunt asks for, in the order it asks, ready to paste.** No
cross-referencing: the copy is inline here even where it duplicates
[launch-copy.md](launch-copy.md).

## Why this is a manual job

Product Hunt cannot be submitted by an agent, and this was checked three ways on
2026-08-28:

| Route | Result |
| --- | --- |
| API v2 | **No create-post mutation exists.** Write scope is partial and approval-only ("get in touch with us"), and the terms state the API "must not be used for commercial purposes" |
| Browser | Reachable. Needs a signed-in account, which is an account action rather than a wall |

An earlier version of this file claimed Cloudflare hard-blocks the site in two independent
automated browsers. That was **wrong**: it was a VPN on the dev machine. With the VPN off,
producthunt.com loads normally in the same automated browser. The API limitation is the real
one and it is not going away, so this file is still the deliverable — everything below is
prepared and the clicking is yours.

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
I built WeGoWhen because every time I planned a holiday with friends, we struggled to agree on dates. There are plenty of tools that help you find the best hour for a meeting, but none that finds the longest continuous stretch of days when you could actually go on a ski trip with your friends.

I built it on a few rules: simplicity first, no clutter in the UI, intuitive, easy to use. No logins, no accounts, and everything you need to see on the screen in front of you.

You get both halves of the answer. The ranked date ranges name the stretches that work and how many people each one fits. The heat map next to them shows the shape of the whole month at a glance, which is what makes the ranking easy to read — you can see why a range won rather than taking it on trust. And you can click on people to recompute everything for just a subset of the group, which is how you find out that five of you can go if one person sits this one out.

Let me know your feedback.
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

No user counts, no ratings, no testimonials, no "trusted by" line — there are zero users, and
inventing traction is the one thing a maker cannot walk back.

It also does not apologise. An earlier draft of this comment carried an "honest note" saying
the product was new and asking for criticism rather than upvotes. The owner cut it, and he is
right: it buys nothing and it frames the product as unfinished before anyone has looked at it.
State what it does and ask for feedback.

**And it does not treat the heat map as the enemy.** The pitch is *not* "ranked answers
instead of a grid". Other tools answer the wrong question — which hour, rather than which
stretch of days — and the grid is not what is wrong with them. In WeGoWhen the per-day heat
map is half the product: it is what makes the ranked ranges legible, because you can see why
a range won. Copy that sells the ranking by attacking grids sells the product short.
