import { Link } from 'react-router-dom';

import { MarketingPage } from '@/components/MarketingPage';
import { FAQ } from '@/lib/siteMeta';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Renders the same `FAQ` array that the prerenderer turns into `FAQPage` JSON-LD, so
 * the structured data can never describe an answer this page does not show.
 *
 * Plain headings and paragraphs rather than an accordion: an answer hidden behind a
 * click is harder to extract, and being extractable is the entire point of this page.
 */
export default function Faq() {
  usePageMeta('/faq');

  return (
    <MarketingPage
      title="Questions about planning group trip dates"
      standfirst="What WeGoWhen does, what it deliberately does not do, and how it differs from a meeting poll."
    >
      {FAQ.map(({ question, answer }) => (
        <section key={question}>
          <h2 className="text-xl font-display font-semibold mb-2">{question}</h2>
          <p className="leading-relaxed text-muted-foreground">{answer}</p>
        </section>
      ))}

      <section>
        <h2 className="text-xl font-display font-semibold mb-2">Something not answered here?</h2>
        <p className="leading-relaxed text-muted-foreground">
          <Link to="/contact" className="text-primary hover:underline">
            Get in touch
          </Link>
          . The longer comparisons live on the{' '}
          <Link to="/when2meet-alternative" className="text-primary hover:underline">
            When2meet
          </Link>{' '}
          and{' '}
          <Link to="/doodle-alternative" className="text-primary hover:underline">
            Doodle
          </Link>{' '}
          pages.
        </p>
      </section>
    </MarketingPage>
  );
}
