import { build as viteBuild, defineConfig, Plugin, ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "path";
import { pathToFileURL } from "node:url";

import {
  PRIVATE_ROUTES,
  ROUTES,
  outputFileFor,
  renderRouteHtml,
  renderSitemap,
} from "./src/lib/siteMeta";

/**
 * Writes a real static HTML file per indexable route - head *and* body - plus the
 * sitemap and the two private shells.
 *
 * A single-page app served through the `/*` fallback in `public/_redirects` answers
 * every path with the same `index.html`, which means every page claims the same title,
 * description and canonical URL. Google renders JavaScript and would eventually see
 * the client-side corrections; link unfurlers, Bing, and the crawlers behind AI answers
 * largely do not. Emitting the head per route removes that question.
 *
 * The head alone was not enough. Until the body was prerendered too, `curl` on any of
 * the eight pages returned an empty `<div id="root">`: measured 2026-08-31, `/faq`
 * served 9,332 bytes in which the only occurrences of "When2meet" were inside the
 * FAQPage JSON-LD, not in any visible copy. Every non-rendering reader saw a blank
 * page, the two comparison pages included. `renderRouteBody` fills the root at build
 * time and `main.tsx` hydrates it.
 *
 * Cloudflare Pages serves a static file in preference to the SPA fallback, so
 * `dist/faq.html` is what answers `/faq`. `dist/404.html` is what Pages answers an
 * unmatched path with, at a real 404 rather than the soft 200 the old catch-all
 * rewrite produced, and `dist/trip.html` is the empty shell `/trip/:id` rewrites to.
 * Both carry `noindex` in the served bytes.
 *
 * `faq.html` rather than `faq/index.html` on purpose: Pages serves a directory index
 * only at the trailing-slash URL and answers `/faq` with a 308 to `/faq/`, which would
 * put a redirect hop in front of every page and disagree with the canonical URL. A
 * bare `.html` file is served at the extensionless path with a 200. Verified against
 * `wrangler pages dev` both ways.
 */
const prerenderRoutes = (): Plugin => {
  let config: ResolvedConfig;

  return {
    name: "wegowhen:prerender-routes",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const baseHtml = await readFile(path.join(outDir, "index.html"), "utf8");

      const write = async (file: string, html: string) => {
        const target = path.join(outDir, file);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, html);
      };

      // A second, SSR-target Vite build rather than a dev server used as a module
      // runner. `@vitejs/plugin-react-swc` picks its JSX transform from the *command*,
      // not the mode, so anything served emits `jsxDEV` calls into a module graph that
      // resolves the production `react/jsx-runtime`, and the build dies with "jsxDEV is
      // not a function" on the first page. A build gets the production transform.
      //
      // `configFile: false` with an explicit plugin list keeps this plugin out of the
      // inner build, which would otherwise recurse into itself.
      const ssrDir = path.join(config.root, "node_modules", ".wgw-prerender");
      await viteBuild({
        configFile: false,
        root: config.root,
        logLevel: "warn",
        resolve: config.resolve,
        plugins: [react()],
        build: {
          ssr: path.join(config.root, "src/entry-prerender.tsx"),
          outDir: path.relative(config.root, ssrDir),
          emptyOutDir: true,
          copyPublicDir: false,
          minify: false,
        },
      });

      try {
        const { renderRouteBody } = (await import(
          pathToFileURL(path.join(ssrDir, "entry-prerender.js")).href
        )) as { renderRouteBody: (routePath: string) => Promise<string> };

        for (const route of ROUTES) {
          const body = await renderRouteBody(route.path);
          if (body.trim().length === 0) {
            throw new Error(
              `prerender: ${route.path} rendered an empty body. That is the bug this ` +
                "plugin exists to prevent, so the build stops here.",
            );
          }
          await write(outputFileFor(route), renderRouteHtml(baseHtml, route, body));
        }
      } finally {
        await rm(ssrDir, { recursive: true, force: true });
      }

      // No body for these two: whatever were baked in would be the wrong page on
      // screen until React replaced it, and the trip screen in particular must not
      // flash the landing page at someone opening an invitation link.
      for (const route of PRIVATE_ROUTES) {
        await write(outputFileFor(route), renderRouteHtml(baseHtml, route));
      }

      await writeFile(path.join(outDir, "sitemap.xml"), renderSitemap());
      this.info(
        `prerendered ${ROUTES.length} routes with bodies, ` +
          `${PRIVATE_ROUTES.length} noindex shells, and sitemap.xml`,
      );
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), prerenderRoutes()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
