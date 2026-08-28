# Submission copy

Paste-ready. Every field a directory asks for, at the length it asks for it.

Two rules while using this file. **Vary the long description by tier** — the same 150 words
on forty sites is duplicate content, and the engines that decide whether an AI answer cites
you cross-reference it. And **claim nothing about traction**: there are no users, no
reviews and no press, so no variant here contains a number about adoption. If a form has a
"customers" or "traction" field, leave it empty rather than fill it.

## Fixed fields

| Field | Value |
| --- | --- |
| Name | WeGoWhen |
| URL | https://wegowhen.com |
| Category | Productivity / Scheduling / Travel |
| Pricing | Free |
| Platforms | Web (mobile browser and desktop) |
| Launch date | 2026-08-28 |
| Login required to use | No |
| Account required to use | No |
| Open source | No |
| Contact | jan@wangrat.com |
| Repository | https://github.com/janwan2003/trip-planner |
| Logo | `public/logo.png` (2176×1984, transparent), `public/favicon.png` (1200×1200 square) |
| Share card | `public/og-image.png` (1200×630) |

## Taglines

| Limit | Copy | Chars |
| --- | --- | --- |
| 30 | Group trip dates, solved | 24 |
| 40 | Find the days everyone can go | 29 |
| 50 | When2meet, but for whole days instead of hours | 45 |
| 60 | Find the days your whole group is actually free to travel | 56 |
| 10 words | Share a link, find the days everyone can travel | 8 words |

Use the "When2meet, but for..." line only where the audience knows When2meet — dev,
startup and student channels. On a travel directory it means nothing.

## Short descriptions

**60 characters**
> Find the dates a group can actually travel together.

**100 characters**
> Everyone taps the days they are free. WeGoWhen ranks the date ranges that fit the most people.

**140 characters (X/Twitter, and most directory "short" fields)**
> Group trips die in the date argument. Share one WeGoWhen link, everyone marks the days they are free, and you get the ranges that work.

**260 characters (Product Hunt description field)**
> Group trips die in the date argument. WeGoWhen gives you one link to share: everyone taps the days they are free, and it returns the ranked consecutive date ranges that fit the most people — "these six can all go Fri 12 to Mon 15". No accounts, no emails.

## Long descriptions

### Variant A — startup and launch directories (Product Hunt, BetaList, Uneed, Fazier, Microlaunch)

Lead with the outcome; the audience is other builders.

> Every group trip stalls in the same place: a chat thread where eleven people each say
> which weekend does not work for them, and nobody can hold it all in their head.
>
> WeGoWhen replaces that thread with one link. The organiser sets an outer date range,
> shares the link, and everyone else taps the days they are free — on a phone, in under a
> minute, with no account and no email address. A heat map shows how many people are free
> on each day, and underneath it WeGoWhen names the answer: the ranked consecutive date
> ranges that fit the most people, longest first. "Six of six free, Fri 12 to Mon 15."
>
> Meeting pollers answer "which hour suits everyone". A trip is not an hour, it is a
> stretch of days, and that turns out to be a different problem — the useful output is a
> range, not a cell in a grid.
>
> Free, no sign-up, nothing to install.

### Variant B — SaaS and alternative directories (AlternativeTo, SaaSHub, Slant, OpenAlternative)

Lead with the alternative framing; these audiences arrive by searching for a replacement.

> WeGoWhen is a free alternative to When2meet, Doodle, LettuceMeet and WhenIsGood for the
> case those tools handle badly: picking the dates of a multi-day trip rather than the
> hour of a meeting.
>
> The organiser sets an outer window and shares one link. Each person taps the days they
> are free — no account, no email, no login. WeGoWhen then does the part a grid leaves to
> you: it works out the maximal runs of consecutive days that a subset of the group is
> all free for, and ranks them by how many people they include, then by how long they are.
> The output is a shortlist of concrete date ranges rather than something to interpret
> yourself.
>
> Next to it, a per-day heat map shows how many people are free across the whole window, so
> you can see why a range won instead of taking the ranking on trust. Clicking a participant
> recomputes everything for just a subset, and names are editable so someone can fix a typo
> or drop out.
>
> Web, mobile-first, free.

### Variant C — developer and technical directories (DevHunt, Show HN, Dev.to, Slashdot)

Lead with the substance; this audience rewards a real mechanism and punishes marketing.

> WeGoWhen finds the days a group can travel together. The interesting part is the output:
> instead of rendering an availability grid and leaving the reading to you, it walks every
> run of consecutive days carrying a bitmask intersection of who is free, emits a candidate
> where that intersection is about to shrink, and ranks what remains by group size, then
> length, then date. Every emitted set is maximal for its range by construction, so there
> is no dominance check to run afterwards.
>
> The first version enumerated participant subsets instead — 2^n, which locked up the tab
> around twenty people, and at n = 31 `1 << 31` went negative in JavaScript so the loop
> never ran and the feature silently returned nothing. The intersection walk removes the
> cliff rather than moving it: 60 people across 90 days answers in under three seconds.
>
> The stack is deliberately small: a React SPA on Cloudflare Pages, Cloudflare Pages
> Functions for the API, and Cloudflare D1 for storage. No third-party backend, no auth
> provider, no accounts — identity is a typed name plus possession of the trip link, which
> is the whole invitation mechanic.

The 2^n paragraph is the strongest thing in this file for a technical audience: a bug
found, explained and fixed reads as competence in a way a feature list never does. It
describes `src/lib/bestDates.ts` as of 2026-08-28; the numbers come from that module's
own tests, so re-read them if the algorithm changes again.

## Tags

Pick five to eight per directory, closest first:

`group travel` · `trip planning` · `scheduling` · `availability` · `calendar` ·
`group coordination` · `date picker` · `when2meet alternative` · `doodle alternative` ·
`no signup` · `productivity` · `travel`

## Founder note

Two to three sentences, asked for by Product Hunt's first comment, BetaList and F6S.
**Check this against what actually happened before pasting it** — it is written from the
product, not from you, and the specifics are yours to correct:

> I built WeGoWhen after trying to get a group of friends onto the same week off and
> watching the thread collapse into a hundred messages. Every scheduling tool I tried
> answered a different question — which hour works — and left me to read a grid and do the
> ranges in my head. So this one answers the question I actually had: which stretch of days
> can the most of us actually go.

## Assets still missing

Every Tier 1 directory asks for these, and the submissions stall without them.

| Asset | Status |
| --- | --- |
| Square logo, 1024×1024 | `public/favicon.png` is 1200×1200 — downscale, no new artwork needed |
| Share card, 1200×630 | Done: `public/og-image.png` |
| 5–8 product screenshots | Done: nine in `assets/`, taken at a device scale factor of 2 against a local `wrangler pages dev`. `assets/03-best-dates.png` is the persuasive one |
| Gallery images, 1270×760 (Product Hunt) | Done: `assets/gallery/ph-1..4.png`, in order |
| 60–90 second demo video | Done: 48s, captioned, at `assets/demo-1080p.mp4`, plus an 8s loop and a poster frame. Product Hunt wants a YouTube URL rather than a file, so it needs uploading first |
| Pricing page | Satisfied by the homepage: "Free, no account, and nothing for your friends to sign up to" under the form, and the FAQ answers it directly. Point the pricing field at `https://wegowhen.com/faq` |

Everything in `assets/` is the real app, not a mock-up, and reproducible —
`assets/README.md` has the exact commands, and `scripts/seed-demo-trip.sh` creates the
demo trip. The demo data lives in a local D1 and never touches production.
