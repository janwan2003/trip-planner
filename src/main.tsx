import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
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
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
