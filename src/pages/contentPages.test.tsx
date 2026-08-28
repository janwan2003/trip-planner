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

  it('the terms name Cloudflare infrastructure', () => {
    renderWithRouter(<TermsOfService />);

    expect(screen.getByRole('heading', { name: /^Terms of Service$/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Cloudflare/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Supabase/i)).not.toBeInTheDocument();
  });

  it('both legal pages were re-dated when their content changed', () => {
    const { unmount } = renderWithRouter(<PrivacyPolicy />);
    expect(screen.getByText(/Last updated: August 28, 2026/)).toBeInTheDocument();
    unmount();

    renderWithRouter(<TermsOfService />);
    expect(screen.getByText(/Last updated: August 28, 2026/)).toBeInTheDocument();
  });

  it('NotFound tells the visitor where they are and offers a way out', () => {
    renderWithRouter(<NotFound />, { route: '/nowhere' });

    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
