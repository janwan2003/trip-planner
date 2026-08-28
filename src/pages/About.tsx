import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/lib/usePageMeta';

export default function About() {
  usePageMeta('/about');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-display font-bold mb-6">About WeGoWhen</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              WeGoWhen help planning group trips by simplifying the process of coordinating everyone's availability.
              Our goal is to make a very easy-to-use tool that removes the hassle from group trip planning, so you can focus on enjoying your time with friends and family.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">How It Works</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">1. Create a Trip</h3>
                <p>Set your trip name and date range. Get a unique shareable link instantly.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">2. Share the Link</h3>
                <p>Send the link to your group. No sign-ups or accounts required.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">3. Mark Availability</h3>
                <p>Everyone marks their available dates with an intuitive calendar interface.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">4. Find Perfect Dates</h3>
                <p>See which dates work best for everyone with our heat map and best dates feature.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Why WeGoWhen?</h2>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>No Account Required:</strong> Start planning immediately without sign-ups</li>
              <li><strong>Visual & Intuitive:</strong> See everyone's availability at a glance</li>
              <li><strong>Mobile Friendly:</strong> Works perfectly on any device</li>
              <li><strong>Privacy Focused:</strong> Your data is secure and only accessible via your unique link</li>
              <li><strong>Completely Free:</strong> No hidden costs, no premium tiers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Our Technology</h2>
            <p className="mb-4">
              WeGoWhen is built with modern web technologies:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>React 19 with TypeScript for a type-safe, responsive interface</li>
              <li>Cloudflare D1 for trip storage, reached through Cloudflare Pages Functions</li>
              <li>Tailwind CSS and shadcn/ui for modern, accessible design</li>
              <li>Hosted on Cloudflare Pages for reliable availability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Perfect For</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🏖️ Vacation Planning</h3>
                <p className="text-sm">Coordinate beach trips, ski weekends, or city breaks</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🎉 Events & Celebrations</h3>
                <p className="text-sm">Plan reunions, bachelor parties, or birthday getaways</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">🏕️ Adventure Groups</h3>
                <p className="text-sm">Schedule hiking trips, camping adventures, or road trips</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">👨‍👩‍👧‍👦 Family Gatherings</h3>
                <p className="text-sm">Find dates for family reunions or holiday visits</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Start Planning Today</h2>
            <p className="mb-4">
              WeGoWhen is a new tool designed to simplify group trip planning. We're continuously 
              improving and adding features based on user feedback.
            </p>
            <p className="mb-4">
              Ready to plan your next adventure? <Link to="/" className="text-primary hover:underline font-semibold">Create a trip now</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
