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
  it('invites the organiser to share the link when nobody has joined', () => {
    render(<BestDates trip={trip([])} />);

    expect(screen.getByTestId('best-dates-empty')).toBeInTheDocument();
    expect(screen.getByText(/Best dates will appear here/i)).toBeInTheDocument();
    expect(screen.getByText(/Send the link to everyone/i)).toBeInTheDocument();
  });

  /**
   * The state this used to fall through: BestDates returned null while TripPage's
   * placeholder was gated on there being no participants at all, so a trip where
   * somebody had joined but marked nothing rendered an empty bordered card.
   */
  it('says so when people have joined but marked nothing', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: [] }])} />);

    expect(screen.getByTestId('best-dates-empty')).toBeInTheDocument();
    expect(screen.getByText(/nobody has marked days yet/i)).toBeInTheDocument();
  });

  it('uses the singular when exactly one person has joined', () => {
    render(<BestDates trip={trip([{ name: 'Ada', availableDates: [] }])} />);
    expect(screen.getByText(/Someone has joined/i)).toBeInTheDocument();
  });

  it('uses the plural for more than one', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: [] },
          { name: 'Bo', availableDates: [] },
        ])}
      />,
    );
    expect(screen.getByText(/People have joined/i)).toBeInTheDocument();
  });

  it('distinguishes "nobody marked anything" from "no overlap"', () => {
    render(
      <BestDates
        trip={trip(
          [
            { name: 'Ada', availableDates: ['2026-09-02'] },
            { name: 'Bo', availableDates: ['2026-09-04'] },
          ],
          { startDate: '2026-09-01', endDate: '2026-09-05' },
        )}
      />,
    );

    // Both marked days, so there ARE ranges - one per person. This asserts the
    // component does not claim nobody has marked anything.
    expect(screen.queryByText(/nobody has marked days yet/i)).not.toBeInTheDocument();
  });

  it('names the filtered people when none of them has a day', () => {
    // Zero ranges under a filter means the filtered people have marked nothing - the
    // algorithm reports per-subset ranges, so two people with non-overlapping days
    // still produce one range each rather than an empty result.
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: [] },
          { name: 'Bo', availableDates: [] },
          { name: 'Cy', availableDates: ['2026-09-02'] },
        ])}
        selectedParticipants={['Ada', 'Bo']}
      />,
    );

    expect(screen.getByText(/No days work for Ada, Bo/i)).toBeInTheDocument();
    expect(screen.getByText(/Try including more people/i)).toBeInTheDocument();
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

  it('states whose dates it is answering for when filtered', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03'] },
          { name: 'Bo', availableDates: ['2026-09-02'] },
        ])}
        selectedParticipants={['Ada']}
      />,
    );

    // The scope belongs where the answer is read, not only in the list 500px away that
    // set it.
    expect(screen.getByTestId('best-dates-scope')).toHaveTextContent('for Ada');
  });

  it('says nothing about scope when the whole group is in play', () => {
    render(
      <BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-02'] }])} />,
    );

    expect(screen.queryByTestId('best-dates-scope')).not.toBeInTheDocument();
  });

  it('excludes filtered-out people from the ranges it offers', () => {
    render(
      <BestDates
        trip={trip([
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
          { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
          { name: 'Cy', availableDates: ['2026-09-02'] },
        ])}
        selectedParticipants={['Ada', 'Bo']}
      />,
    );

    const rows = suggestions();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ count: 2 });
    expect(rows.flatMap((r) => r.names)).not.toContain('Cy');
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

  describe('the count of a range', () => {
    it('says how many of the group it is, not just how many people', () => {
      // A bare "6" beside a people icon does not answer the organiser's actual question,
      // which is whether this range works for everyone or only most of them.
      render(
        <BestDates
          trip={trip([
            { name: 'Ada', availableDates: ['2026-09-02'] },
            { name: 'Bo', availableDates: ['2026-09-02'] },
            { name: 'Cy', availableDates: ['2026-09-05'] },
          ])}
        />,
      );

      const row = screen.getAllByTestId('best-date-row')[0];
      expect(row.textContent).toContain('2/3');
    });

    it('counts against the filtered group, not the whole trip', () => {
      render(
        <BestDates
          trip={trip([
            { name: 'Ada', availableDates: ['2026-09-02'] },
            { name: 'Bo', availableDates: ['2026-09-02'] },
            { name: 'Cy', availableDates: ['2026-09-02'] },
          ])}
          selectedParticipants={['Ada', 'Bo']}
        />,
      );

      // Under a filter, "2" alone could be 2 of 2 selected or 2 of 3 on the trip.
      const row = screen.getAllByTestId('best-date-row')[0];
      expect(row.textContent).toContain('2/2');
      expect(row.textContent).not.toContain('2/3');
    });

    it('spells the ratio out for a screen reader, since the icon has no text', () => {
      render(
        <BestDates
          trip={trip([
            { name: 'Ada', availableDates: ['2026-09-02'] },
            { name: 'Bo', availableDates: ['2026-09-05'] },
          ])}
        />,
      );

      expect(screen.getAllByText(/of 2 people free/i).length).toBeGreaterThan(0);
    });

    it('says person, not people, for a group of one', () => {
      render(<BestDates trip={trip([{ name: 'Ada', availableDates: ['2026-09-02'] }])} />);

      expect(screen.getByText(/of 1 person free/i)).toBeInTheDocument();
    });
  });
});
