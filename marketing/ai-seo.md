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

### Every page serves an empty body to every non-rendering reader

Measured 2026-08-31 with `curl` — no cookies, no JavaScript, which is what a crawler is:

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

**Status: being fixed.** As of this writing the working tree carries an unpushed
prerender-the-body change — `src/entry-prerender.tsx`, `src/AppShell.tsx`, and a rewritten
`prerenderRoutes` plugin in `vite.config.ts` — which bakes each route's rendered HTML into
its static file. That work belongs to another session and is not mine to commit. Nothing in
this document's recommendations lands properly until it ships, so ship it first, then
re-run the `curl` table above and confirm the byte counts move.

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

The third is the product's thesis as a question, and the FAQ does not carry that wording.
`related_searches` on both queries repeats it as "When 2 meet but for days".

## What to do, in order

1. **Ship the body prerender.** Everything else is downstream of it. Verify with the `curl`
   table above, not with a green build.
2. **Answer the PAA questions in the FAQ, in their words.** Add to the `FAQ` array in
   `src/lib/siteMeta.ts` — which feeds both the rendered page and the `FAQPage` JSON-LD, so
   the two cannot disagree:
   - "When to meet, but for days — is there a tool for that?"
   - "Is there anything better than When2meet?" (answer honestly: for an hour, no; for a
     stretch of days, it is the wrong shape)
   - "Which is better, Doodle or When2meet?" (answer the comparison neutrally, then say
     what neither does)
   Each answer self-contained in 40–60 words, because that is the unit that gets extracted.
3. **Answer the Software Recs Stack Exchange question** (`softwarerecs.stackexchange.com/questions/82438`).
   This is the single highest-leverage item on the list: it is the source Google's AI
   Overview quotes for the money query, it is a four-year-old question still collecting
   views, and the site's rules permit a disclosed self-recommendation. Disclose authorship,
   answer the asker's literal example ("is there a stretch of days that works"), no
   marketing voice. Same for `ask.metafilter.com/363165` ("when2meet but for longer term
   scales"), which Google surfaces in the discussions block for the same query.
4. **Add freshness signals.** Nothing on the site carries a date a machine can read. Add
   `datePublished` / `dateModified` to the `WebApplication` JSON-LD and a visible "Last
   checked" line on the two comparison pages (the When2meet page already has "Checked
   against when2meet.com on 28 August 2026" — make the Doodle page match and keep both
   current). Recency is a documented weighting in every answer engine.
5. **Name the entity.** The JSON-LD has no `author`, `publisher` or `sameAs`. Adding
   `sameAs` pointing at the GitHub repo, the dev.to post and the YouTube video is how the
   scattered third-party mentions get tied to one entity rather than read as unrelated
   pages.
6. **Generate `llms-full.txt` at build time.** The prerender plugin will already hold every
   route's rendered HTML in memory; stripping tags into one concatenated text file is a few
   lines in the same loop, and it cannot go stale because it is generated. Do not
   hand-write one.
7. **Reddit, honestly and later.** `r/opensource`'s "I made a better when2meet" thread is
   rank 1 for the primary query and is cited by the AI Overview. A genuine post is worth as
   much as a backlink here. It is also the surface where an account with no history posting
   its own product goes badly, so this comes after there is something to say beyond
   "I built a thing".

## What shipped with this document

- `public/llms.txt` rewritten: dated, with the literal query phrasings people type, the
  Set The Date and When2meet distinctions, and a short extractable Q&A block.
- `public/pricing.md` added: free with no paid tier, stated in the machine-readable form
  agents filter on. Small file, but "is there a free option with no account" is exactly the
  filter this product wins.

Not touched, because another session is actively editing them: `src/lib/siteMeta.ts`,
`vite.config.ts`, `index.html`, `src/App.tsx`, `src/main.tsx`, `public/_redirects` and the
tests. Items 2, 4, 5 and 6 above all live in those files.

## Re-measuring

Re-run the two DataForSEO calls monthly and fill in this table. The first review is due
with the rest of the go-to-market baseline on 2026-09-28.

| Date | `when2meet alternative` cited | `when2meet but for multiple days` cited | Notes |
| --- | --- | --- | --- |
| 2026-08-31 | No | No | Baseline. Bodies were still empty at measurement time |

There is no Search Console report for AI Overviews — Google publishes none — so this manual
pull is the measurement. ChatGPT and Perplexity have no API for their citation sets either;
check those by hand, with the same queries, and record the answer here.
