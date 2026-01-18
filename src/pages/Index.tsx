import { CreateTripForm } from '@/components/CreateTripForm';
import { Plane } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="py-6 px-4">
        <div className="container max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-semibold">TripSync</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-4xl font-display font-bold text-foreground mb-3">
              Find the perfect date
            </h2>
            <p className="text-lg text-muted-foreground">
              Plan trips with friends by finding when everyone's available
            </p>
          </div>
          
          <CreateTripForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <p>Share the link. Mark your dates. Go on adventures.</p>
        <p className="text-xs mt-1 opacity-60">v1.1.0</p>
      </footer>
    </div>
  );
};

export default Index;
