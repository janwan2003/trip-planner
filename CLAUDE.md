# WeGoWhen — working notes

Group trip date coordination. Live at **https://wegowhen.com**. Product truth lives in
[PRODUCT.md](PRODUCT.md); this file is the mechanics of working in the repo.

## Toolchain

**pnpm only.** Not npm, not bun. The lockfile is what Cloudflare uses to pick a package
manager, so a stray `package-lock.json` or `bun.lockb` silently changes how production
installs — a committed `bun.lockb` is what broke the first Cloudflare build. `pnpm` is
pinned via `packageManager` in `package.json`.

pnpm 11 needs **Node >= 22.13**. The system Node here is 20.19.5, so prefix commands:

```bash
export PATH="$HOME/.nvm/versions/node/v22.23.1/bin:$PATH"
```

`pnpm-workspace.yaml` carries pnpm settings — note that pnpm 11 moved these out of the
`pnpm` field in `package.json`, and the setting is `allowBuilds`, not
`onlyBuiltDependencies`. `@swc/core` and `esbuild` are allowed to run postinstall scripts
because both compile native binaries; nothing else is.

## Commands

```bash
pnpm dev              # vite dev server, port 8080
pnpm run build        # -> dist/
pnpm run typecheck    # both tsconfigs: the app and the Functions
pnpm lint             # eslint
pnpm test             # vitest run - unit tests only, fast
pnpm run test:coverage
pnpm run test:api     # builds, then integration tests against a real wrangler + D1
pnpm run check        # typecheck + lint + test, the same gates CI runs
```

`pnpm test` deliberately excludes the integration suite: it boots workerd, which takes
seconds. CI runs both.

`.husky/pre-commit` runs lint-staged, typecheck and the tests on every commit, so a
failure surfaces before the push rather than in CI. `.github/workflows/ci.yml` runs
typecheck, lint, coverage and build on every PR and every push to `main`, on Node 22
to match Cloudflare's build image.

## Deployment

Cloudflare Pages project **`wegowhen`**, account `befecce350e8a99e624e87de9aca2099`.
Builds automatically from `main`. `wegowhen.com`, `www.wegowhen.com` and
`wegowhen.pages.dev` all serve it.

| Setting | Value |
| --- | --- |
| Build command | `pnpm run build` |
| Build output | `dist` |
| Framework preset | None |
| Node on Cloudflare | 22.16.0 |

Routing is **path-based** (`BrowserRouter`): `/trip/:id`, `/faq`, `/when2meet-alternative`.
It was `HashRouter` until 2026-08-28, and links shared in that era still work —
`src/lib/legacyHashRoute.ts` rewrites `/#/trip/:id` to `/trip/:id` before the router
mounts.

Each indexable route is emitted as a real static file at build time by the
`prerenderRoutes` plugin in `vite.config.ts`: `dist/faq.html`, `dist/about.html` and so
on — **head and body**. The head carries that route's title, description, canonical and
Open Graph tags; the body is the page itself, rendered by `src/entry-prerender.tsx` and
hydrated by `src/main.tsx`.

The body half landed 2026-08-31 and is the newer part. Before it, every one of the eight
pages served an empty `<div id="root"></div>`: `curl https://wegowhen.com/faq` returned
9,332 bytes in which the only occurrences of "When2meet" were inside the FAQPage JSON-LD,
never in visible copy. Google renders JavaScript and saw the pages; Bing, DuckDuckGo and
every crawler behind an AI answer did not, and the two comparison pages that carry all
the commercial keywords were blank to them. Now `/when2meet-alternative` serves 670
visible words to `curl`, `/doodle-alternative` 565, `/faq` 570, `/` 141.

Three mechanics here are not obvious and each one cost a build to find:

- **The prerenderer runs a second Vite build, not a dev server.**
  `@vitejs/plugin-react-swc` picks its JSX transform from the *command*, not the mode, so
  a `createServer` used as a module runner emits `jsxDEV` calls into a graph that resolves
  the production `react/jsx-runtime`, and the build dies with `jsxDEV is not a function`
  on the first page it renders.
- **`prerenderToNodeStream`, not `renderToString`.** The routes are `lazy`, and only the
  prerender API waits for a suspended boundary. `renderToString` emits the `Loading...`
  fallback on every page, which looks like it worked.
- **Pages serves `foo.html` at `/foo` and 308s `/foo.html` to `/foo`.** So a `_redirects`
  target must be written *without* the extension. `/trip/* /trip-shell.html 200` turned
  the rewrite into a 308 for every invitation link the product has ever issued; the
  working spelling is `/trip/* /trip-shell 200`. Same reason the routes are emitted as
  `faq.html` and not `faq/index.html` — the latter makes Pages 308 `/faq` to `/faq/`.

`public/_redirects` carries one rule and no catch-all: the `/trip/*` rewrite above. The
catch-all `/* /index.html 200` is gone — it answered every unknown path with a 200 and
the home page's head, an unbounded supply of soft 404s — so Pages falls through to
`dist/404.html`, a real 404. Both
`dist/404.html` and `dist/trip-shell.html` ship with an empty `#root` and
`<meta name="robots" content="noindex, nofollow">` in the served bytes: a body baked into
either would be the wrong page on screen until React replaced it, and the trip screen in
particular must never flash the landing form at someone opening an invitation link.

`public/_headers` sets `max-age=31536000, immutable` on `/assets/*` (every file there is
content-hashed, so revalidating can only confirm what the browser has), plus HSTS,
`X-Content-Type-Options` and `Referrer-Policy`. HSTS deliberately omits
`includeSubDomains`.

