# Directory submissions

A tracker, in submission order. Copy for every field is in
[positioning-kit.md](positioning-kit.md); which variant to use is in the last column.

**Do not start batch 1 until the destination pages are live and indexed.** A first
submission is the one that gets a moderator's editorial attention, and spending it while
`wegowhen.com` has a single indexable URL wastes it. See the sequence in
[README.md](README.md).

## About the numbers in this file

- **DR** is domain rating as recorded in the `marketing-skills` plugin's directory catalog
  (`directory-submissions/references/directory-list.md`, version 2.3.0), read 2026-08-28.
  It is that catalog's figure, not a measurement I took, and DR moves — treat it as a
  rough ordering, not a fact about today.
- **Reachable** means an HTTP request from this machine on 2026-08-28 returned 200. A `403`
  is a bot block, not a dead site: those entries are marked "blocked", which says nothing
  about whether the directory works in a browser. Two entries failed for real and were
  dropped: `crozdesk.com/vendor` returned 404 and `tools.arc.dev` did not resolve.
- **Account** says whether submitting requires creating an account. Sites offering Google
  sign-in were completed end to end; sites wanting a password, an emailed code, or an
  anti-bot answer are marked "needs you" in the tracker at the bottom, which is the section
  to read for current state. The batch tables below are the original plan, kept for the
  reasoning, not a record of what happened.

## Before batch 1: the free wins that need no directory

| # | Action | Why | Status |
| --- | --- | --- | --- |
| 1 | GitHub repo description, homepage link and topics on `janwan2003/trip-planner` | The repo is public with an empty description and no link to the site. GitHub is DR 98 and the repo is the one asset already ranking-eligible. | Done in this change |
| 2 | Decide whether to add a licence | The repo is public with **no licence**, which legally means all rights reserved. Every open-source channel — r/opensource, OpenAlternative, awesome-lists — is off-limits until there is one. Note that the result currently ranking #1 for "when2meet alternative" is an r/opensource thread, so this is worth real traffic. Your call: it is a legal decision, not a marketing one. | Needs you |
| 3 | Google Search Console + Bing Webmaster Tools | Nothing below matters if the site is not indexed. | Needs you |
| 4 | Cloudflare Web Analytics | Otherwise no batch below can be attributed. | Needs you |

## Batch 1 — highest fit, do first (≈2 hours)

These are the ones where WeGoWhen is a genuinely good answer to what the directory's
visitors are looking for. AlternativeTo is first for a reason: our primary keyword is
"when2meet alternative", and AlternativeTo is the site that owns the pattern.

| Directory | Submit at | DR | Dofollow | Account | Fit | Variant |
| --- | --- | --- | --- | --- | --- | --- |
| AlternativeTo | alternativeto.net/software/_/add/ | 79 | No | Yes | List as an alternative to **When2meet, Doodle, LettuceMeet, WhenIsGood, Rallly**. Highest-relevance listing available to us. | B |
| SaaSHub | saashub.com/submit (reachable) | 77 | Yes | Yes | Same alternative framing, dofollow. | B |
| Product Hunt | producthunt.com/posts/new (blocked) | 91 | No | Yes | The anchor. Needs the video and gallery images first — see the asset gaps in the kit. | A |
| Hacker News — Show HN | news.ycombinator.com/submit (reachable) | 91 | No | Yes | Only with the technical angle: Cloudflare-only stack, no accounts by design, the ranking algorithm. Variant C. A generic launch post gets flagged. | C |
| Uneed | uneed.best/submit-a-tool (reachable) | 40 | Yes | Yes | Straightforward. | A |
| Fazier | fazier.com/submit (reachable) | 30 | Yes | Yes | Straightforward. | A |
| Microlaunch | microlaunch.net/submit (reachable) | 30 | Yes | Yes | Straightforward. | A |
| DevHunt | devhunt.org/submit (reachable) | 35 | Yes | Yes | Dev audience — variant C. | C |
| Startup Fame | startupfa.me/submit (reachable) | 77 | Yes | Yes | High DR for the effort. | A |
| BetaList | betalist.com/submit (blocked) | 64 | Yes | Yes | Editorial queue, so submit early; free tier is slow. | A |
| Indie Hackers | indiehackers.com/products (reachable) | 76 | Yes | Yes | Create the product page, then post updates. Comment before you post. | A |
| Slant | slant.co | 75 | Yes | Yes | Add WeGoWhen to "best group scheduling tools" style questions where it honestly belongs. | B |

