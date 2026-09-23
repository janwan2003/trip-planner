import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import { DEFAULT_LOCALE, detectLocale, setLocale } from "./i18n";
import { applyLegacyHashRedirect } from "./lib/legacyHashRoute.ts";
import "./index.css";

// Before the router mounts, so a link shared while the app used HashRouter
// (`/#/trip/abc`) resolves to the path form the router now understands.
applyLegacyHashRedirect();

const root = document.getElementById("root")!;

// The eight indexable routes ship with their body already rendered into `#root` by
// the build, so they hydrate; `/trip/:id` is served the empty shell and mounts
// normally. Calling `createRoot` on prerendered markup would throw that markup away
// and repaint, which is the one thing the prerendering exists to avoid.
//
// The build prerenders in English, so only an English visitor can hydrate that markup:
// hydrating it under German strings would mismatch on every node and React would throw
// it away anyway. Anyone else waits for their language's chunk and gets a fresh render.
// That trade costs nothing for crawlers - they either do not run JavaScript or report
// an English browser - and a first paint in the wrong language for everyone else.
const locale = detectLocale();

if (root.hasChildNodes() && locale === DEFAULT_LOCALE) {
  hydrateRoot(root, <App />);
} else {
  void setLocale(locale)
    .catch((error) => {
      // A chunk that fails to load must not leave a blank page; English is in memory.
      console.error("Could not load language", locale, error);
    })
    .finally(() => {
      createRoot(root).render(<App />);
    });
}
