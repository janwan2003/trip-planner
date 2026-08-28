/**
 * A per-browser list of the trips this browser has opened, so someone who created a
 * trip and then lost the link can find it again.
 *
 * This is deliberately *not* a copy of the trip. It holds only what a list needs —
 * the id, the name and the date range as they were the last time the browser saw the
 * trip — and every screen still reads the trip itself from the API. The write-through
 * cache this repo removed (see the note at the top of `tripStore.ts`) failed because it
 * answered reads; this never does, so a dead backend still looks dead.
 *
 * Because it lives in localStorage it is best-effort by construction: a different
 * browser, a different device, a cleared profile or a private window all mean an empty
 * list. That is why the UI calls it "trips you opened in this browser" rather than
 * "your trips", and why the share link is still the only real credential.
 *
 * Every function here swallows storage failures. Safari in private mode throws on
 * `setItem`, and a browser configured to block site data throws on the getter itself,
 * so an unguarded call would take down the page that created a trip — the one flow that
 * must not break.
 */

const KEY = 'wegowhen.recentTrips.v1';

/** Keeps the entry list bounded; the oldest fall off the end. */
const MAX_ENTRIES = 25;

export interface RecentTrip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  /**
   * 'creator' if this browser created the trip, 'visitor' if it only opened one.
   * Never downgraded: opening your own trip from a shared link keeps 'creator'.
   */
  role: 'creator' | 'visitor';
  /** ISO timestamp of the last time this browser opened the trip. Sort key. */
  lastOpenedAt: string;
}

const readRaw = (): string | null => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const writeRaw = (value: string): void => {
  try {
    localStorage.setItem(KEY, value);
  } catch {
    // Full quota or blocked storage. Losing the list is acceptable; throwing is not.
  }
};

const isEntry = (value: unknown): value is RecentTrip => {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<RecentTrip>;
  return (
    typeof entry.id === 'string' &&
    entry.id.length > 0 &&
    typeof entry.name === 'string' &&
    typeof entry.startDate === 'string' &&
    typeof entry.endDate === 'string' &&
    (entry.role === 'creator' || entry.role === 'visitor') &&
    typeof entry.lastOpenedAt === 'string'
  );
};

/**
 * The trips this browser has opened, most recently opened first.
 *
 * Anything unparseable or malformed is dropped rather than repaired: the list is a
 * convenience, and a half-read entry would render as a broken row.
 */
export const getRecentTrips = (): RecentTrip[] => {
  const raw = readRaw();
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(isEntry)
    .sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt))
    .slice(0, MAX_ENTRIES);
};

/**
 * Records a trip this browser opened, or refreshes the name, dates and timestamp of
 * one already recorded.
 *
 * `role` defaults to 'visitor'; an entry already marked 'creator' stays 'creator', so
 * the creator of a trip who re-opens it through the shared link does not lose the
 * badge that tells them it is theirs.
 */
export const rememberTrip = (
  trip: { id: string; name: string; startDate: string; endDate: string },
  role: RecentTrip['role'] = 'visitor',
  now: Date = new Date(),
): void => {
  if (!trip.id) return;

  const existing = getRecentTrips();
  const previous = existing.find((entry) => entry.id === trip.id);

  const entry: RecentTrip = {
    id: trip.id,
    name: trip.name,
    startDate: trip.startDate,
    endDate: trip.endDate,
    role: previous?.role === 'creator' ? 'creator' : role,
    lastOpenedAt: now.toISOString(),
  };

  const next = [entry, ...existing.filter((e) => e.id !== trip.id)].slice(0, MAX_ENTRIES);
  writeRaw(JSON.stringify(next));
};

/**
 * Removes one trip from this browser's list. The trip itself is untouched — the API
 * has no delete — so this only stops the row appearing on a shared computer.
 */
export const forgetTrip = (id: string): void => {
  const next = getRecentTrips().filter((entry) => entry.id !== id);
  writeRaw(JSON.stringify(next));
};

/** Clears the whole list. */
export const forgetAllTrips = (): void => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Same reasoning as writeRaw: a browser that blocks storage has nothing to clear.
  }
};