## Batch 2 — worth the time, lower yield (≈2 hours)

| Directory | Submit at | DR | Dofollow | Account | Variant |
| --- | --- | --- | --- | --- | --- |
| Startup Stash | startupstash.com/submit | 50 | Yes | Yes | A |
| F6S | f6s.com/company/create (reachable) | 65 | Yes | Yes | A |
| StackShare | stackshare.io/new-product | 60 | Yes | Yes | C |
| Crunchbase | crunchbase.com (reachable) | — | — | Yes | A — matters for AI answers, which lean on it as an entity source |
| Launching Next | launchingnext.com/submit (blocked) | 30 | Yes | Yes | A |
| PeerPush | peerpush.net/submit | 25 | Yes | Yes | A |
| Tiny Launch | tinylaunch.com/submit | 20 | Yes | Yes | A |
| OpenHunts | openhunts.com/submit | 25 | Yes | Yes | A |
| Best of Web | bestofweb.io/submit | 30 | Yes | Yes | A |
| PitchWall | pitchwall.co/submit | 25 | Yes | Yes | A |
| Firsto | firsto.co/submit | 25 | Yes | Yes | A |
| 10words | 10words.io | 40 | Yes | Yes | Use the 60-char line verbatim |
| FiveTaco | fivetaco.com | 47 | Yes | Yes | A |
| Promote Project | promoteproject.com | 47 | Yes | Yes | A |
| Open Launch | open-launch.com | 55 | Yes | Yes | A |
| Today Launches | todaylaunches.com | 60 | Yes | Yes | A |
| StartupBuffer | startupbuffer.com | 57 | Yes | Yes | A |
| Dev.to | dev.to/new (reachable) | — | Yes | Yes | C — a written post, not a listing. Canonical back to the repo. |

## Communities — higher yield than every row above, and easier to get wrong

Not directories. Read each set of rules before posting; most of these subreddits ban
self-promotion outright, and the ones that allow it allow it in a specific thread.

| Where | Why it is on this list | Rule to respect |
| --- | --- | --- |
| The r/opensource thread "I made a better when2meet" | **Ranks #1 in Google for our primary keyword** and has 320+ comments. A genuine, disclosed comment mentioning the multi-day case reaches both the readers and the crawlers. | Disclose that you built it, in the comment itself. One comment, not a campaign. Only credible if the licence question above is settled. |
| r/InternetIsBeautiful | The single best fit on Reddit for a free web tool with no signup. | Read the rules; low-effort posts are removed on sight. |
| r/SideProject | Promotion is welcome. | Post what you learned, not a pitch. |
| r/alphaandbetausers | Explicitly for this. | — |
| r/webdev | Showoff Saturday only. | Technical framing, variant C. |
| University subreddits and student societies | Where When2meet's September and January demand actually lives (see [keywords.md](keywords.md)). Ski trips, spring break, society weekends away. | Each sub has its own promo rule. Time it for early September. |
| r/skiing, r/snowboarding, r/backpacking and similar trip subs | Group-trip date coordination is a real, recurring pain there. | Most ban links. Answer questions where it is genuinely the answer; do not post a launch. |

The 90/10 rule holds: if the account posting has no history in a community, the post reads
as spam whatever it says.

## Deliberately skipped

Saying why is the point of this section — otherwise someone re-adds them in three months.

| Skipped | Reason |
| --- | --- |
| G2, Capterra, GetApp, Software Advice, TrustRadius, SaaSWorthy | B2B buyer review sites. A listing with zero reviews is dead weight, and ten reviews is the threshold where they do anything. There are zero users. Revisit at 20 users, before the G2 report cutoff (~28 April / ~28 July). |
| Every AI directory (TAAFT, Futurepedia, Toolify, Future Tools) | The product contains no AI. Listing it there is a false claim and moderators reject it. |
| MCP and agent registries | Not applicable. |
| No-code directories | Not applicable. |
| Local business directories (Manta, Hotfrog, Locanto) | There is no local business. |
| Press release and article farms (PRLog, EzineArticles, PR.com) | Thin sites, spam-adjacent link profile, no plausible reader. The downside risk exceeds the DR gain. |
| Social bookmarking (Scoop.it, Diigo, Pearltrees) | Effectively dead as a traffic or ranking source. |
| OpenAlternative, awesome-lists, r/opensource as a *post* | Requires an actual open-source licence. Blocked on item 2 above. |
| Wikipedia and Wikidata | Notability rules. A new product with no coverage gets reverted, and trying looks bad. |
| Paid submission bundles ("submit to 100 directories, $99") | The whole exercise is free and takes an afternoon. |

