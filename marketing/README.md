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
| Zero backlinks, DR 0 | Domain first served content 2026-08-28; nothing has linked to it |
| Zero users, zero reviews | PRODUCT.md records this explicitly — no testimonial or counter may be invented |
| One indexable page | Routing is `HashRouter`, so `/#/about` and friends are fragments, not pages |
| No link preview | `og:image` was absent until this change; pasting the URL into WhatsApp showed a bare link |
| No analytics | Nothing is installed, so "getting users" is currently unmeasurable |

Two of those are fixed in this change (link preview, structured data). The rest are the
work list below.

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
> consecutive date ranges that fit the most people — "these six can all go Fri 12 – Mon 15",
> not a grid of ticks to read yourself.

That is a factual difference in output, not a swipe at a competitor, so it survives the
scrutiny an AI engine or a moderator applies. See [keywords.md](keywords.md) for the
volumes, and [positioning-kit.md](positioning-kit.md) for the copy at each length.

## Sequence — destination pages before submissions

Directory backlinks need somewhere useful to land, and a submission spent while the site
has one indexable page is a submission wasted.

1. **Share previews and structured data** (this change). Every link anyone pastes from now
   on carries a card. Cheapest possible win, and it compounds with every share.
2. **Make the site more than one page.** Move off `HashRouter` so `/about`, `/faq` and the
   comparison pages are crawlable, then publish the destination pages that the keyword
   research points at. Blocks step 3.
3. **Directory submissions** — [directories.md](directories.md), in the order given there.
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

1. **Google Search Console** — add `wegowhen.com`, verify by DNS in Cloudflare, submit
   `https://wegowhen.com/sitemap.xml`. Without this the site gets indexed eventually
   instead of this week, and you have no query data at all.
2. **Bing Webmaster Tools** — same, and it can import the Search Console setup.
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

Step 2 above: get off `HashRouter` and publish the comparison and FAQ pages. It is the
prerequisite for both the directory submissions and the launch, and it is the difference
between a site with one indexable URL and a site with eight. The alternative I rejected
was submitting to directories first, to start the DR clock earlier — rejected because a
first submission is the one that gets editorial attention, and spending it on a one-page
site wastes it.
