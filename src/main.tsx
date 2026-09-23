import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import { DEFAULT_LOCALE, detectLocale, setLocale } from "./i18n";
import { localeFromPath } from "./i18n/detect";
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
//
// A language in the URL (`/ja`, `/fr/alternative-framadate`) is an explicit request and
// beats everything else - and it is also the language that page was prerendered in, so
// those pages always hydrate once their chunk is loaded.
const urlLocale = localeFromPath(window.location.pathname);
const locale = urlLocale ?? detectLocale();
const prerenderedIn = urlLocale ?? DEFAULT_LOCALE;

if (root.hasChildNodes() && locale === prerenderedIn) {
  void setLocale(locale)
    .catch((error) => console.error("Could not load language", locale, error))
    .finally(() => hydrateRoot(root, <App />));
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