## What the free tier actually costs now

Findings from working through the list on 2026-08-28, because the plan above was
written on the assumption that "free directory" still means free. Mostly it does not.
Every row was checked by opening the submit flow, not by reading the marketing page.

| Site | Free route | What it really requires |
| --- | --- | --- |
| AlternativeTo | Genuinely free | Nothing. Listing went live the same hour |
| SaaSHub | Genuinely free | Nothing. Free queue quoted up to 32 days; it actually went live the same day |
| dev.to | Genuinely free | A post worth reading, which is the point |
| PeerPush | Genuinely free | Nothing. Free queue is ~38 days, but the product page is public immediately |
| PitchWall | Genuinely free | Nothing. 30+ day queue, and the free tier is explicitly **nofollow** |
| FiveTaco | Genuinely free | A Google sign-in. URL-only form |
| TinyLaunch | Free "Standard Launch" | Both add-on sections must be set to "None — $0" before the CTA unlocks. Free dates start ~4 weeks out |
| OpenHunts | Free **only** via badge | Every free launch week to mid-2028 shows *Full*. Their badge on the site skips the queue |
| Fazier | Free via badge + work | 3 helpful comments on other products, their badge on the site, **and Domain Rating > 0** |
| Startup Fame | Free "Verified" tier | Their badge on the site **and Domain Rating > 0**, same gate as Fazier. The listing page is live and indexable anyway; the link is nofollow until verified |
| Open Launch | Free tier exists on paper | "Free launches are fully booked into 2027." Cheapest real date is $12 |
| Microlaunch | None any more | `/submit` redirects to a $39 Pro Launch page |
| Uneed | **No free route** | "The free waiting line is closed." $14.99 fast-track or $29.99 pick-a-date |
| Product Hunt | Free | Hard Cloudflare block on an automated browser, and no API route either — write scope is approval-only and exposes no create-post mutation. Manual only; the whole submission is prepared in [product-hunt-launch.md](product-hunt-launch.md) |
| BetaList, StartupBuffer | Free | Same Cloudflare bot wall. Manual only |
| Launching Next | Free, no queue quoted | Plain form, no account — but it ends in an anti-bot arithmetic field, so the last click is manual |
| 10words | Free, and the queue is ~2,338 days | Signup needs an email **and password**, no OAuth, so that step is manual. The form itself is a minute — but the free queue is quoted at about 6.4 years, with a paid skip-the-line as the only alternative |
| F6S | Free | Emails a 6-digit code to the address on file. Manual only |
| DevHunt | Free, but off-topic | Accepts dev tools only: open-source projects, APIs/SDKs, frameworks, IDEs, testing, monitoring. WeGoWhen is none of those, and the repo has no licence, so submitting would be spam |

The reciprocal-badge trade is the modern price, and it is a fair one: the badges live at
the very bottom of the footer, in `index.html` rather than in React, because both sites
verify by fetching the page rather than by running it.

**Ask what the queue length actually is before valuing a free tier.** 10words is free with
no strings and quotes an estimated feature date about **2,338 days** — 6.4 years — on the
confirmation page, with a paid skip-the-line as the only alternative. Sites that publish the
number (10words, PeerPush's queue position #2243, Open Launch's dates booked into 2027) are
being straight with you. The ones that advertise "free" and reveal the backlog only after
every field is written are where the afternoon goes.

**The DR > 0 gate blocks two free tiers at once.** Both Fazier and Startup Fame require
Ahrefs Domain Rating above zero. As of 2026-08-28 the DataForSEO backlinks summary for
`wegowhen.com` returns zero items — no crawler has processed today's links yet — and
Ahrefs' own free checker sits behind a Cloudflare turnstile, so there is no honest way to
tick the box. Retry both once a crawl has landed; the work either side of the box is done.

