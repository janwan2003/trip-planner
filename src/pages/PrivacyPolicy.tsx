import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/lib/usePageMeta';

export default function PrivacyPolicy() {
  usePageMeta('/privacy');

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
          <h1 className="text-4xl font-display font-bold mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: August 28, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              WeGoWhen ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, and safeguard your information when you use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Trip Information:</strong> Trip names, start dates, and end dates</li>
              <li><strong>Participant Information:</strong> Names you provide when joining trips</li>
              <li><strong>Availability Data:</strong> The dates you mark as available for trips</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Browser Information:</strong> Browser type and version</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on pages, and interaction patterns</li>
              <li><strong>Local Storage:</strong> Tutorial preferences, UI state, and a list of trips you have opened in this browser (trip name, dates and link), stored in your browser</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide and maintain the trip planning service</li>
              <li>Coordinate availability between trip participants</li>
              <li>Display group availability and suggest optimal dates</li>
              <li>Improve and optimize the Service</li>
              <li>Respond to user inquiries and support requests</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">4. Data Storage and Security</h2>
            <p className="mb-4">
              All trip data is stored in Cloudflare D1, Cloudflare's managed SQL database, and is served from 
              Cloudflare's network. We implement appropriate technical and organizational measures to protect your 
              data against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="mb-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
              strive to use commercially acceptable means to protect your data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">5. Data Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. Your trip data is only 
              visible to people who have the specific trip link. We may share information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>With Trip Participants:</strong> Availability data is shared with others who access the same trip link</li>
              <li><strong>Service Providers:</strong> We use Cloudflare to host the application and to store trip data</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">6. Your Rights (GDPR)</h2>
            <p className="mb-4">If you are in the European Economic Area (EEA), you have the following rights:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Data Portability:</strong> Request transfer of your data</li>
              <li><strong>Object:</strong> Object to processing of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">7. Cookies and Local Storage</h2>
            <p className="mb-4">
              We use browser local storage to save your tutorial preferences, UI state, and a list of the trips
              you have opened in this browser so you can find them again without the link. That list holds each
              trip's name, dates and link, and nothing about other participants. This data is stored only on
              your device and is not transmitted to our servers. You can remove an individual trip from the list
              on the home page, or clear all of it at any time through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">8. Third-Party Services</h2>
            <p className="mb-4">Our Service uses the following third-party services:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li><strong>Cloudflare:</strong> Application hosting (Cloudflare Pages) and trip data storage (Cloudflare D1) (<a href="https://www.cloudflare.com/privacypolicy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            </ul>
          </section>


          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">9. Data Retention</h2>
            <p className="mb-4">
              Trip data is retained indefinitely unless explicitly deleted. Trips that are not accessed may 
              be archived or removed after an extended period of inactivity (typically 24 months).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">10. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by updating 
              the "Last updated" date at the top of this policy. You are advised to review this Privacy Policy 
              periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">11. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your data rights, 
              please contact us through the website or via email.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
