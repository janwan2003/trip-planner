import { CreateTripForm } from '@/components/CreateTripForm';
import { Tutorial } from '@/components/Tutorial';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-3 px-4">
        <div className="container max-w-6xl mx-auto flex items-center gap-3">
          <div className="w-16 h-16">
            <img src="/trip-planner/favicon.png" alt="TripSync Logo" className="w-full h-full object-contain" />
          </div>
          <div className="h-8">
            <img src="/trip-planner/text-logo.png" alt="TripSync" className="h-full object-contain" />
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
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>Share the link. Mark your dates. Go on adventures.</p>
        <p className="text-xs mt-1 opacity-60">v1.3.6</p>
      </footer>
    </div>
  );
};

export default Index;
