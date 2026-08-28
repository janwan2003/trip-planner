import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { applyLegacyHashRedirect } from "./lib/legacyHashRoute.ts";
import "./index.css";

// Before the router mounts, so a link shared while the app used HashRouter
// (`/#/trip/abc`) resolves to the path form the router now understands.
applyLegacyHashRedirect();

createRoot(document.getElementById("root")!).render(<App />);