Verified locally against `wrangler pages dev dist` and again on production on
2026-08-31: the eight pages 200 with 141-779 visible words each inside `#root`,
`/trip/:id` 200 with an empty root and no landing copy, `/trip` and an unknown path
both 404.

**`www.wegowhen.com` 301s to the apex, and `_redirects` is not what does it.** Pages
ignores a rule whose source carries a hostname: `https://www.wegowhen.com/* ... 301!` was
deployed and `https://www.wegowhen.com/faq` still answered 200. For a while both hostnames
were held together by the canonical tag alone, and the duplicate host was serving real
traffic — 113 requests with status 200 in the 24h to 2026-08-31.

Fixed 2026-09-01 with a **zone-level Single Redirect**, created through the API with the
`CLOUDFLARE` token. The `http_request_dynamic_redirect` phase had no ruleset at all, so
this was a `PUT` to the phase entrypoint, which creates it:

```
PUT /zones/6839a05d9ac236e9897b253b95ecbbda/rulesets/phases/http_request_dynamic_redirect/entrypoint
expression:  (http.host eq "www.wegowhen.com")
action:      redirect, 301
target_url:  concat("https://wegowhen.com", http.request.uri.path)
preserve_query_string: true
```

Ruleset `468632e4796842b79312b44d173b07e8`, rule `bb4f38cd8112459382f5c5d85466a2ab`.

Verified immediately after: `www/`, `www/faq`, `www/when2meet-alternative` and a
`www/trip/:id?x=1&y=2` all 301 in **one hop** to the apex with path and query intact, and
the apex is untouched — the eight pages still 200, an unknown path still 404, `/trip/:id`
still 200. Do not re-add a hostname rule to `public/_redirects`; it does nothing.

A push to `main` is not finished until the Cloudflare build has finished. Check the
deployed bundle hash actually changed rather than trusting a green dashboard:

```bash
curl -s https://wegowhen.com/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js'
```

Compare that against the hash your local `pnpm run build` produced. Equal means the
deploy is genuinely the code you built.

## Backend

Trips live in **Cloudflare D1** (database `wegowhen`, id
`39bb1ce4-bc4a-4047-823a-6255e2c472bb`), reached through Pages Functions in
`functions/api/trips`. The Pages project must have that database bound as **`DB`**, or
every `/api` request answers 503.

The schema is applied idempotently on the first request by `functions/_lib/schema.ts`
rather than by `wrangler d1 migrations apply`. The reason is written at the top of that
file: applying migrations out of band needs a Cloudflare credential, and the OAuth grant
wrangler asks for covers the whole account. Anything destructive — dropping or altering a
column — cannot be expressed idempotently and does need real migrations.

Local development with the real API:

```bash
pnpm run build && pnpm exec wrangler pages dev   # http://127.0.0.1:8788, local D1
```

### Feedback

"Report a bug" and "Suggest a feature" sit in a slim strip above the header of the home
and trip pages (`src/components/FeedbackLinks.tsx`, added 2026-09-23). Each opens a
popover with a short personal note from the owner, a message box and an optional email.
It posts to `POST /api/feedback` (`functions/api/feedback.ts`), which writes one row to
the `feedback` table: `kind` (`bug` or `feature`), `message` (<= 2000 chars), `contact`
(optional, <= 200), `page` (the pathname — for a trip page that is the trip's link),
`user_agent` and `created_at`.

It is **write-only**: there is no GET, so nothing one visitor sends is shown to another.
Read it out of band, `SELECT`s only:

```
POST /accounts/<id>/d1/database/39bb1ce4-bc4a-4047-823a-6255e2c472bb/query
{"sql": "SELECT kind, message, contact, page, created_at FROM feedback ORDER BY created_at DESC"}
```

Feedback holds strangers' words and possibly their email: the same rule as trip names
applies — never paste it into this file, a commit or an issue. The privacy policy §2.1
discloses what is stored and a test guards that disclosure. The popover is on the home
page's critical path at a measured cost of +1.5 kB gzip (the Radix popover was already
there for the date picker).

## Credentials

The app itself needs none — D1 is reached through a binding, not a key, and the Supabase
project this repo used to point at no longer exists.

`.env` (gitignored) now holds a **Cloudflare account API token** for out-of-band work the
app never does: reading analytics, querying production D1, listing Pages projects. Two
things about it are not guessable:

- **The key is named `CLOUDFLARE`, not `CLOUDFLARE_API_TOKEN`.** Wrangler will not pick it
  up by that name. The other `*_CLOUDFLARE` keys next to it are R2 S3 credentials and are
  unrelated; R2 is not even enabled on the account (`/r2/buckets` answers 10042).
- **It fails `GET /client/v4/user/tokens/verify` with `1000 Invalid API Token`.** That is
  expected for an account-scoped token and is not a sign the token is broken. Test it
  against a real endpoint instead, e.g. `GET /accounts/<id>/pages/projects`.

Confirmed working on 2026-08-31: Pages projects, D1 list and `/d1/database/<id>/query`,
`zones?name=wegowhen.com`, and the **account**-scoped GraphQL datasets
`pagesFunctionsInvocationsAdaptiveGroups` and `d1AnalyticsAdaptiveGroups`.

`CLOUDFLARE_ANALYTICS_TOKEN` is a second, deliberately tiny token: one policy, one
permission group (*Analytics Read*, `9c88f9c5bce24ce7af9a958ba9c504db`), scoped to zone
`wegowhen.com` (`6839a05d9ac236e9897b253b95ecbbda`) alone. Prefer it for anything that
only reads traffic — `CLOUDFLARE` carries ~390 permission groups including
`Billing Write`, `Account API Tokens Write` and `Zone Write` on every zone, which is far
more than any analytics query needs.

Two free-plan limits on zone analytics, both hit on 2026-08-31:

- `httpRequestsAdaptiveGroups` **rejects any window wider than 1 day** — "cannot request a
  time range wider than 1d". For multi-day use `httpRequests1dGroups`, which carries
  `sum{requests pageViews bytes}` and `uniq{uniques}`.
- The adaptive dataset is **sampled**, and its `(clientRequestPath, edgeResponseStatus)`
  pairs do not always agree with reality: it reported `200` for
  `//wp-includes/wlwmanifest.xml` and `/wp-admin/install.php`, while live `curl` returns
  `404` for both on port 443, 8443 and 2087. Confirm any status finding with a real
  request before acting on it.
- `clientRequestScheme` is not available on this plan; `clientRequestHTTPHost`,
  `clientRequestPath`, `edgeResponseStatus` and `datetimeHour` are.

## Known state, as of 2026-08-28

- **Backend is Cloudflare D1 via Pages Functions.** Supabase is gone from the repo
  entirely, along with the localStorage write-through that used to hide its absence.
- **Typing is fully strict.** `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitAny` and `noFallthroughCasesInSwitch` are all on, and the tree is clean.
- `pnpm lint` exits 0 with no warnings (measured 2026-09-23); the
  `react-refresh/only-export-components` warnings in vendored shadcn files are switched
  off for `src/components/ui/**` in `eslint.config.js`.
- **Coverage is 98.73% of lines, 93.15% of branches** across `src/lib`,
  `src/components`, `src/pages` and `src/i18n`, from 430 unit tests (measured
  2026-09-23 with `pnpm run test:coverage`, when `src/i18n` joined the measured set;
  earlier snapshots: 402 / 98.34% earlier on 2026-09-23, 390 / 98.51% on 2026-09-13,
  243 / 97.70% on 2026-08-28). Thresholds in
  `vitest.config.ts` enforce 90/90/85/90 — set below the measured result so an unrelated
  refactor does not turn red on its own. `src/components/ui/**` is excluded: vendored
  third-party code, and measuring it would dilute the number that matters.
  Re-measure with `pnpm run test:coverage` rather than trusting this line; it is a
  snapshot and goes stale the moment a test lands.
- **38 integration tests** in `test/api.integration.test.ts` run the API against a real
  `wrangler pages dev` with a local D1 (counted 2026-09-23). Nothing is mocked, so they
  cover the Functions, the SQL, the unique index and the middleware together.
- `src/components/ui/` holds ~48 vendored shadcn components; only 15 are imported by app
  code. The rest are dead but still typechecked and linted.
- **The site is in Google's index, all eight URLs.** `site:wegowhen.com` returned nothing
  on 2026-08-28, seven pages on 2026-08-31 (all but `/when2meet-alternative`), and all
  eight on 2026-09-23 (DataForSEO `serp/google/organic/live/advanced`, US desktop). Being
  indexed is not ranking: neither `when2meet alternative` nor `when2meet but for multiple
  days` shows the site in its first 30 results, and neither AI Overview cites it — see
  `marketing/ai-seo.md`. It has **four public,
  indexable pages linking to it** — dev.to, Startup Fame, GitHub and YouTube, of which
  only dev.to is dofollow. SaaSHub and PeerPush are public but `noindex` while queued, and
  the AlternativeTo listing is still submitter-only. All eight URLs were pushed to
  Bing, Yandex, Seznam and Naver via IndexNow, which needs no account; Google still needs
  `sitemap.xml` submitted by hand in Search Console. Current per-directory state, checked
  by fetching each page, is the tracker at the bottom of `marketing/directories.md`.

## Marketing, SEO and the share card

The go-to-market side lives in `marketing/` — the plan and the honest baseline in
`marketing/README.md`, DataForSEO keyword and SERP data in `marketing/keywords.md`,
paste-ready submission copy in `marketing/positioning-kit.md`, the directory tracker in
`marketing/directories.md`, launch drafts in `marketing/launch-copy.md`, the AI-search
audit and its measured citation baseline in `marketing/ai-seo.md`, and the
paste-ready Product Hunt submission — every field, both image sizes, the first comment — in
`marketing/product-hunt-launch.md`. Product Hunt still cannot be automated, but for one
reason rather than two: its v2 API exposes no create-post mutation. The "Cloudflare blocks
it in two browsers" note this file used to carry was wrong — that was a VPN on the dev
machine, and with it off the site loads fine. See the VPN section in
`marketing/directories.md` before recording any site as bot-walled.

Things in this repo that marketing depends on, so do not break them silently:

- `public/og-image.png` is the 1200x630 link preview card, and `index.html` references it
  by **absolute** URL — a relative one is dropped by most unfurlers, WhatsApp included.
  Regenerate it with `python3 scripts/generate-og-image.py` (needs Pillow; it fetches
  Fraunces and DM Sans into `~/.cache/wegowhen-fonts` on first run). It reads the palette
  from the same HSL tokens as `src/index.css`, so if the brand colours change, change both.
- `index.html` also carries `WebApplication` JSON-LD. It is static rather than injected by
  React so a crawler that does not run JavaScript still sees it. It deliberately has no
  `aggregateRating`: there are no reviews. Its `dateModified` is **rewritten at build time**
  by `renderRouteHtml` — a literal would be true the day it was typed and quietly false
  afterwards — and its `creator.sameAs` names the GitHub repo, the demo video and the
  PeerPush listing, so scattered third-party mentions resolve to one entity.
- **Three files answer the crawlers behind AI answers**, and two of them are generated:
  `public/llms.txt` is the hand-written index (facts, limits, comparisons, the phrasings
  people type); `dist/llms-full.txt` is every page's prose, produced by the prerender
  plugin from the same rendered bodies it writes into the HTML, so it cannot describe a
  page the site does not serve; `public/pricing.md` states the single free tier in the
  form an agent shortlisting tools can parse. Never hand-maintain a second copy of the
  site's own copy — a stale one is the version that gets quoted.