## Tracker

Once a listing is live, confirm the backlink is real and dofollow. Note that many of these
domains 403 a bare `curl`, so a 403 is not evidence of absence — check in a browser:

```bash
curl -s -L -A "Mozilla/5.0 Chrome/140.0" "https://directory.example/your-listing" \
  | grep -o '<a[^>]*yourdomain\.com[^>]*>'
```

**Three things have to be true before a row counts as a backlink, and checking only the
first is how this file was wrong once already:**

1. The page returns 200 **to a request with no cookies.** A directory page can 200 for the
   signed-in submitter and be invisible to everyone else. AlternativeTo does exactly this,
   and because it 403s a bare `curl`, the only check that had succeeded was one made inside
   the logged-in browser — which proved nothing.
2. The page is not `noindex`. SaaSHub and PeerPush both serve their listing publicly and
   both carry a `noindex` robots meta while queued, so neither is search-visible yet.
3. The outbound link is not `nofollow`.

```bash
# 1 + 2 + 3 in one go, cookie-free
curl -s -L -A "Mozilla/5.0 Chrome/140.0" "https://directory.example/listing" \
  | grep -Eio '<meta[^>]*robots[^>]*>|<a[^>]*yourdomain\.com[^>]*>'
```

Every row below was re-checked this way on 2026-08-28.

| Directory | Submitted | Status | Live URL | Link | Notes |
| --- | --- | --- | --- | --- | --- |
| AlternativeTo | 2026-08-28 | **Not public — in review queue** | https://alternativeto.net/software/wegowhen/about/ (submitter only) | nofollow when live | Page says "Only you can see this app right now" and "expect a few months". Content is complete: alternative to When2Meet, Doodle, Framadate, Crab Fit, OurCalendar, TimeOverlap, plus the demo video. A **$5** one-time Stripe "priority review" moves it to 1-2 business days — not taken, that is a spending decision |
| SaaSHub | 2026-08-28 | Public but **`noindex`** | https://www.saashub.com/wegowhen | nofollow | Page serves 200 to anyone, but carries `<meta name="robots" content="noindex">` while it waits in the free queue, so it is not a search-visible backlink yet. 8 categories, 6 competitors, demo video added |
| dev.to | 2026-08-28 | **Live** | https://dev.to/janwan2003/the-bug-that-made-my-best-dates-feature-return-nothing-at-31-people-2e4a | **dofollow** | Technical post on the `1 << 31` bug. Two links to the site |
| PeerPush | 2026-08-28 | Public but **`noindex, follow`** | https://peerpush.com/p/wegowhen | **dofollow** | Page serves 200 to anyone and the outbound link is dofollow, but the page is `noindex` until the free queue publishes it (position #2243, ~38 days), so it is not a search-visible backlink yet. When2meet, Doodle, LettuceMeet and Rallly registered as alternatives |
| GitHub | 2026-08-28 | **Live** | https://github.com/janwan2003/trip-planner | nofollow | Repo description, homepage link, 14 topics |
| YouTube | 2026-08-28 | **Live** | https://youtu.be/__WmHyLytdI | nofollow | 0:48 demo, public. Description carries the site and repo links |
| Startup Fame | 2026-08-28 | **Live and indexable** | https://startupfa.me/s/wegowhen | nofollow | No robots meta, serves 200 anonymously, carries our full copy. Free "Verified" tier needs badge + DR > 0; dashboard still shows "not listed", but the page is public regardless |
| TinyLaunch | 2026-08-28 | Scheduled | — | — | Free Standard Launch, awaiting approval, goes live **28 Sep 2026** at midnight PT. Launch id 20731 |
| PitchWall | 2026-08-28 | Under review | https://pitchwall.co/product/wegowhen-group-trip-date-planner (404 until published) | nofollow when live | Free tier: 30+ day queue, 1-day homepage slot. Logo, 3 screenshots, demo video |
| FiveTaco | 2026-08-28 | Under review | — | — | URL-only submission accepted, notified by email on approval |
| OpenHunts | 2026-08-28 | Pending review | — | — | Free via badge; badge verified against the live site. Dofollow only if it finishes top 3 |
| awesome-no-login-web-apps | 2026-08-28 | PR open | https://github.com/aviaryan/awesome-no-login-web-apps/pull/566 | — | Maintainer dormant since 2023; free, so worth the wait |
| Fazier | — | **Blocked on DR** | — | — | 3/3 comments done, badge live. Retry when DR > 0 |
| Open Launch | — | Abandoned | — | — | Draft built, then found free dates are booked into 2027. Not paid |
| Microlaunch | — | Skipped | — | — | Paid only, $39 |
| Uneed | 2026-08-28 | Built, unpaid | https://www.uneed.best/tool/wegowhen (404) | — | Page complete but will not publish without $14.99 |
| Launching Next | — | **Staged, one field left** | — | — | Whole form filled in an open tab, contact email included. Needs only the "What is 2+3?" anti-bot answer and the Submit click |
| 10words | 2026-08-28 | Submitted, **queue is 2,338 days** | — | — | Submission id 30788. On submitting it quotes an estimated feature date about 6.4 years out and offers a paid skip-the-line. Cost a minute, so worth having, but it should not be counted |
| F6S | — | Needs you | — | — | 6-digit code sent to jan@wangrat.com |
| BetaList | — | Needs you | — | — | Cloudflare bot wall |
| StartupBuffer | — | Needs you | — | — | Cloudflare bot wall |
| Indie Hackers | — | Needs sign-in | — | — | Tab was still at `/sign-in` |
| Product Hunt | — | Needs you — **fully prepared** | — | — | Blocked three ways: Cloudflare interstitial in automated Chrome, hard block in a second independent browser, and API v2 exposes no create-post mutation. Every field, both image sizes and the first comment are paste-ready in [product-hunt-launch.md](product-hunt-launch.md) |
| Show HN | — | Not started | — | — | Draft in launch-copy.md. Needs a Hacker News account |
| DevHunt | — | Deliberately skipped | — | — | Dev tools only; WeGoWhen is off-topic and the repo has no licence |

