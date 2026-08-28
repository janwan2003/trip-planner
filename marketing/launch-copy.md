# Launch copy

Drafts, ready to post. Read [README.md](README.md) first: the launch comes *after* the
destination pages and the batch 1 submissions, not before them. A launch day is spendable
once.

Timing: Product Hunt at 00:01 Pacific on a Tuesday, Wednesday or Thursday. Given the
seasonality in [keywords.md](keywords.md) — When2meet's demand triples into September — the
week of **Tuesday 8 September 2026** is the right window, and it also leaves time for the
video and screenshots.

## Product Hunt

**Name:** WeGoWhen
**Tagline (60):** Find the days your whole group is actually free to travel
**Description (260):**

> Group trips die in the date argument. WeGoWhen gives you one link to share: everyone taps
> the days they are free, and it returns the ranked consecutive date ranges that fit the
> most people — "these six can all go Fri 12 to Mon 15". No accounts, no emails.

**Topics:** Productivity, Travel, Calendar, Scheduling, Web App

**First comment — post this yourself, immediately after launching:**

> I built WeGoWhen because every time I planned a holiday with friends, we struggled to agree on dates. There are plenty of tools that help you find the best hour for a meeting, but none that finds the longest continuous stretch of days when you could actually go on a ski trip with your friends.
>
> I built it on a few rules: simplicity first, no clutter in the UI, intuitive, easy to use. No logins, no accounts, and everything you need to see on the screen in front of you.
>
> You get both halves of the answer. The ranked date ranges name the stretches that work and how many people each one fits. The heat map next to them shows the shape of the whole month at a glance, which is what makes the ranking easy to read — you can see why a range won rather than taking it on trust. And you can click on people to recompute everything for just a subset of the group, which is how you find out that five of you can go if one person sits this one out.
>
> Let me know your feedback.

Never ask for upvotes. Reply to every comment inside 30 minutes — that is what actually
moves a launch.

## Show HN

**Title:** `Show HN: WeGoWhen – group trip date picker that returns date ranges, not a grid`

Keep the title under 80 characters and do not put "launch" in it.

**Body:**

> Every group-scheduling tool I could find answers "which hour suits everyone" and renders
> an availability grid. For a trip the unit is a run of days, and the useful output is a
> shortlist of ranges, so I wrote the ranking instead of the grid: walk the consecutive-day
> ranges carrying a bitmask intersection of who is free across the whole range, emit a
> candidate wherever that intersection is about to shrink, and rank what comes out by group
> size, then length, then date.
>
> The whole thing is on Cloudflare — Pages for the SPA, Pages Functions for the API, D1 for
> storage — with no auth provider and no accounts. Identity is a typed name plus possession
> of the link, which is deliberate: a participant who arrives from a group chat should be
> finished in a minute and never come back. The schema applies itself idempotently on the
> first request, because doing it out of band would have needed an account-wide Cloudflare
> credential in CI.
>
> The first version got this wrong in an instructive way. It enumerated participant subsets
> — 2^n — which locked up the tab around twenty people, and at n = 31 `1 << 31` is negative
> in JavaScript, so the loop body never ran and the feature silently returned nothing at
> all. Past 31 it was worse than missing: on a 35-person trip where all 35 were free for the
> same five days, it offered that range to 6 of them. The subsets were never the interesting
> objects — for any stretch of days, the people who can make all of it are already
> determined — so carrying the intersection while walking ranges is enough, and holding it
> as a BigInt rather than a 32-bit int removes the cliff instead of moving it to 53. Sixty
> people across ninety days now answers in under three seconds.
>
> https://wegowhen.com — no signup, and the source is at
> https://github.com/janwan2003/trip-planner

Show HN rewards the mechanism and punishes the pitch. The `1 << 31` paragraph is the
strongest thing in this draft: that audience recognises the bug on sight, and a post that
hands over its own worst one reads very differently from a post that does not.

## Reddit

Different post per subreddit. Same product, different reason for the reader to care.
Check each sub's rules the day you post; several require a specific thread or day.

### r/InternetIsBeautiful

> **Title:** Everyone taps the days they're free and it tells you which stretch of days the
> most people can go
>
> No signup, no email, nothing to install. You set an outer window, share one link, and
> everyone marks their free days on a calendar. It then lists the actual date ranges that
> work, ranked by how many people they fit — rather than showing you a grid and letting you
> work it out.
>
> I made it because meeting pollers are built around hours and a trip is built around days.
> Free, and I am not collecting anything: there are no accounts.

### r/SideProject

> **Title:** I got tired of group trips dying in the date argument, so I built the thing
> that names the answer instead of showing a grid
>
> [Two paragraphs on the build: the Cloudflare-only stack, why there are no accounts, and
> the one thing that surprised you. Keep it about what you learned — this sub rewards the
> lesson, not the pitch.]
>
> https://wegowhen.com — free, no signup. Happy to answer anything about the stack.

Fill the bracket in yourself. A generic version of that paragraph is worse than no post.

### r/webdev — Showoff Saturday only

Use the Show HN body, trimmed. Lead with the algorithm and the Cloudflare-only stack.

### The r/opensource "I made a better when2meet" thread

One comment, not a post. It ranks #1 in Google for "when2meet alternative", which is the
keyword this whole plan targets, and it is still live two years on.

> Late to this, and I built a different thing so take it as such: When2meet-shaped tools
> all assume the unit is an hour. If what you are trying to pick is the dates of a trip,
> the answer you want is a range of days, so I ended up writing
> [wegowhen.com](https://wegowhen.com) — everyone marks free days, and it returns the
> consecutive ranges that fit the most people rather than a grid. Same no-account,
> share-a-link model as Timeful and When2meet.

Only post this once the licence question in [directories.md](directories.md) is settled —
in that subreddit, linking a closed-source tool as if it belongs is how you get downvoted.

## X / Twitter

> Group trips die in the date argument.
>
> Every scheduling tool answers "which hour suits everyone". A trip isn't an hour.
>
> So: share one link, everyone taps the days they're free, and you get the ranked stretches
> of days that fit the most people. No accounts.
>
> wegowhen.com

Follow with a build-in-public thread on the ranking, the Cloudflare-only stack, and the
no-accounts decision. The technical thread is what gets indexed and quoted.

## LinkedIn

> Every group trip I have organised died in the same place — a chat thread where eleven
> people each say which weekend doesn't work, and nobody can hold it in their head.
>
> The tools we reach for are the wrong shape. When2meet, Doodle and the rest are built to
> find an hour: you get a grid of time slots and you read the consensus yourself. A
> trip isn't an hour. It's a stretch of days, and the question is which stretch the most
> people can actually make.
>
> So I built the answer instead of the grid. One link, everyone taps the days they're free,
> and it returns the consecutive date ranges ranked by how many people they fit. No
> accounts, no email addresses — a participant arriving from a group chat should be done in
> a minute.
>
> It is new and it is free: wegowhen.com. If you organise trips for a group, I would like
> to know where it breaks.

## What none of this copy says

No user counts, no testimonials, no "trusted by", no press mentions, no revenue. There are
none of those things. Every draft above is written to be persuasive without them, and if
someone asks how many people use it, the answer is "almost nobody yet, that is why I am
here".
