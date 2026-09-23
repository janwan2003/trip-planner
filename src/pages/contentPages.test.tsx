import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import About from './About';
import Contact from './Contact';
import NotFound from './NotFound';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';

/**
 * These are content pages: rendering them correctly, with accurate claims, is the
 * whole behaviour. The infrastructure assertions are the point rather than filler —
 * all four pages previously named Supabase and GitHub Pages, which stopped being true,
 * and a legal page that misnames its data processor is a real defect.
 */
describe('content pages', () => {
  it('About describes the current stack, not the retired one', () => {
    renderWithRouter(<About />);

    expect(screen.getByRole('heading', { name: /About WeGoWhen/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Cloudflare D1/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cloudflare Pages/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/GitHub Pages/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/React 18/)).not.toBeInTheDocument();
  });

  it('About offers a way back home', () => {
    renderWithRouter(<About />);
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/');
  });

  it('Contact answers how data is protected without inventing Supabase features', () => {
    renderWithRouter(<Contact />);

    expect(screen.getByText(/How is my data protected\?/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Cloudflare D1/i).length).toBeGreaterThan(0);
    // "Row Level Security" is a Postgres/Supabase concept that does not exist in D1.
    expect(screen.queryByText(/Row Level Security/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
  });

  it('Contact links to the privacy policy', () => {
    renderWithRouter(<Contact />);
    expect(screen.getAllByRole('link', { name: /privacy policy/i })[0]).toHaveAttribute(
      'href',
      '/privacy',
    );
  });

  it('the privacy policy names Cloudflare as the processor and nobody else', () => {
    renderWithRouter(<PrivacyPolicy />);

    expect(screen.getByRole('heading', { name: /^Privacy Policy$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Cloudflare/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/GitHub Pages/i)).not.toBeInTheDocument();
  });

  it('the privacy policy still covers the sections users rely on', () => {
    renderWithRouter(<PrivacyPolicy />);

    for (const heading of [
      /Information We Collect/i,
      /How We Use Your Information/i,
      /Data Storage and Security/i,
      /Data Sharing/i,
      /Your Rights/i,
      /Third-Party Services/i,
      /Data Retention/i,
    ]) {
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  /**
   * A privacy policy is a factual claim about the code, and it has now been wrong in both
   * directions. First it overclaimed - browser type, pages visited, time on page,
   * interaction patterns, none of which anything measured. Then it underclaimed: it said
   * "We run no analytics" while Cloudflare Web Analytics was switched on at the zone and
   * had been recording page views and referrers since at least 2026-09-04 (RUM site
   * 5c4f103f, auto_install true). Both are false statements to a stranger.
   *
   * Cloudflare Web Analytics is cookieless and does not fingerprint, so the disclosure
   * says exactly that and no more. If the analytics are ever turned off, or swapped for
   * something that does set cookies, this test is the thing that should fail first.
   */
  it('the privacy policy describes the analytics that actually run', () => {
    renderWithRouter(<PrivacyPolicy />);

    // Disclosed, by name, because it is running.
    expect(screen.getAllByText(/Cloudflare Web Analytics/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sets no cookies/i)).toBeInTheDocument();

    // The old false denial must not come back.
    expect(screen.queryByText(/We run no analytics/i)).not.toBeInTheDocument();

    // Still not claimed, because Web Analytics measures none of these.
    expect(screen.queryByText(/time spent on pages/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/interaction patterns/i)).not.toBeInTheDocument();
  });

  it('the privacy policy discloses what the feedback form stores', () => {
    renderWithRouter(<PrivacyPolicy />);

    // POST /api/feedback stores the message, the optional email, the page and the user agent.
    const item = screen.getByText(/Report a bug or Suggest a feature/i);
    expect(item).toHaveTextContent(/email address/i);
    expect(item).toHaveTextContent(/user agent/i);
  });

  it('the privacy policy discloses the origin label stored with a new trip', () => {
    renderWithRouter(<PrivacyPolicy />);

    // POST /api/trips stores `origin`: trip-page, invitee or direct, derived from the
    // recent-trips list. That list is otherwise "never sent to us", so the policy has to
    // say what is derived from it and that it is not identifying.
    const item = screen.getByText(/How a Trip Was Started/i).closest('li')!;
    expect(item).toHaveTextContent(/Start your own trip/i);
    expect(item).toHaveTextContent(/someone else's trip before/i);
    expect(item).toHaveTextContent(/says nothing about who you are/i);
    expect(screen.getByText(/^Local Storage:$/i).closest('li')).toHaveTextContent(
      /only the single label above is derived from it/i,
    );
  });

  it('the privacy policy says what an invitation link preview shows', () => {
    renderWithRouter(<PrivacyPolicy />);

    // functions/trip/[id].ts puts the date range in the preview tags, and nothing else.
    const item = screen.getByText(/Link Previews/i).closest('li')!;
    expect(item).toHaveTextContent(/date range/i);
    expect(item).toHaveTextContent(/never its name or who has joined/i);
  });

  it('the privacy policy does not promise an archival schedule nothing implements', () => {
    renderWithRouter(<PrivacyPolicy />);

    // It promised removal "typically 24 months" after last access. No job does this.
    expect(screen.queryByText(/24 months/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no automatic expiry or archival/i)).toBeInTheDocument();
  });

  it('the privacy policy discloses every local-storage key the app writes', () => {
    renderWithRouter(<PrivacyPolicy />);

    // recentTrips and identity both write; the policy covered only the first.
    expect(screen.getAllByText(/trips you have opened in this browser/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/the name you last used to join a trip/i)).toBeInTheDocument();
  });

  it('the privacy policy says how to exercise the rights it lists', () => {
    renderWithRouter(<PrivacyPolicy />);

    // Listing GDPR rights with no mechanism is not a policy, it is a template.
    expect(screen.getByText(/withdraw entirely/i)).toBeInTheDocument();
    const contact = screen.getAllByRole('link', { name: /contact/i });
    expect(contact.length).toBeGreaterThan(0);
    expect(contact[0]).toHaveAttribute('href', '/contact');
  });

  it('the contact page does not point at contact details it does not have', () => {
    renderWithRouter(<Contact />);

    // It offered "Report critical bugs using the information below" and listed "Use the
    // app and explore its features" as a way of getting in touch. Neither was true.
    expect(screen.queryByText(/information below/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/explore its features/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no support address yet/i)).toBeInTheDocument();
  });

  it('the terms name Cloudflare infrastructure', () => {
    renderWithRouter(<TermsOfService />);

    expect(screen.getByRole('heading', { name: /^Terms of Service$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Cloudflare/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
  });

  it('both legal pages were re-dated when their content changed', () => {
    const { unmount } = renderWithRouter(<PrivacyPolicy />);
    // Re-dated for the stored language choice and the feedback form (2026-09-23).
    expect(screen.getByText(/Last updated: September 23, 2026/)).toBeInTheDocument();
    unmount();

    renderWithRouter(<TermsOfService />);
    expect(screen.getByText(/Last updated: August 28, 2026/)).toBeInTheDocument();
  });

  it('discloses the stored language choice, which src/i18n/detect.ts writes to local storage', () => {
    renderWithRouter(<PrivacyPolicy />);
    expect(screen.getAllByText(/the language you (chose|picked) for the site/i).length).toBe(2);
  });

  it('NotFound tells the visitor where they are and offers a way out', () => {
    renderWithRouter(<NotFound />, { route: '/nowhere' });

    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
