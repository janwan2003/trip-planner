# AI search: where WeGoWhen stands, and what moves it

Written 2026-08-31. Companion to [README.md](README.md) (the go-to-market plan) and
[keywords.md](keywords.md) (volumes and the classic SERP). This file covers the other
surface: Google's AI Overviews, and the answer engines — ChatGPT, Perplexity, Claude,
Copilot — that cite sources rather than rank pages.

Everything below was measured, not estimated. Each figure names the command or the API
call that produced it.

## Baseline: zero citations, and a mechanical reason for it

| Query | AI Overview present | Sources it cites | WeGoWhen cited |
| --- | --- | --- | --- |
| `when2meet alternative` | Yes, rank 4 | 7: Reddit, Rallly, Timeful, Doodle, YouCanBookMe, Koalendar, Cal ID | No |
| `when2meet but for multiple days` | Yes, rank 1 | 6: Software Recs Stack Exchange, When2meet, Doodle, Rallly, Koalendar, YouCanBookMe | No |

Source: DataForSEO `/v3/serp/google/organic/live/advanced` with `load_async_ai_overview`,
US (`location_code 2840`), desktop, pulled 2026-08-31. Not cached — both calls were live.

Zero citations is the expected result for a domain with no referring domains. But there is
a second cause, and it is entirely ours.

### Every page served an empty body to every non-rendering reader — fixed the same day

Measured 2026-08-31 with `curl` — no cookies, no JavaScript, which is what a crawler is —
**before** commit `4278170`:

```
$ curl -s https://wegowhen.com/when2meet-alternative | grep -o '<div id="root"></div>'
<div id="root"></div>
```

| URL | Bytes served | Visible copy in those bytes |
| --- | --- | --- |
| `/` | 5,394 | none |
| `/when2meet-alternative` | 5,475 | none |
| `/doodle-alternative` | 5,472 | none |
| `/faq` | 9,332 | none — the extra 3.9 KB is the `FAQPage` JSON-LD, not prose |
| `/about` | 5,155 | none |

The head is right on every page: title, description, canonical, Open Graph. The body is an
empty `<div id="root">`. Google renders JavaScript and eventually sees the real page; the
crawlers behind AI answers largely do not.

The cost of that is visible in Google's own output. In the AI Overview for
`when2meet alternative`, the reference text Google extracted for **timeful.app** — a
JavaScript-only competitor with the same defect — is:

> "Timeful (formerly Schej) - Find a time to meet We're sorry but schej doesn't work
> properly without JavaScript enabled. Please enab…"

That is Google quoting a `<noscript>` warning as if it were the product description. It is
the most direct evidence available that this layer reads served bytes, and it is what
WeGoWhen's comparison pages would get if they were ever retrieved today.

**Fixed and deployed on 2026-08-31**, in commit `4278170` — `src/entry-prerender.tsx`,
`src/AppShell.tsx` and a rewritten `prerenderRoutes` plugin, which bake each route's
rendered HTML into its static file. The same `curl`, after:

| URL | Before | After |
| --- | --- | --- |
| `/` | 5,394 | 17,491 |
| `/when2meet-alternative` | 5,475 | 14,063 |
| `/faq` | 9,332 | 19,517 (after the three FAQ entries in `31a72fe`) |

Re-run it that way rather than trusting a green build: the bytes are the measurement, and
a build can succeed while writing an empty root.

### Crawler access is clean — verified, not assumed

`robots.txt` allows everything except `/trip/`, and Cloudflare is not blocking AI bots at
the edge. Checked 2026-08-31 by requesting `/when2meet-alternative` with each bot's real
user-agent:

| Bot | Platform | Response |
| --- | --- | --- |
| GPTBot | ChatGPT training | 200, 5,475 b |
| OAI-SearchBot | ChatGPT search | 200, 5,475 b |
| ClaudeBot | Claude | 200, 5,475 b |
| PerplexityBot | Perplexity | 200, 5,475 b |
| bingbot | Copilot | 200, 5,475 b |

Identical byte counts because that was the pre-prerender page; the point of the check is
the status code and the absence of a challenge, both of which held for all five.

No change to `robots.txt` is needed, and adding named `Allow:` lines for these agents would
be decoration — `User-agent: *` already covers them. Worth re-checking after any Cloudflare
dashboard change, because Cloudflare's bot controls can block these without touching this
repo.

## The real competitor for our query is not on the keyword list

For `when2meet but for multiple days` — the phrasing that is WeGoWhen's entire thesis —
Google's AI Overview leads with:

