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

`public/_redirects` provides the SPA fallback. Routing is **hash-based**
(`HashRouter`), so `/#/trip/:id` — not `/trip/:id`.

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
- **Coverage is 96.65% of lines, 88.76% of branches** across `src/lib`,
  `src/components` and `src/pages`, from 110 unit tests. Thresholds in
  `vitest.config.ts` enforce 90/90/85/90 — set below the measured result so an unrelated
  refactor does not turn red on its own. `src/components/ui/**` is excluded: vendored
  third-party code, and measuring it would dilute the number that matters.
- **21 integration tests** in `test/api.integration.test.ts` run the API against a real
  `wrangler pages dev` with a local D1. Nothing is mocked, so they cover the Functions,
  the SQL, the unique index and the middleware together.
- `src/components/ui/` holds ~48 vendored shadcn components; only 15 are imported by app
  code. The rest are dead but still typechecked and linted.

## Two real defects worth knowing before you touch this code

1. **Drag-to-select does not work on touch.** `src/components/AvailabilityCalendar.tsx`
   wires `onMouseDown` (line 166) and mouse-move logic only — there are no
   `onTouchStart`/`onPointerDown` handlers. PRODUCT.md records "must work on a phone" as a
   non-negotiable constraint, and the app itself says "Click and drag to select dates", so
   this is a contradiction, not a nice-to-have. Confirmed while testing: dispatching a
   plain `click()` on a day cell does nothing; only `mousedown` selects.
2. **Best-dates enumerates the full power set of participants.**
   `src/components/BestDates.tsx` runs `for (let mask = 1; mask < (1 << n); mask++)`. That
   is 2^n iterations: unusable around 20 participants, and at n = 31 `1 << 31` is negative
   so the loop never runs and the feature **silently returns nothing**.

## Conventions

- Branch off `main`, open a PR, never push straight to `main`.
- Commit and PR bodies state what was verified and what was not. "Implemented" is not a
  result; the run where it worked is.
- Keep this file and `README.md` true as part of the change that invalidates them.
