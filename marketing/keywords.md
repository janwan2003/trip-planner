# Keyword research

**Source:** DataForSEO, pulled 2026-08-28. Volumes are Google Ads monthly averages for the
US (`location_code 2840`, `language_code en`) from
`/v3/keywords_data/google_ads/search_volume/live`. Difficulty (KD, 0–100) and the related
query sets come from `/v3/dataforseo_labs/google/related_keywords/live`. SERP composition
comes from `/v3/serp/google/organic/live/regular`. Re-pull before acting on these in three
months; volumes drift and the SERP moves faster than that.

Nothing here is estimated. A blank cell means the API returned no volume for that phrase,
which for a phrase people demonstrably type means "under Google's reporting floor", not
"nobody searches it".

## The market, in one table

| Keyword | Volume/mo | KD | Competition | Intent | Read |
| --- | --- | --- | --- | --- | --- |
| when2meet | 110,000 | 3 | LOW | navigational | The category's front door. Not winnable, but its orbit is. |
| whenisgood | 8,100 | — | LOW | navigational | Second incumbent by brand demand. |
| lettucemeet | 6,600 | — | LOW | navigational | Third. |
| timeful | 5,400 | 15 | LOW | informational | The one that beat When2meet on UI, via Reddit. |
| rallly | 1,900 | — | LOW | navigational | Open-source poller, ranks for the alternative query. |
| **when2meet alternative** | **720** | **3** | LOW | navigational | **Primary target.** KD 3 with a real commercial motive behind it. |
| doodle alternative | 590 | — | MEDIUM | — | Secondary target. Doodle itself ranks #3 here, so harder. |
| group trip planner | 390 | — | LOW | — | On-topic and low competition, but mostly itinerary intent, not dates. |
| group availability calendar | 260 | — | MEDIUM | — | Describes the feature, not the job. Section, not page. |
| how to use when2meet | 210 | — | LOW | informational | Someone else's product. Ignore. |
| when2meet login | 110 | 19 | LOW | navigational | Ignore. |
| when to meet alternative | 90 | 4 | LOW | informational | Same page as the primary; spelled-out variant. |
| how to plan a group trip | 70 | — | LOW | informational | Top-of-funnel. Worth one honest guide, later. |
| plan a trip with friends | 50 | — | LOW | — | Same. |
| group date picker | 20 | — | MEDIUM | — | Too thin for its own page. |
| group trip planning tool | 10 | — | LOW | — | Too thin. |

Seasonality is the loudest signal in the data. When2meet's monthly series: 165,000 in
2025-09, 135,000 in 2025-10, 74,000 in 2025-12, 165,000 in 2026-01, 74,000 in 2026-07.
That is a term whose demand tracks an academic year and collapses over the summer holiday.
Whoever is typing it is mostly a student, and the 2026-09 peak is days away.

## The phrases with no measured volume that matter most

Google's own related-query sets for `when2meet` and `when to meet alternative` include:

- **"when 2 meet but for days"**
- "when2meet for next month"
- "when2meet 2 months in advance"
- "when2meet alternative reddit", "when to meet alternative reddit"
- "when2meet alternative free"
- "doodle vs when2meet", "whenisgood vs when2meet", "timeful vs when2meet"

The first three are the product's entire thesis, typed by someone who does not know a
tool for it exists. They carry no reportable volume individually, which is precisely why
they are available: no incumbent has a page for them. Answer them literally, on the page,
in those words.

The two `reddit` suffixes say where these people go for an answer, and the SERP agrees.

## Who holds the primary SERP

Top of Google US for "when2meet alternative", 2026-08-28:

| # | Result | What it is |
| --- | --- | --- |
| 1 | reddit.com/r/opensource — "I made a better when2meet" | A 320-comment thread, two years old. Outranks every vendor. |
| 2 | timeful.app | Product homepage. Grew out of that thread. |
| 3 | doodle.com/en/doodle-the-when2meet-alternative/ | The incumbent bought the query with a dedicated page. |
| 4 | acuityscheduling.com/learn/when2meet-alternatives | Listicle. |
| 5 | when2meet.com | The subject itself. |
| 6 | rallly.co/when2meet-alternative | Dedicated page, open-source poller. |
| 7 | cal.com/blog/when2meet-alternatives | Listicle. |
| 8 | whenavailable.com/blog/when2meet-alternatives | Listicle. |
| 9 | koalendar.com/when2meet-alternative | Dedicated page, booking tool. |

Two things follow. First, **every commercial result is a meeting scheduler** — nine
results, zero of them about a multi-day trip. The gap is not a hunch; it is the page one
of the query. Second, the SERP carries an AI overview and a discussions-and-forums block,
and rank 1 is a Reddit thread: a genuine Reddit mention is worth as much here as a
backlink, and both Perplexity and ChatGPT lean on that surface for this exact question.

The pattern to copy is Rallly's and Koalendar's — one dedicated `/[competitor]-alternative`
page, not a blog listicle. KD 3 says a DR-0 domain with a genuinely differentiated answer
can reach page one. It will still need the referring domains from
[directories.md](directories.md) to get there.

## Page plan

One page per intent, each with a single H1 in the target phrasing, an honest comparison
table, and `FAQPage` JSON-LD.

| Page | Target | Supporting |
| --- | --- | --- |
| `/` | group trip planner (390) | Homepage; carries the "days, not hours" claim above the fold |
| `/when2meet-alternative` | when2meet alternative (720), when to meet alternative (90) | "when 2 meet but for days", "when2meet for next month" answered verbatim |
| `/doodle-alternative` | doodle alternative (590) | doodle vs when2meet |
| `/faq` | zero-click and AI-overview capture | The `FAQPage` schema lives here |
| `/how-to-plan-a-group-trip` | how to plan a group trip (70), plan a trip with friends (50) | Write it once there is something true to say about real usage |

Do not build the last one yet. There is no usage to write it from, and a guide padded out
of nothing is the kind of page that ages into a liability.
