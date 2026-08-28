import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithRouter } from '@/test/render';
import { FAQ } from '@/lib/siteMeta';
import DoodleAlternative from './DoodleAlternative';
import Faq from './Faq';
import When2meetAlternative from './When2meetAlternative';

/**
 * These pages exist to be found in a search result, so the things worth asserting are
 * the things a search engine and a reader check: one H1, the target phrasing present,
 * the competitor claims that were verified still on the page, and links onward.
 */
describe('When2meet alternative page', () => {
  it('has exactly one H1, carrying the phrase it targets', () => {
    renderWithRouter(<When2meetAlternative />);

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/When2meet alternative for whole days, not hours/i);
  });

  it('answers the phrasing people actually search for', () => {
    renderWithRouter(<When2meetAlternative />);
    // "when 2 meet but for days" is a Google-reported related query for when2meet.
    expect(screen.getByRole('heading', { name: /When 2 meet, but for days/i })).toBeInTheDocument();
  });

  it('keeps the verified When2meet claims and dates them', () => {
    renderWithRouter(<When2meetAlternative />);

    expect(screen.getByText(/What times might work\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Checked against when2meet\.com on 28 August 2026/i)).toBeInTheDocument();
  });

  it('says when the competitor is the better tool, which is what makes the rest credible', () => {
    renderWithRouter(<When2meetAlternative />);
    expect(
      screen.getByRole('heading', { name: /When to stay with When2meet/i }),
    ).toBeInTheDocument();
  });

  it('links onward to the sibling pages and to creating a trip', () => {
    renderWithRouter(<When2meetAlternative />);

    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(expect.arrayContaining(['/', '/faq', '/doodle-alternative']));
  });
});

describe('Doodle alternative page', () => {
  it('has exactly one H1, carrying the phrase it targets', () => {
    renderWithRouter(<DoodleAlternative />);

    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Doodle alternative for group trip dates/i);
  });

  it('quotes Doodle pricing with the date it was read', () => {
    renderWithRouter(<DoodleAlternative />);

    expect(screen.getAllByText(/USD 11/).length).toBeGreaterThan(0);
    expect(screen.getByText(/From doodle\.com\/en\/premium, read 28 August 2026/i)).toBeInTheDocument();
  });

  it('credits Doodle with what it does better', () => {
    renderWithRouter(<DoodleAlternative />);
    expect(screen.getByRole('heading', { name: /When to stay with Doodle/i })).toBeInTheDocument();
  });
});

describe('FAQ page', () => {
  it('renders every question and answer that the structured data claims', () => {
    renderWithRouter(<Faq />);

    for (const { question, answer } of FAQ) {
      expect(screen.getByRole('heading', { name: question })).toBeInTheDocument();
      // Substring rather than exact text: the answers are long, and this asserts the
      // rendered copy is the same string the JSON-LD carries.
      expect(screen.getByText(answer)).toBeInTheDocument();
    }
  });

  it('shows the answers rather than hiding them behind a click', () => {
    renderWithRouter(<Faq />);
    // No accordion: an answer behind a disclosure is harder for an answer engine to
    // extract, and being extractable is the point of this page.
    expect(document.querySelectorAll('[aria-expanded]')).toHaveLength(0);
  });
});
