import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, HelpCircle } from 'lucide-react';
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
            We're here to help! Get in touch with us for support, feedback, or general inquiries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 not-prose">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Email Support
                </CardTitle>
                <CardDescription>Get help with any issues or questions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  For support inquiries, bug reports, or general questions, please email us at:
                </p>
                <a 
                  href="mailto:support@wegowhen.com" 
                  className="text-primary hover:underline font-semibold"
                >
                  support@wegowhen.com
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  We typically respond within 24-48 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Feedback & Suggestions
                </CardTitle>
                <CardDescription>Help us improve WeGoWhen</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">
                  Have ideas for new features or improvements? We'd love to hear from you:
                </p>
                <a 
                  href="mailto:feedback@wegowhen.com" 
                  className="text-primary hover:underline font-semibold"
                >
                  feedback@wegowhen.com
                </a>
                <p className="text-xs text-muted-foreground mt-2">
                  Your input helps shape our roadmap
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
                  Your trip data is stored securely with enterprise-grade encryption. Only people with 
                  your unique trip link can access your trip. See our{' '}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-semibold mb-2">Can I delete a trip?</h3>
                <p className="text-muted-foreground">
                  Trips that haven't been accessed for 24 months are automatically archived. If you need 
                  immediate deletion, please contact us at support@wegowhen.com with your trip link.
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
                  Basic functionality works offline, but you'll need an internet connection to sync 
                  changes and see updates from other participants.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">Business Inquiries</h2>
            <p className="mb-4">
              For partnership opportunities, press inquiries, or business-related questions:
            </p>
            <a 
              href="mailto:business@wegowhen.com" 
              className="text-primary hover:underline font-semibold text-lg"
            >
              business@wegowhen.com
            </a>
          </section>

          <section className="mb-8 bg-muted/30 p-6 rounded-lg">
            <h2 className="text-2xl font-display font-semibold mb-4">Report a Bug</h2>
            <p className="mb-4">
              Found something that's not working right? Help us improve by reporting bugs:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Email us at <a href="mailto:support@wegowhen.com" className="text-primary hover:underline">support@wegowhen.com</a></li>
              <li>Include a description of the issue</li>
              <li>Let us know what device and browser you're using</li>
              <li>Share the trip link if relevant (optional)</li>
            </ol>
            <p className="text-sm text-muted-foreground mt-4">
              We appreciate your help in making WeGoWhen better for everyone!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
