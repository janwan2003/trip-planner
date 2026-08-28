import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import Index from './Index';
import { rememberTrip } from '@/lib/recentTrips';

describe('Index', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('leads with what the product is for', () => {
    renderWithRouter(<Index />);

    expect(
      screen.getByRole('heading', { level: 1, name: /Find the days your group can actually go/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Plan trips with friends by finding when everyone's available/i),
    ).toBeInTheDocument();
  });

  it('puts the trip form on the page, since creating a trip is the point', () => {
    renderWithRouter(<Index />);

    expect(screen.getByPlaceholderText(/summer adventure/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create trip/i })).toBeInTheDocument();
  });

  it('shows the tutorial to a first-time visitor', () => {
    renderWithRouter(<Index />);
    expect(screen.getAllByText(/Share the Link/i).length).toBeGreaterThan(0);
  });

  it('respects a returning visitor who hid the tutorial', () => {
    localStorage.setItem('tutorialHidden', 'true');
    renderWithRouter(<Index />);

    expect(screen.getByRole('button', { name: /show tutorial/i })).toBeInTheDocument();
  });

  it('puts the pitch before the teaching on a phone', () => {
    // Single-column order used to be tutorial-first, which pushed the headline, the form
    // and the only CTA below an 812px fold. Asserted through the order utilities, since
    // jsdom does not lay out.
    const { container } = renderWithRouter(<Index />);

    const grid = container.querySelector('.grid.grid-cols-1')!;
    const [first, second] = Array.from(grid.children) as HTMLElement[];

    expect(first.className).toContain('order-2');
    expect(first.className).toContain('lg:order-1');
    expect(second.className).toContain('order-1');
    expect(second.className).toContain('lg:order-2');
  });

  it('gives every footer link a 44px tap target', () => {
    renderWithRouter(<Index />);

    const footerLinks = screen
      .getAllByRole('link')
      .filter((a) => /about|contact|faq|alternative|terms|privacy/i.test(a.textContent ?? ''));

    expect(footerLinks.length).toBeGreaterThan(4);
    for (const link of footerLinks) {
      expect(link.className).toContain('min-h-11');
    }
  });

  it('does not claim to be the best at anything, having no users', () => {
    renderWithRouter(<Index />);
    expect(screen.queryByText(/best way to plan/i)).not.toBeInTheDocument();
  });

  it('does not end the page on a version number', () => {
    renderWithRouter(<Index />);

    // Still inspectable as an attribute; just not the last thing a visitor reads.
    expect(screen.queryByText(/^v1\./)).not.toBeInTheDocument();
    expect(document.querySelector('[data-app-version]')).toBeInTheDocument();
  });

  it('links to the legal and informational pages', () => {
    renderWithRouter(<Index />);

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/about',
        '/contact',
        '/terms',
        '/privacy',
        '/faq',
        '/when2meet-alternative',
        '/doodle-alternative',
      ]),
    );
  });

  it('names the product in the header', () => {
    renderWithRouter(<Index />);
    expect(screen.getAllByText('WeGoWhen').length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/WeGoWhen Logo/i).length).toBeGreaterThan(0);
  });

  it('shows nothing about past trips to a browser that has not opened one', () => {
    renderWithRouter(<Index />);
    expect(screen.queryByText(/Trips you opened in this browser/i)).not.toBeInTheDocument();
  });

  it('offers a way back into a trip this browser has opened', () => {
    rememberTrip(
      { id: 'abc123', name: 'Alps trip', startDate: '2026-09-01', endDate: '2026-09-07' },
      'creator',
    );

    renderWithRouter(<Index />);

    expect(screen.getByText(/Trips you opened in this browser/i)).toBeInTheDocument();
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/trip/abc123');
  });
});
