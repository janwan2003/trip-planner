import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
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
          <h1 className="text-4xl font-display font-bold mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 18, 2026</p>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using TripSync ("the Service"), you accept and agree to be bound by the terms and 
              provisions of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              TripSync is a collaborative trip planning tool that allows users to coordinate availability and 
              plan group trips. The Service provides calendar-based availability tracking and trip coordination features.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">3. User Responsibilities</h2>
            <p className="mb-4">You agree to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide accurate information when creating trips</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not share trip links with unauthorized parties if privacy is a concern</li>
              <li>Respect other users' availability and privacy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">4. Data and Privacy</h2>
            <p className="mb-4">
              We collect and store trip information, participant names, and availability data as necessary to 
              provide the Service. All data is stored securely using Supabase infrastructure. For detailed 
              information about data handling, please see our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              The Service, including its original content, features, and functionality, is owned by TripSync 
              and is protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              The Service is provided "as is" without warranties of any kind. We are not liable for any damages 
              arising from the use or inability to use the Service, including but not limited to scheduling conflicts, 
              miscommunication, or data loss.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">7. Service Modifications</h2>
            <p className="mb-4">
              We reserve the right to modify or discontinue the Service at any time without notice. We shall 
              not be liable to you or any third party for any modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">8. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend access to the Service immediately, without prior notice or liability, 
              for any reason, including breach of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">9. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
              in which the Service is operated, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">10. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to update these Terms at any time. We will notify users of any changes by 
              updating the "Last updated" date. Continued use of the Service after changes constitutes acceptance 
              of the new Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-4">11. Contact</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us through our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
