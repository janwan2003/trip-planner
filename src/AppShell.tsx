import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Code-split route components for better performance
const Index = lazy(() => import("./pages/Index"));
const TripPage = lazy(() => import("./pages/TripPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const When2meetAlternative = lazy(() => import("./pages/When2meetAlternative"));
const DoodleAlternative = lazy(() => import("./pages/DoodleAlternative"));
const Faq = lazy(() => import("./pages/Faq"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

/**
 * Everything below the router: the providers and the route table.
 *
 * Split out of `App` so the build-time prerenderer can render the identical tree
 * under a `StaticRouter` while the browser renders it under a `BrowserRouter`. If
 * the two trees differed by so much as a wrapper element, hydration would throw the
 * server markup away and the prerendered body would buy nothing but bytes.
 *
 * The routes stay `lazy` here for both consumers. `prerenderToNodeStream` awaits
 * suspended boundaries, so the build still emits the resolved page; the browser
 * suspends on first paint and React keeps the server HTML on screen until the chunk
 * arrives, which is why there is no flash of the "Loading..." fallback.
 */
export const AppShell = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/trip/:tripId" element={<TripPage />} />
          <Route path="/when2meet-alternative" element={<When2meetAlternative />} />
          <Route path="/doodle-alternative" element={<DoodleAlternative />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </TooltipProvider>
  </QueryClientProvider>
);
