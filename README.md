# WeGoWhen - Collaborative Trip Planner

Find the perfect dates for group trips by coordinating everyone's availability.

## 🚀 Live Site

[https://wegowhen.com](https://wegowhen.com)

## ✨ Features

- 📅 **Calendar-based availability** - Visual calendar interface for marking available dates
- 🖱️ **Drag to select** - Hold and drag to select multiple consecutive dates
- 📊 **Heat map visualization** - See at a glance when most people are available
- 🔗 **Easy sharing** - One-click link sharing for inviting friends
- 💾 **Shared storage** - Trips live in Cloudflare D1, so a link works across devices and people
- 📱 **Responsive design** - Works seamlessly on mobile and desktop
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Backend**: Cloudflare Pages Functions with a Cloudflare D1 database
- **Routing**: React Router
- **Date Handling**: date-fns
- **State Management**: React Query

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/janwan2003/trip-planner.git
cd trip-planner

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 🔧 Configuration

### Backend

Trips live in **Cloudflare D1**, reached through **Cloudflare Pages Functions** in
`functions/api/trips`. There is no third-party backend service and no configuration to
copy: the schema is applied idempotently on the first request by
`functions/_lib/schema.ts`, so a fresh database works immediately.

Run the app with its API locally:

```bash
pnpm run build
pnpm exec wrangler pages dev
```

That serves `dist` plus the Functions on `http://127.0.0.1:8788` against a **local** D1,
so nothing you do locally touches production data.

There is no localStorage fallback. An earlier version wrote through to localStorage
whenever the backend failed, which made a dead backend look like a working app while
every browser quietly kept its own private copy of a trip. Failures now surface instead.

## 🚀 Deployment

### Cloudflare Pages

Production is served by Cloudflare Pages at [wegowhen.com](https://wegowhen.com),
built automatically from the `main` branch. The Pages project is named
`wegowhen`; `wegowhen.com`, `www.wegowhen.com` and `wegowhen.pages.dev` all
serve it.

| Setting | Value |
| --- | --- |
| Framework preset | None (build command set explicitly) |
| Build command | `pnpm run build` |
| Build output directory | `dist` |
| Node version | 22 (Cloudflare default) |

This project uses **pnpm**. `pnpm-lock.yaml` is the only lockfile that belongs
in the repo — Cloudflare picks the package manager from whichever lockfile it
finds, so a stray `package-lock.json` or `bun.lockb` silently changes how
production installs. A committed `bun.lockb` is what broke the first build here.

`pnpm-workspace.yaml` allows postinstall scripts for `@swc/core` and `esbuild`;
pnpm blocks build scripts by default and neither of those compiles without one.

The Pages project needs one binding: the **D1 database** `wegowhen`, bound as `DB`.
Without it every `/api` request answers 503. There are no build-time environment
variables any more.

`public/_redirects` supplies the SPA fallback (`/* /index.html 200`).

### Search engine discoverability

`public/robots.txt` points crawlers at `sitemap.xml`, which is **generated at build
time** from `src/lib/siteMeta.ts` rather than kept by hand — the same list that drives
the router and the per-route static HTML. Routing is path-based, so every page in that
list is a real URL a crawler can index; `robots.txt` disallows `/trip/`, because a trip
is reachable by anyone holding its link and should not turn up in search results.

`public/llms.txt` is the equivalent summary for the crawlers behind AI answers: what the
product is, what it costs, its limits, and what it deliberately does not do. Beside it,
`llms-full.txt` carries every page's prose in one file and is **generated at build time**
from the bodies the prerenderer just wrote, and `public/pricing.md` states the single free
tier in a form an AI agent can parse without rendering a page.

Those readers do not run JavaScript, which is why each route is prerendered body and all —
`curl https://wegowhen.com/faq` returns the answers as text, not an empty `<div id="root">`.

Google: verified in Search Console as a Domain property, via the
`google-site-verification` TXT record on `wegowhen.com`. **Do not delete that TXT
record** — removing it un-verifies the property.

Bing and other engines: submissions go through [IndexNow](https://www.indexnow.org/),
which needs no account. The key is `public/5336c16045b1067eef246cc17ea1297d.txt`,
served at
`https://wegowhen.com/5336c16045b1067eef246cc17ea1297d.txt`; the file content must equal
its own filename minus `.txt`. **Do not delete or rename it** — the API rejects
submissions it cannot authenticate. To submit the pages:

```bash
curl -sS -X POST https://api.indexnow.org/indexnow -H 'Content-Type: application/json' -d '{"host":"wegowhen.com","key":"5336c16045b1067eef246cc17ea1297d","keyLocation":"https://wegowhen.com/5336c16045b1067eef246cc17ea1297d.txt","urlList":["https://wegowhen.com/","https://wegowhen.com/when2meet-alternative","https://wegowhen.com/doodle-alternative","https://wegowhen.com/faq"]}'
```

### Manual Build

```bash
pnpm run build
```

The built files will be in the `dist/` directory.

## 📖 Usage

1. **Create a trip**: Set trip name and date range
2. **Share the link**: Copy and share the trip URL with participants
3. **Mark availability**: Each person selects their available dates by clicking or dragging
4. **Find best dates**: View the heat map to see when everyone is available

## 🎯 Features in Detail

### Drag-to-Select Calendar
- Click and hold on a date, then drag to select multiple dates
- Perfect for marking long availability periods
- Visual feedback during selection

### Multi-Month View
- Calendar automatically adapts to show all months in the date range
- Month headers appear when spanning multiple months
- Proper week alignment for each month

### Availability Heat Map
- Color-coded visualization showing participation levels
- Tooltips showing participant names on hover
- Easy identification of optimal dates

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by Doodle and When2Meet
