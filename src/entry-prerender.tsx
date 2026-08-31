import { prerenderToNodeStream } from "react-dom/static";
import { StaticRouter } from "react-router-dom/server";

import { AppShell } from "./AppShell";

/**
 * Renders one route to the HTML that goes inside `<div id="root">` at build time.
 *
 * Loaded by the `prerenderRoutes` plugin in `vite.config.ts` through `ssrLoadModule`,
 * so it runs in Node with the app's own module graph and aliases. It exists because a
 * per-route `<head>` is not enough: Bing, DuckDuckGo and every crawler behind an AI
 * answer read the served bytes without executing JavaScript, and until this landed
 * those bytes contained an empty `<div id="root">` on all eight pages - including the
 * two comparison pages that carry the commercial keywords.
 *
 * `prerenderToNodeStream` rather than `renderToString`: the route components are
 * `lazy`, and only the prerender API waits for a suspended boundary to resolve.
 * `renderToString` would emit the "Loading..." fallback on every page.
 */
export const renderRouteBody = async (path: string): Promise<string> => {
  const errors: unknown[] = [];

  const { prelude } = await prerenderToNodeStream(
    <StaticRouter location={path}>
      <AppShell />
    </StaticRouter>,
    {
      // A page that renders half of itself is worse than a build that stops: the
      // half would ship, look fine to a browser that hydrates it, and be the only
      // thing a non-rendering crawler ever sees.
      onError: (error) => {
        errors.push(error);
      },
    },
  );

  const chunks: Buffer[] = [];
  for await (const chunk of prelude) {
    chunks.push(Buffer.from(chunk));
  }

  if (errors.length > 0) {
    throw new Error(
      `prerender: ${path} raised ${errors.length} error(s) while rendering. First: ${String(errors[0])}`,
    );
  }

  return Buffer.concat(chunks).toString("utf8");
};