**Pages that are public, indexable, and link to the site: 4** — dev.to, Startup Fame,
GitHub and YouTube. Exactly **one of those four is dofollow** (dev.to).

Three more are built and public but not yet search-visible: SaaSHub and PeerPush are
`noindex` while queued, and AlternativeTo is not public at all. Five others are queued or
under review. All of them are free and should convert on their own timers, so the honest
figure to watch is "indexable and dofollow", which is 1, not the 7 an earlier version of
this file claimed.

## Indexing, without Search Console

IndexNow needs no account and covers Bing, Yandex, Seznam and Naver. All eight indexable
URLs were submitted on 2026-08-28 and the endpoint returned `HTTP 200`:

```bash
curl -sS -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json' \
  -d @- <<'JSON'
{"host":"wegowhen.com","key":"5336c16045b1067eef246cc17ea1297d",
 "keyLocation":"https://wegowhen.com/5336c16045b1067eef246cc17ea1297d.txt",
 "urlList":["https://wegowhen.com/","https://wegowhen.com/when2meet-alternative",
 "https://wegowhen.com/doodle-alternative","https://wegowhen.com/faq",
 "https://wegowhen.com/about","https://wegowhen.com/contact",
 "https://wegowhen.com/terms","https://wegowhen.com/privacy"]}
JSON
```

Google has no equivalent: its sitemap ping was retired in 2023, so `sitemap.xml` still has
to be submitted by hand in Search Console. That remains item 3 of the list at the top.

Archiving the URLs on the Wayback Machine was attempted and **failed** — `web.archive.org/save`
timed out on every one of the eight URLs from this machine and `archive.org/wayback/available`
reports no snapshots. It now wants an archive.org account. Low value, not retried.

## Comments left on other products

Fazier requires three before a free launch. Left on 2026-08-28, one specific question each,
no self-promotion:

- **SVGicons.com** — whether icon search matches aliases (bin vs trash, cog vs gear).
- **VoteGenerator** — whether its meeting-scheduling poll does whole days or only time
  slots inside a day.
- **Light Pollution Map** — which light-pollution dataset and year the Bortle readings use.

The first draft for SVGicons.com asked about per-icon licences; their own feature list
already answered that, so it was rewritten before posting. Worth the extra minute: a
comment that shows you did not read the page is worse than no comment.
