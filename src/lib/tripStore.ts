/**
 * Client for the trip API backed by Cloudflare D1 (see `functions/api/trips`).
 *
 * There is deliberately no localStorage fallback. The previous version wrote through
 * to localStorage whenever the backend failed, which meant a dead backend looked like
 * a working app while every browser quietly kept its own private copy of a trip — the
 * one thing this product cannot afford, since sharing a link is the whole point.
 * Failures now surface: reads and writes throw, and the UI already shows an error.
 */

export interface Participant {
  id?: string;
  name: string;
  availableDates: string[];
  created_at?: string;
  /** Sent back as `expectedUpdatedAt` so a save made from a stale read is refused. */
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

/** Raised when the API could not be reached or answered with an unexpected status. */
export class TripApiError extends Error {
  readonly status?: number;
  /** On a 409, the trip as it now stands on the server. */
  readonly trip?: Trip;

  constructor(message: string, status?: number, trip?: Trip) {
    super(message);
    this.name = 'TripApiError';
    this.status = status;
    this.trip = trip;
  }
}

const API = '/api/trips';

/**
 * A trip link is the only credential this product has, so the id has to be
 * unguessable rather than merely unique. 16 bytes of CSPRNG output as hex, replacing
 * the previous `Math.random()` id, which a determined stranger could have walked.
 *
 * Ids already handed out stay valid: the API accepts any id of allowed characters.
 */
export const generateTripId = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
};

const request = async (url: string, init?: RequestInit): Promise<Response> => {
  try {
    return await fetch(url, {
      ...init,
      headers: init?.body
        ? { 'content-type': 'application/json', ...(init?.headers ?? {}) }
        : init?.headers,
    });
  } catch (cause) {
    throw new TripApiError(`Could not reach the trip service: ${String(cause)}`);
  }
};

const expectTrip = async (response: Response): Promise<Trip> => {
  const text = await response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new TripApiError(
      `Trip service returned a non-JSON response (${response.status}): ${text.slice(0, 200)}`,
      response.status,
    );
  }

  if (!response.ok) {
    const { error: message, trip } = (parsed ?? {}) as { error?: string; trip?: Trip };
    throw new TripApiError(
      message ?? `Trip service failed with ${response.status}.`,
      response.status,
      trip,
    );
  }

  return parsed as Trip;
};

/**
 * Fetches a trip.
 *
 * Returns null only when the trip genuinely does not exist. Anything else throws, so
 * a network failure is never shown to someone as "this trip is not real".
 */
