import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// BrowserRouter, not HashRouter: with hash routing every view lived behind a `#`
// fragment, which search engines do not treat as a separate page, so the whole domain
// was a single indexable URL. Links shared in the hash era still work - `main.tsx`
// rewrites them before this mounts - and `public/_redirects` serves the SPA fallback
// for paths the prerenderer did not emit a file for.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
