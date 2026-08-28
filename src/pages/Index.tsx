import { Link } from 'react-router-dom';
import { CreateTripForm } from '@/components/CreateTripForm';
import { Tutorial } from '@/components/Tutorial';
import { usePageMeta } from '@/lib/usePageMeta';

const Index = () => {
  usePageMeta('/');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-3 px-4">
        <div className="container max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
            <img src="/favicon.png" alt="WeGoWhen Logo" className="w-full h-full object-contain" />
          </div>
          <div className="h-8 flex items-center">
            <span className="font-display font-semibold text-xl sm:text-2xl select-none">
              WeGoWhen
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="container max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Tutorial Section - Left */}
            <div className="lg:col-span-1">
              <Tutorial />
            </div>
            
            {/* Form Section - Right */}
            <div className="lg:col-span-2">
              <div className="max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left mb-8 animate-fade-in">
                  <h1 className="text-4xl font-display font-bold text-foreground mb-3">
                    Find the days your group can actually go
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Plan trips with friends by finding when everyone's available
                  </p>
                </div>

                <CreateTripForm />

                <p className="mt-4 text-sm text-muted-foreground text-center lg:text-left">
                  Free, no account, and nothing for your friends to sign up to.
                </p>
              </div>
            </div>
          </div>

          <section className="mt-16 max-w-3xl mx-auto lg:mx-0 border-t border-border/40 pt-8">
            <h2 className="text-2xl font-display font-semibold mb-3">
              A trip is not an hour
            </h2>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Meeting pollers answer "which hour suits everyone" and hand you a grid of
              time slots to read. A trip is a stretch of days, so WeGoWhen asks only about
              days and answers with the ranked date ranges that fit the most people —
              "6 of 6 free, Fri 12 to Mon 15" rather than a wall of ticks.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <li>
                <Link to="/when2meet-alternative" className="text-primary hover:underline">
                  Compared with When2meet
                </Link>
              </li>
              <li>
                <Link to="/doodle-alternative" className="text-primary hover:underline">
                  Compared with Doodle
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary hover:underline">
                  Questions and answers
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="font-display font-semibold text-lg mb-3">WeGoWhen</h3>
              <p className="text-sm text-muted-foreground">
                The best way to plan your trips.
              </p>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-medium mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn */}
            <div>
              <h4 className="font-medium mb-3">Learn</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/when2meet-alternative" className="text-muted-foreground hover:text-foreground transition-colors">
                    When2meet alternative
                  </Link>
                </li>
                <li>
                  <Link to="/doodle-alternative" className="text-muted-foreground hover:text-foreground transition-colors">
                    Doodle alternative
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-medium mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border/40 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Share the link. Mark your dates. Go on adventures.
            </p>
            <p className="text-xs mt-2 opacity-60">v1.7.4</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