export const getTrip = async (id: string): Promise<Trip | null> => {
  const response = await request(`${API}/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  return expectTrip(response);
};

/**
 * How the browser that created a trip got to the create form. Mirrors `TRIP_ORIGINS` in
 * the API, which stores it once, when the trip is first created, and never returns it.
 *
 * - `trip-page`: through "Start your own trip" on someone else's trip page.
 * - `invitee`: this browser had opened someone else's trip before, but came another way.
 * - `direct`: neither.
 *
 * Exists to answer one question the data could not: whether the people invited to trips
 * go on to create their own. It is derived from this browser's own recent-trips list and
 * the link that was followed, and holds nothing about who the creator is.
 */
export const TRIP_ORIGINS = ['trip-page', 'invitee', 'direct'] as const;
export type TripOrigin = (typeof TRIP_ORIGINS)[number];

/**
 * Where "Start your own trip" on a trip page links. The query string is what marks the
 * new trip's origin as `trip-page`; the create form reads it only when submitted, so it
 * changes nothing that renders and the prerendered home page still hydrates.
 */
export const START_OWN_TRIP_PATH = '/?from=trip';

export const cameFromTripPage = (params: URLSearchParams): boolean =>
  params.get('from') === 'trip';

/**
 * Creates a trip, or updates the name and date range of one that already exists.
 * `origin` is recorded only on creation; the server ignores it for a trip that exists.
 */
export const saveTrip = async (trip: Trip, origin?: TripOrigin): Promise<Trip> => {
  const response = await request(API, {
    method: 'POST',
    body: JSON.stringify({
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      ...(origin ? { origin } : {}),
    }),
  });
  return expectTrip(response);
};

/**
 * Adds a participant, or replaces the availability of one with the same name.
 *
 * `expectedUpdatedAt` is the participant's `updated_at` as this client last read it,
 * or `null` when it believes nobody has that name yet. If the server's row no longer
 * matches, the save is refused with a `TripApiError` of status 409 carrying the current
 * trip. Leave it `undefined` to skip the check.
 */
export const addParticipant = async (
  tripId: string,
  participant: Participant,
  expectedUpdatedAt?: string | null,
): Promise<Trip> => {
  const response = await request(`${API}/${encodeURIComponent(tripId)}/participants`, {
    method: 'PUT',
    body: JSON.stringify({
      name: participant.name,
      availableDates: participant.availableDates,
      ...(expectedUpdatedAt === undefined ? {} : { expectedUpdatedAt }),
    }),
  });
  return expectTrip(response);
};

export const updateParticipantName = async (
  tripId: string,
  oldName: string,
  newName: string,
): Promise<Trip> => {
  const response = await request(`${API}/${encodeURIComponent(tripId)}/participants`, {
    method: 'PATCH',
    body: JSON.stringify({ oldName, newName }),
  });
  return expectTrip(response);
};

export const removeParticipant = async (
  tripId: string,
  participantName: string,
): Promise<Trip> => {
  const url = `${API}/${encodeURIComponent(tripId)}/participants?name=${encodeURIComponent(participantName)}`;
  const response = await request(url, { method: 'DELETE' });
  return expectTrip(response);
};

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Reads a `YYYY-MM-DD` string as the calendar day it names.
 *
 * `new Date('2026-09-01')` is not that day: the spec parses a date-only string as an
 * *instant*, UTC midnight, so in New York it is the evening of 31 August. Reading local
 * getters off it - as this module used to - then yields 31/8, which is why every date in
 * the trip shifted back one day for every user west of UTC, the start date included.
 *
 * Building from the string's own parts avoids the question entirely: nothing here depends
 * on where the browser is.
 */
const utcFromYmd = (value: string): Date | null => {
  const parts = YMD.exec(value);
  if (!parts) return null;

  const [, year, month, day] = parts.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  // Date.UTC rolls 2026-02-31 forward to 3 March rather than rejecting it, so a
  // nonsense date would otherwise come back as a real one.
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

  return date;
};

/**
 * Longest trip in days, inclusive. Mirrors `LIMITS.tripDays` in the API, which refuses
 * anything longer: one calendar cell per day has to stay renderable on a phone.
 */
export const MAX_TRIP_DAYS = 366;

/** `value` moved by `days` calendar days, as `YYYY-MM-DD`; null for an unparseable value. */
export const addDays = (value: string, days: number): string | null => {
  const date = utcFromYmd(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const current = utcFromYmd(startDate);
  const end = utcFromYmd(endDate);
  // Unparseable or inverted ranges give nothing, as before.
  if (!current || !end) return [];

  const dates: string[] = [];
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

/**
 * Maps every date in the trip's range to the names available on it. Dates nobody picked
 * are present with an empty array — the heat map relies on every date having a key.
 */
export const getAvailabilityCount = (trip: Trip): Record<string, string[]> => {
  const availability: Record<string, string[]> = {};
  for (const date of getDatesBetween(trip.startDate, trip.endDate)) {
    availability[date] = [];
  }

  // One pass over each participant's own days, rather than an `includes` scan of every
  // participant for every date: at 365 days and 50 people that was ~6.6M comparisons.
  for (const participant of trip.participants) {
    for (const date of participant.availableDates) {
      availability[date]?.push(participant.name);
    }
  }

  return availability;
};
