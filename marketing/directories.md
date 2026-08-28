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
- **Account** says whether submitting requires creating an account. I cannot create
  accounts or submit forms, so every row is yours to execute; the value of this column is
  that it tells you which ones are a 30-second paste and which need a signup first.

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

## Tracker

Fill this in as you go. Once a listing is live, confirm the backlink is real and dofollow:

```bash
curl -sIL "https://directory.example/your-listing" | grep -i 'rel='
```

| Directory | Submitted | Status | Live URL | Dofollow verified | Notes |
| --- | --- | --- | --- | --- | --- |
| AlternativeTo | | Not started | | | |
| SaaSHub | | Not started | | | |
| Product Hunt | | Blocked on video + gallery | | | |
| Show HN | | Not started | | | |
| Uneed | | Not started | | | |
| Fazier | | Not started | | | |
| Microlaunch | | Not started | | | |
| DevHunt | | Not started | | | |
| Startup Fame | | Not started | | | |
| BetaList | | Not started | | | |
| Indie Hackers | | Not started | | | |
| Slant | | Not started | | | |
