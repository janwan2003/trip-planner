import { format, parseISO } from 'date-fns';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { findBestDateRanges } from '@/lib/bestDates';
import { getAvailabilityCount, getDatesBetween, Trip } from '@/lib/tripStore';

/**
 * Shows a visitor what the product produces, before they have anything of their own.
 *
 * The landing page described the result in words - "find when everyone's available" -
 * and never showed it, so the one thing that distinguishes this from a poll was invisible
 * until after you had created a trip and talked friends into answering.
 *
 * The example is rendered by the real components, not mocked up: the same
 * AvailabilityCalendar the trip page uses, fed through the same getAvailabilityCount, and
 * the headline answer comes from findBestDateRanges rather than being typed in. A change
 * to the heat ramp, the layout or the ranking rules shows up here automatically, and the
 * caption cannot claim a range the algorithm would not pick.
 */

const NAMES = ['Ania', 'Bartek', 'Celina', 'Dawid', 'Ewa', 'Filip'];

/**
 * 14 days starting on the 1st of next month, so the example never reads as stale.
 *
 * "Next month" is taken from the visitor's local calendar - reading UTC getters off
 * `new Date()` would show October to someone in New York on the evening of 31 August -
 * and the arithmetic from there is UTC, so the strings do not depend on the offset.
 */
const previewRange = (today: Date): { startDate: string; endDate: string } => {
  const first = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 1));
  const last = new Date(first);
  last.setUTCDate(last.getUTCDate() + 13);
  return { startDate: first.toISOString().slice(0, 10), endDate: last.toISOString().slice(0, 10) };
};

/**
 * Availability by day index, chosen to look like a real group rather than a gradient:
 * a thin start, a middle where two thirds can go, and one three-day stretch that works
 * for all six. The trailing days taper so the darkest block is not simply the end.
 */
const FREE_PER_DAY = [1, 2, 4, 3, 5, 4, 6, 6, 6, 4, 5, 2, 3, 1];

const buildPreviewTrip = (today: Date): Trip => {
  const { startDate, endDate } = previewRange(today);
  const dates = getDatesBetween(startDate, endDate);

  return {
    id: 'preview',
    name: 'Example trip',
    startDate,
    endDate,
    participants: NAMES.map((name, person) => ({
      name,
      // Person 0 is free on every day that has at least one taker, person 5 only on the
      // days all six share, which is what makes the middle block the unanimous one.
      availableDates: dates.filter((_, day) => person < FREE_PER_DAY[day]),
    })),
  };
};

export function HeatPreview() {
  const trip = buildPreviewTrip(new Date());
  const best = findBestDateRanges(trip, { minDays: 1, limit: 1 })[0];

  return (
    <section aria-labelledby="preview-heading" className="animate-fade-in">
      <h2 id="preview-heading" className="font-display font-semibold text-lg">
        What you get back
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        An example with {NAMES.length} friends. The darker a day, the more of them are free.
      </p>

      <div className="rounded-lg border bg-card p-3 sm:p-4">
        <AvailabilityCalendar
          startDate={trip.startDate}
          endDate={trip.endDate}
          selectedDates={[]}
          onToggleDate={() => {}}
          readOnly
          availability={getAvailabilityCount(trip)}
          totalParticipants={trip.participants.length}
          participants={trip.participants}
        />

        {/*
          The answer is whatever findBestDateRanges returns for the data above, so this
          line cannot drift from what the product would actually say.
        */}
        {best && (
          <p data-testid="preview-answer" className="mt-3 text-sm">
            <span className="font-medium">
              {format(parseISO(best.startDate), 'EEE d')} –{' '}
              {format(parseISO(best.endDate), 'EEE d MMM')}
            </span>
            <span className="text-muted-foreground">
              {' '}
              works for all {best.count} of them.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
