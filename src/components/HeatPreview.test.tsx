import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeatPreview } from './HeatPreview';

describe('HeatPreview', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const freezeAt = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  it('shows a fortnight of days, so the heat ramp has something to ramp across', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    expect(screen.getAllByRole('button')).toHaveLength(14);
  });

  it('starts on the first of next month, so the example never reads as stale', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    const first = screen.getAllByRole('button')[0];
    expect(first.getAttribute('aria-label')).toMatch(/1 September 2026/);
  });

  it('rolls over the year boundary', () => {
    freezeAt('2026-12-15T10:00:00Z');
    render(<HeatPreview />);

    expect(screen.getAllByRole('button')[0].getAttribute('aria-label')).toMatch(/1 January 2027/);
  });

  /**
   * The point of the example is that it is not a mock-up: the caption is whatever
   * findBestDateRanges returns for the fabricated availability, so a change to the
   * ranking rules changes the caption instead of making it a lie.
   */
  it('names the unanimous stretch the real algorithm picks', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    const answer = screen.getByTestId('preview-answer');
    // Days 7-9 of September are the three all six share, per FREE_PER_DAY.
    expect(answer).toHaveTextContent('Mon 7');
    expect(answer).toHaveTextContent('Wed 9 Sep');
    expect(answer).toHaveTextContent('works for all 6 of them');
  });

  it('reports a count that matches the number of people in the example', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    expect(screen.getByText(/An example with 6 friends/i)).toBeInTheDocument();
    expect(screen.getByTestId('preview-answer')).toHaveTextContent('all 6 of them');
  });

  it('does not present a unanimous day as the whole fortnight', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    // A flat gradient would make every day unanimous and the heat map pointless. The
    // darkest block has to be a minority of the range for the picture to say anything.
    const counts = screen
      .getAllByRole('button')
      .map((cell) => Number(cell.getAttribute('aria-label')?.match(/(\d+) available/)?.[1] ?? 0));

    expect(counts.filter((c) => c === 6)).toHaveLength(3);
    expect(Math.min(...counts)).toBe(1);
  });

  it('is a labelled region rather than a decorative block', () => {
    freezeAt('2026-08-28T10:00:00Z');
    render(<HeatPreview />);

    expect(screen.getByRole('region', { name: /What you get back/i })).toBeInTheDocument();
  });
});