- `src/test/siteMetadata.test.ts` guards both — the absolute image URL, the declared
  dimensions matching the actual PNG, title and description lengths, and the absence of
  invented ratings.
- **Fonts are self-hosted, and the home h1 does not animate.** Both were the largest
  measured costs to page speed (Lighthouse mobile, 2026-09-23, median of 3 runs against
  `wrangler pages dev`): the Google Fonts `@import` was a render-blocking two-origin chain,
  and the `animate-fade-in` on the headline held LCP back until it finished. Home LCP went
  3.99 s to 1.68 s. Do not reintroduce a third-party font `@import` or an entrance
  animation on an LCP element.
- **The home page carries no marketing prose.** It had a "a trip is not an hour" section
  with links to the comparison pages; the product owner removed it on 2026-08-28 because
  it cluttered a UI whose job is the trip form. The comparison and FAQ pages are reached
  from the footer instead. Do not reintroduce body copy there.
- **Nor a demo.** `HeatPreview` — a "What you get back" section under the form that
  rendered an example six-person trip through the real `AvailabilityCalendar` and
  `findBestDateRanges` — was removed on 2026-08-28 for the same reason: it was marketing
  in the middle of the app. Its SEO job was already done elsewhere and still is: the
  `featureList` in `index.html`'s JSON-LD names the heat map and the ranked date ranges,
  and `/when2meet-alternative`, `/doodle-alternative` and `/faq` carry the prose. The one
  line kept under the form is "Free, no account, and nothing for your friends to sign up
  to." Recover the component from git (`git show e0fc7f9:src/components/HeatPreview.tsx`)
  if it is ever wanted on a comparison page rather than the home page.
- **`src/lib/siteMeta.ts` is the single source for every indexable URL.** The router,
  the per-route static HTML, `sitemap.xml` and the `FAQPage` structured data all come
  from it, so a new page cannot be added in one place and forgotten in another. Adding a
  page means adding an entry there and a `<Route>` in `src/App.tsx`; `src/lib/siteMeta.test.ts`
  then enforces the title and description lengths and that the sitemap matches the list.
- The `FAQ` array in that file is rendered by `src/pages/Faq.tsx` **and** turned into the
  `FAQPage` JSON-LD, which is why the two can never disagree — a requirement of the
  structured data, not just tidiness.
- **Page dates are checked-in literals, and the build must not compute them.** Each
  route carries `contentUpdated`, which feeds `<lastmod>` in the sitemap and
  `dateModified` in the JSON-LD, and is bumped by hand in the commit that changes the
  page. `src/lib/siteMeta.test.ts` fails if a route's date is older than the last commit
  touching its `contentSources`, so the literals cannot quietly rot; CI checks out with
  `fetch-depth: 0` because that audit needs real history.

  **Do not replace this with `git log` at build time.** That shipped, for one deploy, on
  2026-08-31. Locally it produced two distinct dates; production came back with all eight
  URLs stamped the build day, because **Cloudflare Pages builds from a shallow clone** and
  `git log -1 -- <file>` then answers with the tip commit for every path. The
  "git is unavailable, omit the date" fallback never fired, because git was present and
  answering — it was answering wrongly. A uniform build-day `lastmod` is the exact signal
  Google learns to discount, which is worse than the no-`lastmod` state it replaced.
- **There is no way to ping a sitemap any more.** Both endpoints are retired, measured
  2026-08-31: `google.com/ping?sitemap=` answers **404** and `bing.com/ping?sitemap=`
  answers **410**. Google refetches a sitemap it already knows on its own schedule, and
  `robots.txt` points at ours; a manual resubmit needs Search Console. Bing wants
  IndexNow instead, which needs no account — `public/5336c16045b1067eef246cc17ea1297d.txt`
  is the key, and `api.indexnow.org/indexnow` plus `bing.com/indexnow` both answered 200
  on 2026-08-31. So "resubmit the sitemap" is not an action anyone can take from a script;
  changing `lastmod` is.
- `public/robots.txt` disallows `/trip/`, and trip pages send `noindex` themselves: a
  trip's only credential is possession of its link, so a search result for one would
  break that. The 404 page is `noindex` too, because the SPA fallback answers an unknown
  path with a 200.

## Traffic and the arrival of real users

Measured 2026-08-31 from the Cloudflare GraphQL API, the first traffic numbers this
project has ever had. `httpRequests1dGroups`, zone `wegowhen.com`:

| date | requests | page views | uniques |
| --- | --- | --- | --- |
| 2026-08-28 | 2,077 | 772 | 237 |
| 2026-08-29 | 1,274 | 821 | 178 |
| 2026-08-30 | 1,387 | 945 | 175 |
| 2026-08-31 (partial) | 910 | 418 | 143 |

Read those uniques with suspicion. A large share of the volume is **WordPress
vulnerability scanning** — in one 24h window, `/wp-admin/install.php` plus fifteen
spellings of `//<dir>/wp-includes/wlwmanifest.xml`, and probes on cPanel ports 2052, 2082,
2086, 2087, 2095, 8080 and 8443. All 404, correctly, but they inflate every count.

Over that window the product side contradicted the traffic entirely — 88 Pages Functions
invocations, 305 D1 reads, 32 D1 writes, 8 trips all ours. The honest read then was:
crawlers and scanners found the site, people had not.

**That changed on 2026-09-02**, when the first stranger created a trip.

### The usage ledger

