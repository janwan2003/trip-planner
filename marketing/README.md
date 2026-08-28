# WeGoWhen go-to-market

Written 2026-08-28, the day the site became publicly reachable. Product truth lives in
[PRODUCT.md](../PRODUCT.md); repo mechanics in [CLAUDE.md](../CLAUDE.md). This directory
is the marketing side: what we are betting on, the copy to paste, and what still needs a
human with a login.

## Where we actually are

| Fact | Evidence |
| --- | --- |
| Site is live and returns 200 | `curl -sI https://wegowhen.com/` on 2026-08-28 |
| Not in Google's index | `site:wegowhen.com` returned zero pages from the domain, 2026-08-28 |
| Four indexable backlinks, one dofollow, DR still 0 | Checked 2026-08-28 cookie-free, reading both the robots meta and the link's `rel`: dev.to (**dofollow**), Startup Fame, GitHub, YouTube (all nofollow). SaaSHub and PeerPush serve publicly but are `noindex` while queued; AlternativeTo is not public yet. DR is unchanged because no crawler has processed any of them |
| Zero users, zero reviews | PRODUCT.md records this explicitly — no testimonial or counter may be invented |
| Eight indexable pages | Was one — routing was `HashRouter`, so `/#/about` and friends were fragments. Now path-based and prerendered per route |
| Google Search Console is already verified | `dig +short TXT wegowhen.com` returns the `google-site-verification` record, 2026-08-28 |
| No analytics | Nothing is installed, so "getting users" is currently unmeasurable |
| No backlink data at all | DataForSEO's `/v3/backlinks/summary/live` returned zero items for the domain on 2026-08-28, re-checked after the links above went live. This is why the "Domain Rating > 0" gate on **both** Fazier and Startup Fame's free tiers cannot be met yet; Ahrefs' own free DR checker sits behind a Cloudflare turnstile, so there is no second opinion to be had |

Link previews, structured data, indexable pages and an `llms.txt` are done. What is left
is the work list below.

## The wedge

Do not market this as a scheduling tool. It loses that fight — Doodle, Calendly, Rallly
and Timeful all rank for it and all have years of links.

Market it as **the tool for a stretch of days rather than an hour**. The searched-for
phrasing already exists: Google's own related-query set for "when2meet" includes
**"when 2 meet but for days"**, plus "when2meet for next month" and "when2meet 2 months
in advance" (DataForSEO Labs related_keywords, `when2meet`, US, 2026-08-28). People are
bending a meeting poller into a trip planner and saying so in the search box.

The claim to make, and the only one that is defensible:

> When2meet and Doodle answer "which hour suits everyone". A trip is not an hour, it is a
> stretch of days. WeGoWhen collects the days each person is free and returns the ranked
> consecutive date ranges that fit the most people — "these six can all go Fri 12 – Mon 15" —
> with a per-day heat map beside them so the answer can be checked at a glance.

That is a factual difference in output, not a swipe at a competitor, so it survives the
scrutiny an AI engine or a moderator applies. See [keywords.md](keywords.md) for the
volumes, and [positioning-kit.md](positioning-kit.md) for the copy at each length.

## Sequence — destination pages before submissions

Directory backlinks need somewhere useful to land, and a submission spent while the site
has one indexable page is a submission wasted.

1. ~~**Share previews and structured data.**~~ Done 2026-08-28. Every link anyone pastes
   now carries a card, and the home page carries `WebApplication` JSON-LD.
2. ~~**Make the site more than one page.**~~ Done 2026-08-28. Path routing, a real static
   HTML file per route with its own title, description and canonical, a generated sitemap,
   `llms.txt`, and the three destination pages the keyword research pointed at:
   `/when2meet-alternative`, `/doodle-alternative`, `/faq` (the last with `FAQPage`
   structured data).
3. ~~**Directory submissions**~~ Started 2026-08-28. Live: AlternativeTo, dev.to, GitHub.
   Pending review: SaaSHub, OpenHunts. Blocked or paid: Fazier, Uneed, TinyLaunch,
   Product Hunt. The full picture, including what each "free" tier now actually costs,
   is in [directories.md](directories.md).
4. **Launch moment** — Product Hunt, Show HN, Reddit. Copy drafted in
   [launch-copy.md](launch-copy.md). Deliberately after 2 and 3: a launch that lands on a
   one-page site converts worse and cannot be repeated.
5. **Channels where the actual users are.** When2meet's volume peaks every September and
   January (165,000 US searches in each of 2025-09 and 2026-01, against 74,000 in
   2025-12 — DataForSEO, 2026-08-28). That is an academic calendar. Students planning ski
   trips and spring break are the exact user in PRODUCT.md, and the reachable version of
   them is university subreddits and student societies, not r/travel.

## Blocked on the account holder

I cannot create accounts, enter credentials, or submit forms on your behalf. These are
the steps that need you, in priority order — everything else in this directory is
paste-ready.

1. **Google Search Console** — the property is already verified by DNS, so this is one
   click: submit `https://wegowhen.com/sitemap.xml` under Sitemaps, then check Pages
   coverage a few days later. Until the sitemap is submitted the eight new URLs get found
   eventually rather than this week.
2. **Bing** needs nothing from you — IndexNow works without an account and the key is
   already in `public/`. The exact command is in the repository README.
3. **Analytics.** Cloudflare Web Analytics is the right fit: free, cookieless, no third
   party, and for a Pages project it is a toggle rather than a code change — Cloudflare
   dashboard → Web Analytics → add `wegowhen.com` → enable automatic setup for the
   `wegowhen` Pages project. Do this before the launch moment or the launch is
   unmeasurable. Google Analytics would also work but adds a cookie banner obligation
   the product currently does not have.
4. **The accounts in [directories.md](directories.md)** — Product Hunt, AlternativeTo and
   the rest. The copy is written; each is a paste.

## What to measure, and the honest baseline

All five numbers are zero today. Set the first review for 2026-09-28.

| Metric | Baseline 2026-08-28 | Where to read it |
| --- | --- | --- |
| Indexed pages | 0 | Search Console → Pages |
| Referring domains | 0 | Ahrefs free backlink checker, or Search Console → Links |
| Organic clicks | 0 | Search Console → Performance |
| Sessions, and share of them from directories | unmeasurable | Cloudflare Web Analytics, once enabled |
| Trips created | not instrumented | D1: `SELECT count(*) FROM trips` |

Trips created is the one that matters and the only one already available — it is in the
database. Everything above it is a proxy for it.

## Next step after this change

The screenshots. Every Tier 1 directory form asks for them and the submissions stall
without them, which makes them the binding constraint on steps 3 and 4 — not the copy,
which is written. See the asset table in [positioning-kit.md](positioning-kit.md) for what
is needed and how to generate it against a local `wrangler pages dev` rather than
production.

Then, in parallel: submit the sitemap in Search Console, turn on Cloudflare Web Analytics,
and work down batch 1 of [directories.md](directories.md) starting with AlternativeTo.

The alternative I rejected was submitting to directories immediately after the pages went
live, to start the referring-domain clock earlier. Rejected because a first submission is
the one that gets a moderator's editorial attention, and a listing with no screenshots
either gets rejected or gets accepted looking like nothing.
