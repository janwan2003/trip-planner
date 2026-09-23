/**
 * Shared helpers for the trip API. Files under `functions/` whose path contains a
 * segment starting with `_` are not routed by Pages Functions, so this is a module
 * rather than an endpoint.
 */

export interface Env {
  DB: D1Database;
}

export interface Participant {
  id?: string;
  name: string;
  availableDates: string[];
  created_at?: string;
  /**
   * When this participant's row last changed. A client sends it back as
   * `expectedUpdatedAt` on its next save, so a save made from stale data is refused
   * instead of silently overwriting someone's newer answer.
   */
  updated_at?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  created_at?: string;
  updated_at?: string;
}

interface TripRow {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

interface ParticipantRow {
  id: string;
  name: string;
  available_dates: string;
  created_at: string;
  updated_at: string;
}

/** Caps chosen to bound what one unauthenticated request can write. */
export const LIMITS = {
  tripId: 64,
  name: 120,
  participants: 200,
  /**
   * Longest trip, in days, inclusive. Every client renders one calendar cell per day and
   * runs the best-dates search over all of them, so an unbounded range - 0001-01-01 to
   * 9999-12-31 passed validation until 2026-09-23 - would freeze every visitor's tab.
   * 366 keeps a full leap year; the longest real trip on that date was 365 days.
   */
  tripDays: 366,
  /** A participant cannot be free on more days than the longest trip has. */
  datesPerParticipant: 366,
} as const;

/** Days from `start` to `end` inclusive, for two dates already validated as calendar dates. */
export const daysInclusive = (start: string, end: string): number => {
  const utc = (value: string) => {
    const [y, m, d] = value.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((utc(end) - utc(start)) / 86_400_000) + 1;
};

export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Trips are read by whoever holds the link, from whatever origin the app is
      // served on. There are no cookies or credentials involved, so a plain
      // same-origin default is enough and no CORS header is set.
      'cache-control': 'no-store',
    },
  });

export const badRequest = (message: string): Response => json({ error: message }, 400);

/** An ISO calendar date, `YYYY-MM-DD`, and a real date rather than 2026-02-31. */
export const isCalendarDate = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return (
    parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d
  );
};

export const isTripId = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= LIMITS.tripId && /^[A-Za-z0-9_-]+$/.test(value);

/**
 * How the creator reached the create form: `trip-page` through "Start your own trip" on
 * someone else's trip, `invitee` when their browser had opened someone else's trip
 * before, `direct` otherwise. Mirrors `TRIP_ORIGINS` in `src/lib/tripStore.ts`.
 *
 * Recorded once, on creation, and never returned by the API: it is for counting whether
 * invitees go on to create trips of their own, and holds nothing about who anyone is.
 */
export const TRIP_ORIGINS = ['trip-page', 'invitee', 'direct'] as const;
export type TripOrigin = (typeof TRIP_ORIGINS)[number];

export const isTripOrigin = (value: unknown): value is TripOrigin =>
  (TRIP_ORIGINS as readonly unknown[]).includes(value);

export const isName = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= LIMITS.name;

/**
 * Parses the stored JSON array of dates. A row that somehow holds invalid JSON
 * yields an empty list rather than failing the whole request: one corrupt
 * participant should not make a trip unreadable.
 *
 * Dates outside the trip are dropped. The PUT validates each date's shape but not its
 * range, so a direct API call could store days the trip does not cover, and every
 * "N days available" count would then include them.
 */
const parseDates = (raw: string, start: string, end: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((d): d is string => isCalendarDate(d) && d >= start && d <= end)
      : [];
  } catch {
    return [];
  }
};

/**
 * Reads one trip and its participants, or null when the trip does not exist.
 *
 * Both SELECTs go in one `batch`, so this is one round trip to D1 rather than two;
 * every write endpoint ends by calling it.
 */
export const readTrip = async (db: D1Database, id: string): Promise<Trip | null> => {
  const [tripResult, participantResult] = await db.batch<TripRow | ParticipantRow>([
    db
      .prepare('SELECT id, name, start_date, end_date, created_at, updated_at FROM trips WHERE id = ?')
      .bind(id),
    db
      .prepare(
        'SELECT id, name, available_dates, created_at, updated_at FROM participants WHERE trip_id = ? ORDER BY created_at, name',
      )
      .bind(id),
  ]);

  const trip = (tripResult.results as TripRow[] | undefined)?.[0];
  if (!trip) return null;

  const results = participantResult.results as ParticipantRow[] | undefined;

  return {
    id: trip.id,
    name: trip.name,
    startDate: trip.start_date,
    endDate: trip.end_date,
    created_at: trip.created_at,
    updated_at: trip.updated_at,
    participants: (results ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      availableDates: parseDates(row.available_dates, trip.start_date, trip.end_date),
      created_at: row.created_at,
      updated_at: row.updated_at,
    })),
  };
};

export const nowIso = (): string => new Date().toISOString();

export const newId = (): string => crypto.randomUUID();
