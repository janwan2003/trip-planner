import { Link } from 'react-router-dom';

const LINKS: { to: string; label: string }[] = [
  { to: '/', label: 'Home' },
  { to: '/faq', label: 'FAQ' },
  { to: '/when2meet-alternative', label: 'When2meet alternative' },
  { to: '/doodle-alternative', label: 'Doodle alternative' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/terms', label: 'Terms' },
  { to: '/privacy', label: 'Privacy' },
];

/**
 * The footer for the About, Contact, Terms and Privacy pages.
 *
 * Those four were dead ends: the only link out of each was "Back to Home", so a crawler
 * or a visitor landing on one from a search result could not reach the comparison pages
 * or the FAQ without going through the home page first. Lighthouse and a crawl of the
 * served HTML on 2026-09-23 both showed one internal link per page.
 */
export const SiteFooter = () => (
  <footer className="border-t border-border/40 bg-muted/30 py-8 px-4">
    <nav
      aria-label="Site"
      className="max-w-4xl mx-auto flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground"
    >
      {LINKS.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className="inline-flex min-h-11 items-center hover:text-foreground transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  </footer>
);