> "You can use **Set The Date** to poll dates across multiple days or months without dealing
> with specific times of day."

Sourced to a **2022 Software Recommendations Stack Exchange question**, which also ranks
organically at #3 for that query and #13 for `when2meet alternative`. A four-year-old Q&A
answer is what puts a product into the AI answer for this query. That is the mechanism to
copy.

What Set The Date actually is, read off `setthedate.app` on 2026-08-31: propose a shortlist
of candidate dates, participants vote **Best / Maybe / No** without logging in, and it
surfaces the winning date. It has a Pricing page and a Sign in. So the honest distinction
holds and is narrower than the one against When2meet:

| | Set The Date | WeGoWhen |
| --- | --- | --- |
| What the organiser supplies | A shortlist of candidate dates | One outer window |
| What participants give | A Best/Maybe/No vote per option | Every day they are free |
| What comes back | The winning single date | Ranked runs of consecutive days, with who can make each |
| Accounts | Sign-in exists; pricing page exists | None, either side; no paid tier |

Use this in the comparison pages and the outreach copy. Do not claim Set The Date cannot do
multi-day — it can poll days. The difference is a winning *date* versus ranked *stretches*.

## The four questions Google is already fanning out to

`people_also_ask` on the two queries above, verbatim — these are the fan-out targets, and
answering them literally is the cheapest AI-visibility work there is:

- "Is there anything better than When2meet?" / "Is there something better than When2meet?"
- "Which is better, Doodle or When2meet?"
- **"When to meet but for days?"**
- "How do I get more dates on When2meet?"

The third is the product's thesis as a question, and the FAQ did not carry that wording
until `31a72fe`; it now answers three of these four in the words above. The fourth, "How
do I get more dates on When2meet?", is about operating someone else's product and is
deliberately left alone. `related_searches` on both queries repeats the third as
"When 2 meet but for days".

## What to do, in order

Items 1, 2, 4, 5 and 6 shipped on 2026-08-31 and are struck through with the evidence
that they hold. Item 3 needs an account and is the only one left that moves a citation.

1. ~~**Ship the body prerender.**~~ Done, commit `4278170`, deployed. `/faq` went from
   9,332 bytes with no prose to 19,517 bytes with the answers in them.
2. ~~**Answer the PAA questions in the FAQ, in their words.**~~ Done, commit `31a72fe`.
   Three entries added to the `FAQ` array in `src/lib/siteMeta.ts`, which feeds the
   rendered page and the `FAQPage` JSON-LD from one source: "When to meet, but for days —
   is there a tool for that?", "Is there anything better than When2meet?" and "Which is
   better, Doodle or When2meet?". Each answer is self-contained in 40–60 words, because
   that is the unit that gets extracted. Live: `curl https://wegowhen.com/faq` matches the
   first of those twice, once as prose and once in the structured data.
3. **Answer the Software Recs Stack Exchange question** — `softwarerecs.stackexchange.com/questions/82438`,
   "Web app for scheduling dates (like when2meet but excluding time-of-day)". Still open.
   The single highest-leverage item left: Google's AI Overview for
   `when2meet but for multiple days` sources its lead recommendation to this page, the
   question has **9,026 views** and three answers, and every one of those three is a
   disclosed vendor (a Schej maintainer, a PollUnit employee, Set The Date). So the norm
   is established. The draft is below.
   - Post it in the **"Your Answer"** box. Answering needs no reputation; the "You must
     have 50 reputation to comment" gate applies to comments only, so do not try to reply
     under Set The Date's answer — the comparison belongs in the last paragraph of ours.
   - Expect a captcha, a new-contributor banner, and a first-post review queue.
4. ~~**Add freshness signals.**~~ Done, and then done properly in `b09fcb7` and
   `8376643`. Each route now carries a `contentUpdated` literal that feeds both
   `dateModified` in the JSON-LD and `<lastmod>` in the sitemap, with a test that fails any
   route whose declared date is older than the last commit touching its `contentSources`.
   The first attempt stamped the build day on all eight URLs, because Cloudflare Pages
   builds from a shallow clone and `git log -1 -- <path>` there answers with the tip commit
   for every path — a uniform `lastmod` being exactly the unreliable signal Google
   discounts. Live now: five URLs dated 2026-08-28, three 2026-08-31. Both comparison pages
   also carry a visible "checked on" line against the competitor's own site.
5. ~~**Name the entity.**~~ Done. `creator.sameAs` in the JSON-LD points at the GitHub
   repo, the demo video and the PeerPush listing. The dev.to post is deliberately not in
   it: `sameAs` is for the entity's own profiles, and an article about the product is not
   one.