**Keep this table current.** The owner asked for it on 2026-09-23 and cares most about the
first two columns: **how many trips are created and how many people join them**. Whenever
a session touches usage, traffic or marketing, regenerate it and replace the table:

```bash
scripts/usage-ledger.sh            # read-only; counts only, never names
```

Last regenerated **2026-09-23** (that day partial):

| date | trips created | participants joined | API calls | page views | uniques |
| --- | --- | --- | --- | --- | --- |
| 2026-09-02 | 3 | 1 | 17 | 171 | 149 |
| 2026-09-03 | 0 | 0 | 2 | 138 | 114 |
| 2026-09-04 | 0 | 0 | 0 | 129 | 108 |
| 2026-09-05 | 0 | 0 | 2 | 138 | 112 |
| 2026-09-06 | 3 | 10 | 68 | 227 | 169 |
| 2026-09-07 | 0 | 0 | 5 | 148 | 131 |
| 2026-09-08 | 0 | 0 | 6 | 211 | 131 |
| 2026-09-09 | 1 | 5 | 29 | 192 | 139 |
| 2026-09-10 | 0 | 3 | 31 | 185 | 123 |
| 2026-09-11 | 3 | 10 | 81 | 208 | 167 |
| 2026-09-12 | 4 | 14 | 106 | 258 | 185 |
| 2026-09-13 | 4 | 7 | 83 | 307 | 211 |
| 2026-09-14 | 1 | 6 | 56 | 197 | 152 |
| 2026-09-15 | 0 | 4 | 34 | 198 | 154 |
| 2026-09-16 | 0 | 1 | 44 | 182 | 154 |
| 2026-09-17 | 0 | 1 | 25 | 165 | 128 |
| 2026-09-18 | 0 | 2 | 9 | 153 | 107 |
| 2026-09-19 | 0 | 0 | 25 | 161 | 143 |
| 2026-09-20 | 3 | 11 | 61 | 199 | 170 |
| 2026-09-21 | 5 | 15 | 106 | 245 | 220 |
| 2026-09-22 | 1 | 1 | 50 | 147 | 141 |
| 2026-09-23 | 0 | 0 | 21 | 63 | 63 |

Totals on 2026-09-23: **28 trips, 91 participants**, not counting the eight test trips;
**17 of the 28 have 2+ participants**, 7 have only the creator, 4 have nobody; 12 trips
had a participant edit in the last 7 days.

How to read the columns:

- **Trips created** and **participants joined** are `created_at` days from production D1,
  test trips excluded by id. A participant removed later is gone from the table, so
  "joined" slightly undercounts. Neither is sampled — these are exact.
- **API calls** are `pagesFunctionsInvocationsAdaptiveGroups`: only a browser running the
  app makes them, so this is the traffic column that means people. It is sampled, and
  back-filled days can shift a little between runs — the 2026-09-13 snapshot this table
  replaced had 09-06 at 21 where the same query now returns 68.
- **Page views** and **uniques** are `httpRequests1dGroups` and include bots and scanners;
  treat them as a ceiling. They barely moved when real use began.
- Cloudflare Web Analytics (browsers only, sampled in tens) put roughly 300 page loads on
  09-13..09-22, mostly `/trip/:id` invitation links. Referrers: 150 none, 130
  `wegowhen.com`, 10 `instagram.com`, **no search engine at all** — growth so far is
  invitation links, not SEO.

Two findings from the same data, both still open:

- **The `504`s never reach a browser. Diagnosed 2026-09-13; not a defect.** They look
  alarming — 87 on 08-31, 67 on 09-13 — and they land on real users' trip pages in matched
  `/trip/:id` + `/api/trips/:id` pairs, which reads exactly like the invitation flow
  breaking. It is not.

  Split `httpRequestsAdaptiveGroups` by **`requestSource`** and the whole thing resolves:

  | requestSource | status | count (24h to 2026-09-13T17:00Z) |
  | --- | --- | --- |
  | `eyeball` | 200 | 682 |
  | `eyeball` | 404 | 115 |
  | `eyeball` | 301 | 97 |
  | `earlyHintsCache` | **504** | **92** |
  | `eyeball` | **504** | **0** |

  Every 504 is `requestSource: earlyHintsCache` — Cloudflare's own Early Hints subsystem
  fetching pages to populate its hint cache, timing out against Pages. All carry
  `cacheStatus: miss` and `edgeResponseContentTypeName: empty`. **Filtering
  `requestSource:"eyeball"` returns zero 504s**, so no visitor has ever seen one. The
  zone's `early_hints` setting reads `off`, so there is nothing to switch off either.

  **Always split by `requestSource` before calling an error rate real.** `eyeball` is the
  only value that means a person; `earlyHintsCache` and `edgeWorkerFetch` are Cloudflare
  talking to itself. Judged on eyeball traffic alone the site has no error problem: the
  115 eyeball 404s are the WordPress scanners plus `/trip` (deliberate) and
  `/apple-touch-icon.png`, which the site did not ship until 2026-09-23 and now does.
- ~~**`www.wegowhen.com` served 113 requests with status 200** in that window.~~ **Fixed**
  2026-09-01 with a zone Single Redirect; see the `www` paragraph above.

## The browser-local trip list

`src/lib/recentTrips.ts` keeps a list of the trips a browser has opened under the
localStorage key `wegowhen.recentTrips.v1`, and `src/components/RecentTrips.tsx` renders
it under the create form on the home page. It exists because the link is the only
credential: someone who created a trip and closed the tab had no way back in.

Two things about it are deliberate and worth not undoing:

- **It never answers a read.** Each entry holds only `id`, `name`, `startDate`,
  `endDate`, `role` and `lastOpenedAt` — no participants, no availability — and every
  screen still fetches the trip from the API. The write-through cache this repo removed
  (see the header of `src/lib/tripStore.ts`) failed precisely because it served reads,
  so a dead backend looked alive.
