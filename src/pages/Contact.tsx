import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Contact() {
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
            Have feedback or need support? We're working on setting up dedicated contact channels.
          </p>

          <div className="mb-12 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Get in Touch
                </CardTitle>
                <CardDescription>Contact options coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  We're currently setting up official support and feedback channels. In the meantime, 
                  you can use the app and provide feedback through the following ways:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Use the app and explore its features</li>
                  <li>Check back soon for direct contact options</li>
                  <li>Report critical bugs using the information below</li>
                </ul>
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
                  Your trip data is stored securely using Supabase with Row Level Security (RLS) policies. 
                  Only people with your unique trip link can access your trip. See our{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Can I delete a trip?</h3>
                <p className="text-muted-foreground">
                  Currently, trips are stored indefinitely. Manual deletion features are not yet available. 
                  Trips that haven't been accessed for extended periods may be archived in the future.
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
