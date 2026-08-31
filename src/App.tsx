import { BrowserRouter } from "react-router-dom";

import { AppShell } from "./AppShell";

// BrowserRouter, not HashRouter: with hash routing every view lived behind a `#`
// fragment, which search engines do not treat as a separate page, so the whole domain
// was a single indexable URL. Links shared in the hash era still work - `main.tsx`
// rewrites them before this mounts - and `public/_redirects` serves the SPA shell
// for `/trip/:id`, the one path the prerenderer does not emit a file for.
const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