- **Every storage call is guarded.** Safari private mode throws on `setItem` and a
  browser blocking site data throws on the getter, so an unguarded call would break the
  flow that creates a trip. All functions swallow those failures and degrade to an empty
  list.

It is per-browser, so it is a convenience and not an account: a different device, a
cleared profile or a private window shows nothing. `PrivacyPolicy.tsx` §2.2 and §7 were
updated in the same change to say the list exists and what it holds.

## Production data — real users since 2026-09-02

**The database is no longer ours to treat as scratch.** Counted 2026-09-13: **26 trips,
63 participants**, of which 8 trips / 15 participants are the test rows below and **18
trips / 48 participants belong to strangers**. The first arrived 2026-09-02T20:17Z. By
2026-09-23 strangers held **28 trips / 91 participants** — current figures live in the
usage ledger above, not here.

They are unmistakably real: trip names in Dutch, German, Spanish, Russian, Vietnamese and
English, one US school-district programme running three trips, group sizes up to 8. The
7-day country mix matches them — US 2356, SG 921, NL 816, KR 597, VN 393, CN 352, AU 336,
DE 330, GB 259, PY 182.

**Consequences, and they are not optional:**

- **Never run a bare `DELETE` or `UPDATE` against production D1 again.** The token in
  `.env` reaches `/d1/database/<id>/query` with arbitrary SQL and there is no undo. Any
  cleanup must name the eight test ids explicitly in an `IN (...)` list.
- **Do not paste trip names or participant names into this file, a commit message, an
  issue, or anywhere else.** They are other people's data. Counts and dates only. The
  names were read on 2026-09-13 to tell real traffic from smoke tests, and that is the
  only reason to read them.
- The contact-address gap in "Claims in the legal pages" is now a live problem rather
  than a hypothetical: strangers hold trips, the privacy policy grants them deletion
  rights, and there is no published address to ask at.

The eight test rows, counted 2026-08-31 (this line previously said two; that was wrong):

| id | name | created | participants |
| --- | --- | --- | --- |
| `prodsmoke0000000000000000000001` | prod smoke | 2026-08-28 | 0 |
| `prodtouch000000000000000000000001` | touch check | 2026-08-28 | 0 |
| `prodverify00000000000000000000001` | Prod verify | 2026-08-28 | 5 |
| `e1e0ba393081baeec0d2b15dd5698274` | Preview smoke | 2026-08-28 | 1 |
| `f32fef50dfd4a743b62ac63ae3a65f96` | my lovely trip | 2026-08-28 | 3 |
| `cbe96f2ef90cab8a36c5a39d1888c782` | narty | 2026-08-28 | 3 |
| `f89ae94e17e1a9630204a34aacb33d52` | narty | 2026-08-29 | 3 |
| `4b58069109c6bede14bdef059785b783` | ueah | 2026-08-31 | 0 |

The three carrying participants that are not smoke tests are the owner's own manual
testing, so those 15 participant rows are made-up names. That is true of these eight rows
only — the other 18 trips are not ours.

**There is no way to delete a trip through the app.** The API exposes create, read, and
add/rename/remove participant — nothing deletes a trip. It *can* now be done out of band:
the token in `.env` reaches
`POST /accounts/<id>/d1/database/39bb1ce4-bc4a-4047-823a-6255e2c472bb/query`, which
accepts arbitrary SQL against production. Read-only `SELECT`s were run there on
2026-08-31; no delete has been run.

Whether to add `DELETE /api/trips/:id` is a product decision, not a cleanup task: with no
accounts, anyone holding the link could delete everyone's answers.

## Claims in the legal pages that the code does not back

Both were checked against the codebase, not assumed:

- **§2.2 claimed automatic collection of "Usage Data: Pages visited, time spent on
  pages, and interaction patterns".** No such script was in the repo, so this was
  rewritten to deny analytics outright — which made it false the other way. See below.
- **§9 claims trips "may be archived or removed after an extended period of inactivity
  (typically 24 months)".** Nothing archives or removes anything: there is no cron, no
  scheduled job, and Pages Functions have no cron triggers, so implementing it would
  need a separate Worker.

**A third claim was false in the opposite direction, found 2026-09-13.** The policy said
*"We run no analytics"*, and `grep` over `src/`, `index.html` and `functions/` genuinely
finds no analytics script — but **Cloudflare Web Analytics was switched on at the zone**
and had been recording page views and referrers since at least 2026-09-04. It is injected
by Cloudflare at the edge, not by our code, so **grepping the repo cannot detect it** and
the served HTML does not show the beacon to `curl` either. The evidence is the RUM
dataset:

```
rumPageloadEventsAdaptiveGroups, account scope, siteTag 5c4f103f (wegowhen.com)
-> 260 page loads 2026-09-04..09-13, with refererHost
GET /accounts/<id>/rum/site_info/list -> auto_install: true, ruleset enabled: true
```

**Never conclude "no analytics" from a repo grep again.** Check
`/accounts/<id>/rum/site_info/list` and the RUM dataset; an edge-injected beacon is
invisible to every check that looks at source. §2.2 and §8 now name Cloudflare Web
Analytics and state that it sets no cookies and does not fingerprint, and the guarding
test asserts the disclosure is present and that the old denial cannot come back.

**Both have since been rewritten** (commit `00bcaf4`) to describe what the code does: the
policy now states that no analytics run, that retention is indefinite with no automatic
expiry, and how to exercise the rights it lists. Five tests guard the wording. The Contact
page was corrected in the same commit — it had promised "Report critical bugs using the
information below", where below was a FAQ and no contact details existed anywhere on the
site.

