import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test/render';
import Index from './Index';

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
});
