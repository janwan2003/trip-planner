import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BestDates } from './BestDates';
import { Trip } from '@/lib/tripStore';

const trip = (participants: Trip['participants'], over: Partial<Trip> = {}): Trip => ({
  id: 't1',
  name: 'Alps',
  startDate: '2026-09-01',
  endDate: '2026-09-10',
  participants,
  ...over,
});

/**
 * Reads the rendered suggestions back as plain data. The component draws each range as
 * a row holding a date label, the names, and a count, so a test can assert on the
 * ranking without reaching into class names.
 */
const suggestions = () =>
  screen.queryAllByTestId('best-date-row').map((row) => ({
    count: Number(row.querySelector('[data-testid="best-date-count"]')?.textContent?.trim()),
    names: row.querySelector('[data-testid="best-date-names"]')?.textContent ?? '',
    label: row.querySelector('[data-testid="best-date-label"]')?.textContent ?? '',
  }));

describe('BestDates', () => {
  it('renders nothing when the trip has no participants', () => {
    const { container } = render(<BestDates trip={trip([])} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when participants exist but nobody marked a date', () => {
    const { container } = render(
      <BestDates trip={trip([{ name: 'Ada', availableDates: [] }])} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a single day for one person on one date', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-03'] }])} />);

    expect(screen.getByText('Best Dates')).toBeInTheDocument();
    const rows = suggestions();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ count: 1, names: 'Ada' });
    expect(rows[0].label).toContain('3');
  });

  it('merges consecutive days into one range and reports its length', () => {
    render(
      <BestDates
        trip={trip([{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] }])}
      />,
    );

    const rows = suggestions();
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toContain('3 days');
  });

  it('splits a gap into two separate ranges', () => {
    render(
      <BestDates
        trip={trip([{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-08'] }])}
      />,
    );

    expect(suggestions()).toHaveLength(2);
  });

  it('ranks the range everybody can make above one only some can', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06'] },
          { name: 'Bo', availableDates: ['2026-09-02'] },
        ])}
      />,
    );

    const rows = suggestions();
    // Ada+Bo can only do the 2nd; Ada alone has a longer stretch. Group size wins.
    expect(rows[0].count).toBe(2);
    expect(rows[0].names).toContain('Ada');
    expect(rows[0].names).toContain('Bo');
  });

  it('prefers the longer stretch when two options have the same group size', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06', '2026-09-07'] },
        ])}
      />,
    );

    const rows = suggestions();
    expect(rows[0].label).toContain('3 days');
  });

  it('drops a range that a longer one with the same people already covers', () => {
    render(
      <BestDates
        trip={trip([{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] }])}
      />,
    );

    // Sep 2-3 and Sep 3-4 are both "Ada", and both sit inside Sep 2-4, so only the
    // maximal range should be offered rather than three overlapping ones.
    expect(suggestions()).toHaveLength(1);
  });

  it('shows at most five suggestions', () => {
    render(
      <BestDates
        trip={trip(
          [
            {
              name: 'Ada',
              availableDates: [
                '2026-09-01',
                '2026-09-03',
                '2026-09-05',
                '2026-09-07',
                '2026-09-09',
                '2026-09-11',
                '2026-09-13',
              ],
            },
          ],
          { endDate: '2026-09-20' },
        )}
      />,
    );

    expect(suggestions().length).toBeLessThanOrEqual(5);
  });

  it('filters out ranges shorter than the minimum the organiser sets', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06', '2026-09-07'] },
        ])}
      />,
    );

    expect(suggestions()).toHaveLength(2);

    // fireEvent.change rather than userEvent.type: the field is a controlled
    // number input, and typing appends to the existing value instead of replacing it.
    fireEvent.change(screen.getByTitle('Min days'), { target: { value: '3' } });

    const rows = suggestions();
    expect(rows).toHaveLength(1);
    expect(rows[0].label).toContain('3 days');
  });

  it('keeps the minimum control on screen when the filter empties the list', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-03'] }])} />);

    fireEvent.change(screen.getByTitle('Min days'), { target: { value: '9' } });

    expect(suggestions()).toHaveLength(0);
    // Without this, raising the minimum would remove the only way to lower it.
    expect(screen.getByTitle('Min days')).toBeInTheDocument();
    expect(screen.getByText('Best Dates')).toBeInTheDocument();
  });

  it('clamps a minimum of zero back up to one day', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-03'] }])} />);

    const min = screen.getByTitle('Min days') as HTMLInputElement;
    fireEvent.change(min, { target: { value: '0' } });

    expect(min.value).toBe('1');
    expect(suggestions()).toHaveLength(1);
  });

  it('treats a cleared minimum as one day rather than NaN', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-03'] }])} />);

    const min = screen.getByTitle('Min days') as HTMLInputElement;
    fireEvent.change(min, { target: { value: '' } });

    expect(min.value).toBe('1');
    expect(suggestions()).toHaveLength(1);
  });

  it('ignores availability that falls outside the trip range', () => {
    render(
      <BestDates
        trip={trip([{ name: 'Ada', availableDates: ['2026-09-03', '2026-12-24'] }])}
      />,
    );

    const rows = suggestions();
    expect(rows).toHaveLength(1);
    expect(rows[0].label).not.toContain('Dec');
  });
});