**Still outstanding:** no contact address is published, so a request to delete a whole trip
has nowhere official to go. Since 2026-09-23 the "Report a bug" form reaches the owner and
can carry such a request, but the Contact page and policy do not yet present it as the
channel for data requests; whether they should, or an address is published instead, is
the owner's call.

## Languages

The app UI ships in **English, German, Spanish and Dutch** since 2026-09-23. Chosen from
evidence, not a market list: strangers' trips are named in Dutch, German and Spanish, and
NL, DE and PY are in the top-ten countries by traffic (see "Production data"). Russian,
Vietnamese and Korean are the next candidates on the same evidence.

**What is translated:** everything a trip creator or invitee sees — home page, create
form, trip page, calendar, best dates, participants, tutorial, toasts, 404.
**What is not, on purpose:** the comparison pages, FAQ, About, Contact and the legal
pages. They are English SEO copy and legal text; translating them properly needs
per-language URLs (`/de/faq`), `hreflang` and per-language prerendering, not strings. The
page `<title>`/description in `siteMeta.ts` stay English for the same reason.

How it works — all in `src/i18n/`:

- `locales/en.ts` is the **source of truth**, keys grouped by component. `de.ts`, `es.ts`,
  `nl.ts` are typed `satisfies LocaleBundle`, whose `Messages` type is derived from
  English — **a key missing, misspelt or extra in any locale fails `pnpm run typecheck`**.
  `i18next.d.ts` types every `t('...')` call the same way.
- **`eslint-plugin-i18next` (`no-literal-string`) fails lint on raw text in JSX** —
  text nodes and `alt`/`title`/`placeholder`/`label`/`aria-label`. It covers
  `src/**/*.tsx` by default; the English-only pages are an explicit ignore list in
  `eslint.config.js`. A new component cannot ship English-only by accident.
- `locales.test.ts` checks what types cannot: no empty strings, the same `{{placeholders}}`
  and `<tags>` as English. A dropped `{{name}}` typechecks and then renders no name.
- `config.ts` is the registry. English is bundled; the others are ~12 kB lazy chunks.
  **Cost:** the entry chunk grew from 90.24 to 112.65 kB gzip (+22.4 kB: i18next,
  react-i18next and the English messages), measured by building `main` at 0f1af3a and
  this change side by side on 2026-09-23.
- `detect.ts`: a choice made in the switcher (`localStorage` key `wegowhen.locale.v1`,
  disclosed in the privacy policy §2.2 and §7) wins, then `navigator.languages`
  (`de-AT` → `de`), then English. Storage calls are guarded as in `recentTrips.ts`.
- `format.ts`: **dates are formatted by named style through `Intl.DateTimeFormat`, never a
  pattern string.** `useFormat().date(iso, 'dayMonth')`, `.dateRange(...)`,
  `.weekdays()`. Built and formatted in UTC, so no offset moves a day. The format tag is
  the browser's own when it speaks the UI language, so `en-GB` gets "1 Sept", `en-US`
  "Sep 1". The week starts on the locale's day (Monday in de/es/nl, from the date-fns
  locale's `weekStartsOn`); the calendar grid offsets from it.
- Plurals: `key_one` / `key_other` with `t(key, { count })`. The type allows `_few`,
  `_many` etc., so Russian or Polish can be added without loosening it.

**Hydration.** The build prerenders English. `main.tsx` hydrates only when the detected
language is English; anyone else waits for their chunk and gets a fresh `createRoot`
render. Crawlers are unaffected (no JS, or an English browser).

**Adding a language:** create `locales/xx.ts` (copy `de.ts`; the compiler lists every
missing key), add one line to `LOCALES` in `config.ts`, run `pnpm run check`, then check
the layout at 320px in that language — longer strings broke it twice on 2026-09-23
(German "Anleitung ausblenden", Spanish "Compartir"), and jsdom cannot see layout.
**Adding a string:** add the key to `en.ts`, use `t('...')`; typecheck then names each
locale that needs it.

Verified 2026-09-23 in Chromium against `wrangler pages dev dist`: English home hydrates
with no console errors; `de-DE` gets German and `<html lang="de">`; a `nl-NL` phone
joins, sees a Monday-first calendar, saves and gets the Dutch toast; switching to
Español persists across reload; `vi-VN` falls back to English; no horizontal scroll at
320px on `/` or `/trip/:id` in any of the four languages.

## Dates: never parse `YYYY-MM-DD` with `new Date()`

`new Date('2026-09-01')` is not 1 September. The spec parses a date-only string as an
*instant* — UTC midnight — so in New York it is the evening of 31 August, and reading
`getFullYear()/getMonth()/getDate()` off it there gives 2026/8/31.

This shipped: `getDatesBetween` did exactly that under a comment claiming to prevent it,
so every date in every trip was one day early for every user west of UTC, the trip's own
start date included. Fixed in `0a433d5`.

- **String in, string out?** Build from the string's digits and stay in UTC:
  `new Date(Date.UTC(y, m - 1, d))`, read back with `getUTC*`. This is what
  `getDatesBetween` and the API's `isCalendarDate` both do. Also check the result, because
  `Date.UTC` rolls `2026-02-31` forward to 3 March instead of rejecting it.
- **Displaying a date?** `useFormat()` from `src/i18n/format.ts` — it takes the
  `YYYY-MM-DD` string and a named style. **Feeding a date picker?** `parseISO(value)` from
  date-fns, which reads a date-only string as a *local* calendar day, then
  `format(d, 'yyyy-MM-dd')` to go back. Never `toISOString().slice(0, 10)` on a local Date.
