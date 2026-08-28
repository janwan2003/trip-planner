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

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'TripApiError';
    this.status = status;
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
    const message = (parsed as { error?: string })?.error;
    throw new TripApiError(message ?? `Trip service failed with ${response.status}.`, response.status);
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

/** Creates a trip, or updates the name and date range of one that already exists. */
export const saveTrip = async (trip: Trip): Promise<Trip> => {
  const response = await request(API, {
    method: 'POST',
    body: JSON.stringify({
      id: trip.id,
      name: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
    }),
  });
  return expectTrip(response);
};

/** Adds a participant, or replaces the availability of one with the same name. */
export const addParticipant = async (tripId: string, participant: Participant): Promise<Trip> => {
  const response = await request(`${API}/${encodeURIComponent(tripId)}/participants`, {
    method: 'PUT',
    body: JSON.stringify({
      name: participant.name,
      availableDates: participant.availableDates,
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
  const dates = getDatesBetween(trip.startDate, trip.endDate);

  dates.forEach((date) => {
    availability[date] = trip.participants
      .filter((p) => p.availableDates.includes(date))
      .map((p) => p.name);
  });

  return availability;
};
