import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface MarketingPageProps {
  /** The page's single `<h1>`. */
  title: string;
  /** One sentence under the title, in the same words the page targets. */
  standfirst: string;
  children: ReactNode;
}

/**
 * Shared chrome for the pages written to be found in a search result rather than
 * clicked through from the app: a header that leads back to the tool, a readable
 * column, a call to action, and links to the sibling pages so each one passes what
 * little authority it has to the others.
 */
export const MarketingPage = ({ title, standfirst, children }: MarketingPageProps) => (
  <div className="min-h-screen bg-background flex flex-col">
    <header className="py-3 px-4 border-b border-border/40">
      <div className="container max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src="/favicon.png" alt="" className="w-10 h-10 object-contain" />
          <span className="font-display font-semibold text-xl">WeGoWhen</span>
        </Link>
      </div>
    </header>

    <main className="flex-1 px-4 py-10">
      <article className="container max-w-3xl mx-auto">
        <h1 className="text-4xl font-display font-bold mb-4">{title}</h1>
        <p className="text-lg text-muted-foreground mb-10">{standfirst}</p>

        <div className="space-y-10">{children}</div>

        <div className="mt-14 rounded-xl border border-border bg-muted/30 p-6 text-center">
          <p className="text-lg font-display font-semibold mb-1">
            Find the days your group can actually go
          </p>
          <p className="text-sm text-muted-foreground mb-5">
            Free, no account, and nothing to install.
          </p>
          <Link to="/">
            <Button size="lg">
              Create a trip
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </article>
    </main>

    <footer className="border-t border-border/40 bg-muted/30 py-8 px-4">
      <nav className="container max-w-3xl mx-auto flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Link to="/faq" className="hover:text-foreground transition-colors">
          FAQ
        </Link>
        <Link to="/when2meet-alternative" className="hover:text-foreground transition-colors">
          When2meet alternative
        </Link>
        <Link to="/doodle-alternative" className="hover:text-foreground transition-colors">
          Doodle alternative
        </Link>
        <Link to="/about" className="hover:text-foreground transition-colors">
          About
        </Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">
          Privacy
        </Link>
      </nav>
    </footer>
  </div>
);

interface ComparisonRow {
  aspect: string;
  them: string;
  us: string;
}

/**
 * The honest comparison table. Every claim in the `them` column has to be checkable
 * against the competitor's own site on the day it was written, because an AI engine
 * cross-references these and a page caught overstating one loses the whole page.
 */
export const ComparisonTable = ({
  competitor,
  rows,
}: {
  competitor: string;
  rows: ComparisonRow[];
}) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left font-medium py-3 pr-4 w-1/3" />
          <th className="text-left font-medium py-3 pr-4">{competitor}</th>
          <th className="text-left font-medium py-3">WeGoWhen</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.aspect} className="border-b border-border/50 align-top">
            <th scope="row" className="text-left font-medium py-3 pr-4">
              {row.aspect}
            </th>
            <td className="py-3 pr-4 text-muted-foreground">{row.them}</td>
            <td className="py-3">{row.us}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Section = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section>
    <h2 className="text-2xl font-display font-semibold mb-3">{heading}</h2>
    <div className="space-y-4 leading-relaxed">{children}</div>
  </section>
);
