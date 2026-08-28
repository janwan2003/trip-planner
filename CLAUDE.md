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
pnpm dev            # vite dev server, port 8080
pnpm run build      # -> dist/
pnpm test           # vitest run
pnpm lint           # eslint
```

There is no `typecheck` script yet; run `npx tsc -p tsconfig.app.json --noEmit` directly.

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

## Credentials

Per the global convention, credentials live in `.env` at the repo root. **`.env` here is
currently stale**: it points at a Supabase project (`kbowfpedzqdtrgfsmizi.supabase.co`)
that no longer resolves in DNS. The same dead values were copied into the Cloudflare
Pages build-time variables. Do not treat that `.env` as a working backend.

## Known state, as of 2026-08-28

- **No backend.** The Supabase project is gone. Every call site in
  `src/lib/tripStore.ts` catches the failure and falls back to `localStorage`, so the site
  works but trips are per-browser and **sharing a trip link does not work**.
- **Decided:** replace Supabase with **Cloudflare Pages Functions + D1**. Stay entirely
  inside Cloudflare. `supabase-schema.sql` is the starting point for the D1 schema.
- **No CI and no pre-commit hooks.** The only workflow (`deploy.yml`, GitHub Pages) was
  removed when the site moved to Cloudflare. Gates are not wired yet.
- **Tests are a placeholder.** `src/test/example.test.ts` is the entire suite; one trivial
  assertion. Treat any coverage claim with suspicion until this changes.
- `tsconfig.app.json` has `strict: false`. Turning it on produces **0 errors**, and adding
  `noUnusedLocals`/`noUnusedParameters` produces 8, all dead imports. It is cheap to fix.
- `pnpm lint` currently exits non-zero: 5 errors, 7 warnings. The 7 warnings are
  `react-refresh/only-export-components` in vendored shadcn files and do not fail the run.
- `src/components/ui/` holds ~48 vendored shadcn components; only 15 are imported by app
  code. The rest are dead but still typechecked and linted.

## Two real defects worth knowing before you touch this code

1. **Drag-to-select does not work on touch.** `src/components/AvailabilityCalendar.tsx`
   wires `onMouseDown` (line 166) and mouse-move logic only — there are no
   `onTouchStart`/`onPointerDown` handlers. PRODUCT.md records "must work on a phone" as a
   non-negotiable constraint, and the README advertises drag selection, so this is a
   contradiction, not a nice-to-have.
2. **Best-dates enumerates the full power set of participants.**
   `src/components/BestDates.tsx` runs `for (let mask = 1; mask < (1 << n); mask++)`. That
   is 2^n iterations: unusable around 20 participants, and at n = 31 `1 << 31` is negative
   so the loop never runs and the feature **silently returns nothing**.

## Conventions

- Branch off `main`, open a PR, never push straight to `main`.
- Commit and PR bodies state what was verified and what was not. "Implemented" is not a
  result; the run where it worked is.
- Keep this file and `README.md` true as part of the change that invalidates them.
