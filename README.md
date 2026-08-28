# WeGoWhen - Collaborative Trip Planner

Find the perfect dates for group trips by coordinating everyone's availability.

## 🚀 Live Site

[https://wegowhen.com](https://wegowhen.com)

## ✨ Features

- 📅 **Calendar-based availability** - Visual calendar interface for marking available dates
- 🖱️ **Drag to select** - Hold and drag to select multiple consecutive dates
- 📊 **Heat map visualization** - See at a glance when most people are available
- 🔗 **Easy sharing** - One-click link sharing for inviting friends
- 💾 **Persistent storage** - Works with localStorage by default, Supabase for multi-device sync
- 📱 **Responsive design** - Works seamlessly on mobile and desktop
- 🎨 **Beautiful UI** - Built with shadcn/ui and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Database**: Supabase (optional) or localStorage (default)
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

### Using with Supabase (Optional)

WeGoWhen works out of the box with localStorage. For multi-device synchronization and sharing:

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL script from `supabase-schema.sql` in your Supabase SQL editor
3. Copy `.env.example` to `.env`
4. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The app automatically falls back to localStorage if Supabase is not configured.

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

Build-time environment variables (set for Production and Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`public/_redirects` supplies the SPA fallback (`/* /index.html 200`).

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