- **Comparing two `YYYY-MM-DD` strings?** Compare the strings. The format sorts correctly.

**The suite runs in `America/New_York`** — see `src/test/setup.ts`; override with
`WGW_TEST_TZ`. UTC+0 is the one offset where all of this is invisible, which is why the
old suite passed for months. A test named "does not shift dates in a timezone behind UTC"
stubbed `Date.prototype.getTimezoneOffset`, a method none of the code calls, and passed
while the bug was live: when guarding timezone behaviour, change the timezone, do not stub
a method and hope.

When touching date code, run more than one offset:

```bash
for tz in UTC Asia/Tokyo Pacific/Kiritimati Pacific/Midway; do WGW_TEST_TZ=$tz pnpm test; done
```

## Four defects found and fixed here

1. ~~Drag-to-select does not work on touch.~~ **Fixed.**
   `src/components/AvailabilityCalendar.tsx` now resolves each `touchmove` through
   `document.elementFromPoint` to the cell under the finger, and Enter/Space work too —
   they previously did nothing, because the synthesised click hits an intentionally inert
   `onClick`. Cells also gained `aria-pressed` and a full date as their accessible name.
2. ~~Best-dates enumerates the full power set of participants.~~ **Fixed.** The
   algorithm now lives in `src/lib/bestDates.ts` and walks date ranges carrying a bitmask
   intersection, so it scales with participants rather than 2^n. Verified in a browser
   with 35 participants, where the old version offered a range all 35 could make to only
   6 of them.
3. ~~A tap on a phone selects nothing; only a press-and-hold works.~~ **Fixed.** A touch
   that ends without any `preventDefault` is followed by compatibility
   mousedown/mouseup/click on the same element, so `beginDrag` ran twice - once from
   `touchstart` and once from the synthetic mousedown - and the day toggled straight back
   off. A hold only worked because it fires `touchmove`, whose `preventDefault` suppresses
   those compatibility events. `AvailabilityCalendar` now stamps the time of the last
   touch and the mouse handlers ignore anything within 700ms of it. Guarded by a test that
   fires the whole real sequence (touchstart, touchend, mouseover/enter/down/up/click) and
   asserts one toggle; it fails with two before the fix.
4. ~~"Min" days in `BestDates` cannot be cleared.~~ **Fixed.** The box held a `number` and
   coerced with `parseInt(value) || 1` on every keystroke, so deleting the 1 put a 1 back
   and the only route to 2 was typing 12 and then deleting the 1. It now holds the raw
   string, allows an empty box while it is being retyped, reads 1 for the filter in the
   meantime, and normalises on blur.

## Saves, limits and speed — the 2026-09-23 audit

- **A save cannot silently overwrite a newer answer.** `PUT .../participants` takes
  `expectedUpdatedAt`: the participant's `updated_at` as the client read it (a string),
  `null` for "nobody has this name yet", or absent for no check (bundles cached from
  before the field). A mismatch is a **409 whose body carries the current trip**;
  `TripPage` shows it, keeps the marks on screen, and a second save replaces it
  knowingly. It exists because the pencil in the participants list lets one phone edit
  Bob while Bob edits himself, and the whole-list replace used to erase one of them.
- **A save never changes the stored spelling of a name.** "anna" saving over "Anna"
  used to rename her; renaming is PATCH's job. The join form trims before matching.
- **A trip spans at most 366 days** (`LIMITS.tripDays`, mirrored as `MAX_TRIP_DAYS` in
  `tripStore.ts` and as the end picker's `maxDate`); `datesPerParticipant` is 366 to
  match. Before this, 0001-01-01..9999-12-31 passed validation and would have frozen
  every visitor's tab. Production on 2026-09-23 held 36 trips, longest 365 days, none
  over the cap. `readTrip` also drops stored dates outside the trip's range.
- **`readTrip` is one D1 round trip** (a `batch` of both SELECTs), and the typical save
  is two (UPDATE, read) where it was four.
- **The trip calendar is memoised.** `AvailabilityCalendar` is `React.memo`, the heat-map
  counts and day labels are computed once per input change, and `TripPage` passes the
  read-only one stable props. Measured in headless Chromium at 4x CPU throttle, a
  366-day trip with 41 people: one drag step 200-450 ms before, 36-57 ms after (each
  figure includes one ~16 ms frame wait).
- **The home page ships 25% less JavaScript**: 162.9 -> 122.4 kB gzip on its critical
  path. `sonner`, `@tanstack/react-query` and `next-themes` were bundled and never used
  and are gone; `date-fns` is on v4 so it dedupes with `react-day-picker`'s; and the
  date picker is a lazy chunk fetched on hover/focus of its trigger.
- **An `ErrorBoundary` sits under the router**, so a render error or a lazy chunk that
  fails after a deploy shows a reload button rather than a blank page. It renders no
  DOM while nothing has failed, which keeps prerendered markup and hydration identical.

## Conventions

- **Commit straight to `main`. Do not open pull requests.** This is the owner's explicit
  instruction, and it replaces the branch-and-PR rule that used to sit here.
- **Therefore run the gates locally before every push.** CI does run on pushes to `main`,
  but only after the fact, and Cloudflare Pages deploys `main` automatically — so a bad
  commit reaches production before the tests have finished disagreeing with it.
  `pnpm run check` before `git push` is the whole safety net.
- **Check `git status` before staging.** More than one session has worked in this
  checkout at once, and `git add -A` will happily commit someone else's work in progress.
  It has already happened once. If the tree holds changes that are not yours, use your own
  `git worktree` instead of stashing or reverting theirs.
- Commit messages state what was verified and what was not. "Implemented" is not a
  result; the run where it worked is.
- Keep this file and `README.md` true as part of the change that invalidates them.
