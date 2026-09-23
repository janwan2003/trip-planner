import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/lib/usePageMeta';
import { SiteFooter } from '@/components/SiteFooter';

export default function About() {
  usePageMeta('/about');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-display font-bold mb-6">About WeGoWhen</h1>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">What WeGoWhen is</h2>
            <p className="mb-4">
              WeGoWhen is a free web app for choosing the dates of a group trip. The organiser
              sets an outer window and shares one link; everyone taps the whole days they are
              free; WeGoWhen ranks the runs of consecutive days that fit the most people. No one
              needs an account, and there is nothing to install.
            </p>
            <p className="mb-4">
              It answers a different question from a meeting poll such as When2meet or Doodle:
              not which hour suits everyone, but which stretch of days does.
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
              WeGoWhen has been public since 28 August 2026. It works in eight languages, holds up
              to 200 people and a window of up to a year per trip, and has no paid tier. The
              &ldquo;Report a bug&rdquo; and &ldquo;Suggest a feature&rdquo; links at the top of
              the app reach the person who builds it.
            </p>
            <p className="mb-4">
              Ready to plan your next adventure? <Link to="/" className="text-primary underline underline-offset-2 font-semibold">Create a trip now</Link>
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