6. ~~**Generate `llms-full.txt` at build time.**~~ Done. The prerender plugin writes it
   from the bodies it just rendered — 23,738 bytes, eight pages, served as `text/plain`.
   Generated rather than written, because a hand-kept copy of the site's own copy goes
   stale and then is the version that gets quoted.
7. **Reddit, honestly and later.** `r/opensource`'s "I made a better when2meet" thread is
   rank 1 for the primary query and is cited by the AI Overview. A genuine post is worth as
   much as a backlink here. But that thread is Timeful's own launch announcement, so
   posting a competing product under it reads as what it is. This waits for a thread of our
   own, and for something to say beyond "I built a thing".

**Ask MetaFilter is a dead end, contrary to what an earlier draft of this file said.**
`ask.metafilter.com/363165` ("when2meet but for longer term scales") carries the line
"This thread is closed to new comments". Checked 2026-08-31. Google still surfaces it in
the discussions block, and there is nothing to be done about that.

### The Stack Exchange answer, paste-ready

Leads on the asker's own example — "is there a stretch of 3-5 days this summer that works
for everyone?" — because that sentence is the product.

```markdown
[WeGoWhen](https://wegowhen.com) is built around the exact question in your
example — "is there a stretch of 3–5 days this summer that works for everyone?"

Against your requirements:

- **No time-of-day dimension at all.** It never asks for hours. The unit is a
  whole day, so there is no midnight-to-midnight workaround.
- **No pre-defined list to vote on.** The organiser sets one outer window —
  "any time from June to September" — and each person marks the days they are
  free inside it, which is the "mark all dates that work" behaviour you
  described rather than picking from a shortlist.
- **Several months at once.** The window can be any length; one participant can
  mark up to 1000 days.
- **It aggregates into ranges, not just per-day counts.** The output is every
  run of consecutive days that some group can *all* make, ranked by how many
  people are in it, then by length: "6 of 6 free, Fri 12 – Mon 15". There is a
  per-day heat map beside it if you want to eyeball the aggregate the way your
  screenshot does, and you can filter people out to see what happens if two
  drop.
- **No account for anyone**, organiser included — a name typed plus the link.
  Free, no paid tier, nothing to install.

Where it does not match your screenshot: voting is binary. You mark the days
you are free, and there is no separate "particularly bad" red vote. If that
distinction matters, the tri-state voting in the Set The Date answer above is
closer on that one point.

It is new — public since August 2026 — so it does not have the track record the
other answers here do.

Disclosure: I built it.
```

Softwarerecs answers are `nofollow`, so this is not worth much as a link. It is worth
posting because it is the page the AI Overview reads.

Sweep boundary: the only other softwarerecs questions checked were the top 20 matching
"scheduling" by title, all of which are resource, job, staff or class scheduling. Quora,
Reddit and the review sites were not swept for answerable questions; that is a separate
pass.

## What shipped

All of it is in commit `31a72fe`, pushed to `main`, CI green (run 33387250894), deployed
and verified against the live site rather than against `dist`:

- `public/llms.txt` rewritten: dated, with the literal query phrasings people type, the
  Set The Date and When2meet distinctions, and a short extractable Q&A block.
- `public/pricing.md` added: free with no paid tier, stated in the machine-readable form
  agents filter on. Small file, but "is there a free option with no account" is exactly the
  filter this product wins.
- `llms-full.txt` generated at build, `creator.sameAs` added, three FAQ entries added.
- `dateModified` and sitemap `<lastmod>`, per page, from a checked-in date per route with
  a test auditing it against git history — commits `b09fcb7` and `8376643`. The build-time
  date this document originally recommended is the wrong mechanism on Cloudflare Pages; see
  item 4.
- All eight URLs resubmitted through IndexNow, HTTP 200. Google still needs the sitemap
  submitted by hand in Search Console.

## Re-measuring

Re-run the two DataForSEO calls monthly and fill in this table. The first review is due
with the rest of the go-to-market baseline on 2026-09-28.

| Date | `when2meet alternative` cited | `when2meet but for multiple days` cited | Notes |
| --- | --- | --- | --- |
| 2026-08-31 | No | No | Baseline. Bodies were still empty at measurement time |

There is no Search Console report for AI Overviews — Google publishes none — so this manual
pull is the measurement. ChatGPT and Perplexity have no API for their citation sets either;
check those by hand, with the same queries, and record the answer here.
