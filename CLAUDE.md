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
on, each with its own title, description, canonical and Open Graph tags. `.html` files
rather than directory indexes on purpose — Pages answers `/faq` with a 308 to `/faq/`
when the file is `faq/index.html`, and serves `faq.html` at `/faq` with a 200.
`public/_redirects` still supplies the SPA fallback for everything not prerendered,
which is `/trip/:id` and any unknown path.

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

## Credentials

There are none any more. The Supabase project this repo used to point at no longer
exists, and nothing replaced it that needs a secret: D1 is reached through a binding,
not a key. `.env` is still gitignored if you need one.

## Known state, as of 2026-08-28

- **Backend is Cloudflare D1 via Pages Functions.** Supabase is gone from the repo
  entirely, along with the localStorage write-through that used to hide its absence.
- **Typing is fully strict.** `strict`, `noUnusedLocals`, `noUnusedParameters`,
  `noImplicitAny` and `noFallthroughCasesInSwitch` are all on, and the tree is clean.
- `pnpm lint` exits 0. The 7 remaining warnings are all
  `react-refresh/only-export-components` in vendored shadcn files; warnings do not fail
  the run, and those files are not ours to restructure.
- **Coverage is 97.70% of lines, 91.36% of branches** across `src/lib`,
  `src/components` and `src/pages`, from 243 unit tests (measured 2026-08-28 with
  `pnpm run test:coverage`; the 137 this line claimed before was long stale). Thresholds in
  `vitest.config.ts` enforce 90/90/85/90 — set below the measured result so an unrelated
  refactor does not turn red on its own. `src/components/ui/**` is excluded: vendored
  third-party code, and measuring it would dilute the number that matters.
  Re-measure with `pnpm run test:coverage` rather than trusting this line; it is a
  snapshot and goes stale the moment a test lands.
- **21 integration tests** in `test/api.integration.test.ts` run the API against a real
  `wrangler pages dev` with a local D1. Nothing is mocked, so they cover the Functions,
  the SQL, the unique index and the middleware together.
- `src/components/ui/` holds ~48 vendored shadcn components; only 15 are imported by app
  code. The rest are dead but still typechecked and linted.
- **The site is not in Google's index yet**: `site:wegowhen.com` returned nothing on
  2026-08-28. It now has eight indexable URLs rather than one, and **four public,
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
`marketing/directories.md`, launch drafts in `marketing/launch-copy.md`, and the
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
  `aggregateRating`: there are no reviews.
- `src/test/siteMetadata.test.ts` guards both — the absolute image URL, the declared
  dimensions matching the actual PNG, title and description lengths, and the absence of
  invented ratings.
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
- `public/robots.txt` disallows `/trip/`, and trip pages send `noindex` themselves: a
  trip's only credential is possession of its link, so a search result for one would
  break that. The 404 page is `noindex` too, because the SPA fallback answers an unknown
  path with a 200.

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

## Test data left on production

Two trips exist in the production D1 purely from smoke tests during the Cloudflare
migration: `prodsmoke0000000000000000000001` ("prod smoke") and
`prodtouch000000000000000000000001` ("touch check"). Their participants were removed, so
they hold no personal data, but the rows are still there.

**There is no way to delete a trip.** The API exposes create, read, and
add/rename/remove participant — nothing deletes a trip. So this junk cannot be cleaned up
through the app, and it cannot be cleaned up with `wrangler d1 execute --remote` from a
non-interactive session either: that needs `CLOUDFLARE_API_TOKEN`, which is not in any
`.env` here. Either set one, or run the delete from the D1 console in the dashboard.

Whether to add `DELETE /api/trips/:id` is a product decision, not a cleanup task: with no
accounts, anyone holding the link could delete everyone's answers.

## Claims in the legal pages that the code does not back

Both were checked against the codebase, not assumed:

- **§2.2 claims automatic collection of "Usage Data: Pages visited, time spent on
  pages, and interaction patterns".** There is no analytics anywhere — no gtag, no
  Plausible, no PostHog, nothing. `grep -riE "gtag|analytics|plausible|posthog" src/
  index.html functions/` is empty. Cloudflare keeps edge request logs, but the app
  collects none of this.
- **§9 claims trips "may be archived or removed after an extended period of inactivity
  (typically 24 months)".** Nothing archives or removes anything: there is no cron, no
  scheduled job, and Pages Functions have no cron triggers, so implementing it would
  need a separate Worker.

**Both have since been rewritten** (commit `00bcaf4`) to describe what the code does: the
policy now states that no analytics run, that retention is indefinite with no automatic
expiry, and how to exercise the rights it lists. Five tests guard the wording. The Contact
page was corrected in the same commit — it had promised "Report critical bugs using the
information below", where below was a FAQ and no contact details existed anywhere on the
site.

**Still outstanding:** no contact address is published, so a request to delete a whole trip
has nowhere to go. Which address to publish is the owner's call.

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
- **Displaying a date, or feeding a date picker?** `parseISO(value)` from date-fns, which
  reads a date-only string as a *local* calendar day, then `format(d, 'yyyy-MM-dd')` to go
  back. Never `toISOString().slice(0, 10)` on a local Date.
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
