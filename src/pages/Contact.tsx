import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageMeta } from '@/lib/usePageMeta';

export default function Contact() {
  usePageMeta('/contact');

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
          <h1 className="text-4xl font-display font-bold mb-6">Contact Us</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Most questions are answered below. There is no support address yet, and this page says so
            rather than pointing you at a channel that does not exist.
          </p>

          <div className="mb-12 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Get in Touch
                </CardTitle>
                <CardDescription>No contact address yet</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  WeGoWhen is run by one person and has no support inbox at the moment. Two things you
                  can do without one:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>
                    Remove your own name and availability from a trip yourself, with Withdraw on that
                    trip's page - no request to us needed
                  </li>
                  <li>
                    Read the{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for
                    exactly what is stored and where
                  </li>
                </ul>
                <p className="text-sm mt-4">
                  Requests that do need a human - deleting a whole trip, for instance - cannot be
                  actioned until an address is published here.
                </p>
              </CardContent>
            </Card>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" />
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">How do I create a trip?</h3>
                <p className="text-muted-foreground">
                  Simply enter a trip name and select your date range on the homepage. You'll instantly 
                  get a shareable link that you can send to your group.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Is WeGoWhen free to use?</h3>
                <p className="text-muted-foreground">
                  Yes! WeGoWhen is completely free with no hidden costs or premium tiers. We believe 
                  trip planning should be accessible to everyone.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Do I need to create an account?</h3>
                <p className="text-muted-foreground">
                  No account required! Just create a trip, share the link, and start coordinating. 
                  It's that simple.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">How is my data protected?</h3>
                <p className="text-muted-foreground">
                  Your trip data is stored in Cloudflare D1 and reached only through this app's own API. 
                  Only people with your unique trip link can access your trip. See our{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Can I delete a trip?</h3>
                <p className="text-muted-foreground">
                  You can remove yourself from a trip at any time: open it and use Withdraw, which
                  deletes your name and the dates you marked. Deleting an entire trip is not yet
                  possible - trips are stored indefinitely and nothing expires them automatically.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">What browsers are supported?</h3>
                <p className="text-muted-foreground">
                  WeGoWhen works on all modern browsers including Chrome, Firefox, Safari, and Edge. 
                  We also support mobile browsers for iOS and Android.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Can I use WeGoWhen offline?</h3>
                <p className="text-muted-foreground">
                  You need an internet connection to create trips, load existing trips, and save changes. 
                  Offline functionality is not currently supported.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8 bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-display font-semibold mb-4">Found a Bug?</h2>
            <p className="mb-4">
              If you encounter any issues while using WeGoWhen:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Try refreshing the page</li>
              <li>Clear your browser cache if the problem persists</li>
              <li>Check your internet connection for sync issues</li>
              <li>Note the specific steps that caused the issue for future reference</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              We're working on establishing official bug reporting channels. Thank you for your patience!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
