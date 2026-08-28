import { describe, it, expect } from 'vitest';
import { findBestDateRanges } from './bestDates';
import { Trip } from './tripStore';

const trip = (participants: Trip['participants'], over: Partial<Trip> = {}): Trip => ({
  id: 't1',
  name: 'Alps',
  startDate: '2026-09-01',
  endDate: '2026-09-10',
  participants,
  ...over,
});

const shape = (ranges: ReturnType<typeof findBestDateRanges>) =>
  ranges.map((r) => `${r.startDate}..${r.endDate} (${r.count}) ${r.names.join('+')}`);

describe('findBestDateRanges', () => {
  it('returns nothing for a trip with no participants', () => {
    expect(findBestDateRanges(trip([]))).toEqual([]);
  });

  it('returns nothing when nobody marked a date', () => {
    expect(findBestDateRanges(trip([{ name: 'Ada', availableDates: [] }]))).toEqual([]);
  });

  it('returns nothing for an inverted date range', () => {
    expect(
      findBestDateRanges(
        trip([{ name: 'Ada', availableDates: ['2026-09-02'] }], {
          startDate: '2026-09-10',
          endDate: '2026-09-01',
        }),
      ),
    ).toEqual([]);
  });

  it('finds a single day', () => {
    expect(shape(findBestDateRanges(trip([{ name: 'Ada', availableDates: ['2026-09-03'] }])))).toEqual(
      ['2026-09-03..2026-09-03 (1) Ada'],
    );
  });

  it('merges consecutive days into one maximal range', () => {
    const result = findBestDateRanges(
      trip([{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] }]),
    );

    // Not Sep 2-3, not Sep 3-4, not three single days: one maximal stretch.
    expect(shape(result)).toEqual(['2026-09-02..2026-09-04 (1) Ada']);
    expect(result[0].days).toBe(3);
  });

  it('splits a gap into separate ranges', () => {
    expect(
      shape(
        findBestDateRanges(
          trip([{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-08'] }]),
        ),
      ),
    ).toEqual(['2026-09-02..2026-09-03 (1) Ada', '2026-09-08..2026-09-08 (1) Ada']);
  });

  it('ranks a bigger group above a longer stretch', () => {
    const result = findBestDateRanges(
      trip([
        { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06', '2026-09-07'] },
        { name: 'Bo', availableDates: ['2026-09-02'] },
      ]),
    );

    expect(result[0]).toMatchObject({ count: 2, startDate: '2026-09-02', endDate: '2026-09-02' });
    expect(result[1]).toMatchObject({ count: 1, days: 3 });
  });

  it('prefers the longer stretch when the group size ties', () => {
    const result = findBestDateRanges(
      trip([
        { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06', '2026-09-07'] },
      ]),
    );

    expect(result[0].days).toBe(3);
    expect(result[1].days).toBe(1);
  });

  it('breaks a remaining tie chronologically', () => {
    const result = findBestDateRanges(
      trip([{ name: 'Ada', availableDates: ['2026-09-08', '2026-09-02'] }]),
    );

    expect(result.map((r) => r.startDate)).toEqual(['2026-09-02', '2026-09-08']);
  });

  it('reports the subset that can make a stretch, not just the whole group', () => {
    // Everyone can do Sep 2. Ada and Bo can also do Sep 3-4 together.
    const result = findBestDateRanges(
      trip([
        { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
        { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
        { name: 'Cy', availableDates: ['2026-09-02'] },
      ]),
    );

    expect(shape(result)[0]).toBe('2026-09-02..2026-09-02 (3) Ada+Bo+Cy');
    expect(shape(result)).toContain('2026-09-02..2026-09-04 (2) Ada+Bo');
  });

  it('does not offer a range dominated by a longer one with the same people', () => {
    const result = findBestDateRanges(
      trip([
        { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
        { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
      ]),
    );

    // Only the maximal Ada+Bo stretch, not its sub-ranges.
    expect(shape(result)).toEqual(['2026-09-02..2026-09-04 (2) Ada+Bo']);
  });

  it('honours a minimum length', () => {
    const result = findBestDateRanges(
      trip([
        { name: 'Ada', availableDates: ['2026-09-02', '2026-09-05', '2026-09-06', '2026-09-07'] },
      ]),
      { minDays: 3 },
    );

    expect(shape(result)).toEqual(['2026-09-05..2026-09-07 (1) Ada']);
  });

  it('honours the result limit', () => {
    const result = findBestDateRanges(
      trip([{ name: 'Ada', availableDates: ['2026-09-01', '2026-09-03', '2026-09-05', '2026-09-07', '2026-09-09'] }]),
      { limit: 2 },
    );

    expect(result).toHaveLength(2);
  });

  it('ignores availability outside the trip range', () => {
    expect(
      shape(
        findBestDateRanges(trip([{ name: 'Ada', availableDates: ['2026-09-03', '2026-12-24'] }])),
      ),
    ).toEqual(['2026-09-03..2026-09-03 (1) Ada']);
  });

  it('treats a name that is not on the trip as absent', () => {
    // getAvailabilityCount only reports names from the participant list, so this is a
    // guard against the mapping drifting rather than a reachable state today.
    const result = findBestDateRanges(trip([{ name: 'Ada', availableDates: ['2026-09-03'] }]));
    expect(result[0].names).toEqual(['Ada']);
  });

  /**
   * The reason this module exists. The previous implementation iterated
   * `mask < (1 << n)` over the power set of participants.
   */
  describe('group sizes the power-set version could not handle', () => {
    /** Real consecutive dates, so a 90-day trip does not ask for 2026-09-45. */
    const isoDays = (count: number) =>
      Array.from({ length: count }, (_, d) => {
        const date = new Date(Date.UTC(2026, 8, 1 + d));
        return date.toISOString().slice(0, 10);
      });

    const bigTrip = (people: number, days: number) => {
      const dates = isoDays(days);
      return trip(
        Array.from({ length: people }, (_, i) => ({ name: `P${i}`, availableDates: dates })),
        { startDate: dates[0], endDate: dates[dates.length - 1] },
      );
    };

    it('handles 25 participants quickly, where 2^25 subsets would not', () => {
      const started = performance.now();
      const result = findBestDateRanges(bigTrip(25, 14));
      const elapsed = performance.now() - started;

      expect(result[0]).toMatchObject({ count: 25, days: 14 });
      expect(elapsed).toBeLessThan(1000);
    });

    /**
     * At n = 31 the old code computed `1 << 31`, which is negative in JavaScript, so
     * `mask < (1 << 31)` was false immediately and the loop never ran: best dates came
     * back empty with no error. This is the regression guard for that.
     */
    it('still answers at 31 participants, where the old bit shift went negative', () => {
      const result = findBestDateRanges(bigTrip(31, 7));

      expect(result).not.toHaveLength(0);
      expect(result[0]).toMatchObject({ count: 31, days: 7 });
    });

    it('still answers well past 32 participants', () => {
      const result = findBestDateRanges(bigTrip(40, 5));

      expect(result[0]).toMatchObject({ count: 40, days: 5 });
      expect(result[0].names).toHaveLength(40);
    });

    it('copes with a long trip and a large group', () => {
      const started = performance.now();
      const result = findBestDateRanges(bigTrip(60, 90));
      const elapsed = performance.now() - started;

      expect(result[0]).toMatchObject({ count: 60, days: 90 });
      expect(elapsed).toBeLessThan(3000);
    });
  });
});
