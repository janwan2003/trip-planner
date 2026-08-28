import { defineConfig, Plugin, ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "path";

import { ROUTES, renderRouteHtml, renderSitemap } from "./src/lib/siteMeta";

/**
 * Writes a real static HTML file per indexable route, plus the sitemap.
 *
 * A single-page app served through the `/*` fallback in `public/_redirects` answers
 * every path with the same `index.html`, which means every page claims the same title,
 * description and canonical URL. Google renders JavaScript and would eventually see
 * the client-side corrections; link unfurlers, Bing, and the crawlers behind AI answers
 * largely do not. Emitting the head per route removes the question.
 *
 * Cloudflare Pages serves a static file in preference to the SPA fallback, so
 * `dist/faq.html` is what answers `/faq`, and the fallback still covers `/trip/:id`
 * and anything else.
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

      for (const route of ROUTES) {
        const html = renderRouteHtml(baseHtml, route);
        if (route.path === "/") {
          await writeFile(path.join(outDir, "index.html"), html);
          continue;
        }
        const file = path.join(outDir, `${route.path}.html`);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, html);
      }

      await writeFile(path.join(outDir, "sitemap.xml"), renderSitemap());
      this.info(`prerendered ${ROUTES.length} routes and sitemap.xml`);
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
