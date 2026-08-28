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
}

/** Caps chosen to bound what one unauthenticated request can write. */
export const LIMITS = {
  tripId: 64,
  name: 120,
  participants: 200,
  datesPerParticipant: 1000,
} as const;

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

export const isName = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= LIMITS.name;

/**
 * Parses the stored JSON array of dates. A row that somehow holds invalid JSON
 * yields an empty list rather than failing the whole request: one corrupt
 * participant should not make a trip unreadable.
 */
const parseDates = (raw: string): string[] => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isCalendarDate) : [];
  } catch {
    return [];
  }
};

/** Reads one trip and its participants, or null when the trip does not exist. */
export const readTrip = async (db: D1Database, id: string): Promise<Trip | null> => {
  const trip = await db
    .prepare('SELECT id, name, start_date, end_date, created_at, updated_at FROM trips WHERE id = ?')
    .bind(id)
    .first<TripRow>();

  if (!trip) return null;

  const { results } = await db
    .prepare(
      'SELECT id, name, available_dates, created_at FROM participants WHERE trip_id = ? ORDER BY created_at, name',
    )
    .bind(id)
    .all<ParticipantRow>();

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
      availableDates: parseDates(row.available_dates),
      created_at: row.created_at,
    })),
  };
};

export const nowIso = (): string => new Date().toISOString();

export const newId = (): string => crypto.randomUUID();
