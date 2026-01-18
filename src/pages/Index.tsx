import { Link } from 'react-router-dom';
import { CreateTripForm } from '@/components/CreateTripForm';
import { Tutorial } from '@/components/Tutorial';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-3 px-4">
        <div className="container max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-16 h-16">
            <img src="/trip-planner/favicon.png" alt="WeGoWhen Logo" className="w-full h-full object-contain" />
          </div>
          <div className="h-8 flex items-center">
            <span className="font-display font-semibold text-2xl select-none">
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
                  <h2 className="text-4xl font-display font-bold text-foreground mb-3">
                    Find the perfect date
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Plan trips with friends by finding when everyone's available
                  </p>
                </div>
                
                <CreateTripForm />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-12 px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
            <p className="text-xs mt-2 opacity-60">v1.5.9</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
