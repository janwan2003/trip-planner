import { Trip } from './tripStore';
import { getAvailabilityCount, getDatesBetween } from './tripStore';

export interface BestDateRange {
  startDate: string;
  endDate: string;
  /** How many people can make the whole range. */
  count: number;
  /** Who they are, in the order they appear on the trip. */
  names: string[];
  /** Inclusive length in days. */
  days: number;
}

/**
 * Finds the date ranges a trip could actually happen on, ranked by how many people can
 * make the whole stretch, then by how long it is, then chronologically.
 *
 * ## Why this is not a power set
 *
 * The previous implementation enumerated every non-empty subset of participants -
 * `for (let mask = 1; mask < (1 << n); mask++)` - and searched dates for each. Two
 * problems, both real rather than theoretical:
 *
 *   * 2^n iterations. Around twenty participants it locks up the browser tab.
 *   * At n = 31, `1 << 31` is negative in JavaScript, so the loop body never ran and
 *     the feature silently produced nothing at all.
 *
 * The subsets were never the interesting objects. For any given stretch of days, the
 * people who can make *all* of it are fully determined: they are the intersection of
 * who is free on each day. So it is enough to walk the ranges, carrying that
 * intersection, which also makes every emitted set maximal for its range by
 * construction.
 *
 * Availability is held as a bitmask per day so intersecting is one `&` rather than a
 * set rebuild, which keeps a long trip with a large group comfortable.
 */
export interface FindBestDateRangesOptions {
  minDays?: number;
  limit?: number;
  /**
   * Restrict the answer to these participants, by name, case-insensitively. An empty
   * or omitted list means the whole group.
   *
   * This exists because the organiser's filter has exactly one job - "what if these
   * five go" - and without it the ranked answer ignored the filter entirely and went
   * on naming people who had just been excluded.
   */
  onlyParticipants?: string[];
}

export const findBestDateRanges = (
  trip: Trip,
  { minDays = 1, limit = 5, onlyParticipants }: FindBestDateRangesOptions = {},
): BestDateRange[] => {
  const dates = getDatesBetween(trip.startDate, trip.endDate);
  if (dates.length === 0 || trip.participants.length === 0) return [];

  const availability = getAvailabilityCount(trip);

  // Index participants so each becomes one bit. Order is the trip's own order, which
  // is what the UI shows. Restricting this list is all the filtering that is needed:
  // maskFor ignores any name without a bit, so excluded people simply never appear in
  // an intersection.
  const allowed =
    onlyParticipants && onlyParticipants.length > 0
      ? new Set(onlyParticipants.map((n) => n.toLowerCase()))
      : null;

  const names = trip.participants
    .map((p) => p.name)
    .filter((name) => !allowed || allowed.has(name.toLowerCase()));

  if (names.length === 0) return [];
  const bitOf = new Map(names.map((name, index) => [name, index]));

  const maskFor = (date: string): bigint => {
    let mask = 0n;
    for (const name of availability[date] ?? []) {
      const bit = bitOf.get(name);
      if (bit !== undefined) mask |= 1n << BigInt(bit);
    }
    return mask;
  };

  const masks = dates.map(maskFor);

  const popcount = (mask: bigint): number => {
    let count = 0;
    let rest = mask;
    while (rest > 0n) {
      rest &= rest - 1n;
      count += 1;
    }
    return count;
  };

  const namesOf = (mask: bigint): string[] =>
    names.filter((_, index) => (mask >> BigInt(index)) & 1n);

  const candidates: Array<BestDateRange & { mask: bigint }> = [];

  for (let start = 0; start < dates.length; start += 1) {
    let running = masks[start];
    if (running === 0n) continue;

    for (let end = start; end < dates.length; end += 1) {
      running &= masks[end];
      if (running === 0n) break;

      // Emit only where the set is about to shrink. Anywhere else, the longer range
      // with the same people covers this one, so recording it would just create a
      // dominated duplicate to filter out later.
      const nextShrinks = end + 1 >= dates.length || (running & masks[end + 1]) !== running;
      if (!nextShrinks) continue;

      candidates.push({
        startDate: dates[start],
        endDate: dates[end],
        count: popcount(running),
        names: namesOf(running),
        days: end - start + 1,
        mask: running,
      });
    }
  }

  // A range is still dominated if the same people are free across a strictly larger
  // range that starts earlier. Emitting only at shrink points removes the
  // extend-to-the-right duplicates; this removes the extend-to-the-left ones.
  const maximal = candidates.filter(
    (range) =>
      !candidates.some(
        (other) =>
          other !== range &&
          other.mask === range.mask &&
          other.startDate <= range.startDate &&
          other.endDate >= range.endDate &&
          (other.startDate < range.startDate || other.endDate > range.endDate),
      ),
  );

  return maximal
    .filter((range) => range.days >= minDays)
    .sort(
      (a, b) =>
        b.count - a.count ||
        b.days - a.days ||
        a.startDate.localeCompare(b.startDate),
    )
    .slice(0, limit)
    .map(({ mask: _mask, ...range }) => range);
};
