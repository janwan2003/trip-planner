/**
 * Which name this browser answered a trip under.
 *
 * Without this, reloading a trip link showed "Join this trip" to someone who had already
 * joined and saved dates. Retyping the name exactly re-attached them - the API matches
 * `lower(name)`, so case did not matter - but any variation ("Ania" the first time,
 * "Ania K" the second) created a second participant holding none of the first one's
 * dates, and the trip then reported a group that does not exist.
 *
 * Like `recentTrips`, this is a per-browser convenience, not a credential and not a
 * cache of trip data. The share link is still the only thing that grants access, every
 * screen still reads participants from the API, and a name recalled here is only used
 * after checking it against the participants the API actually returned. A different
 * browser, a cleared profile or a private window simply means the field starts empty.
 *
 * Every function swallows storage failures for the reason given in `recentTrips.ts`:
 * a browser configured to block site data throws on the `localStorage` getter itself,
 * and an unguarded call would take down the join screen.
 */

const TRIP_NAMES_KEY = 'wegowhen.tripNames.v1';
const LAST_NAME_KEY = 'wegowhen.lastName.v1';

/** Keeps the map bounded. Oldest-written entries fall off once this is exceeded. */
const MAX_ENTRIES = 50;

/** Matches the API's own limit, so nothing is stored that could not be sent back. */
const MAX_NAME_LENGTH = 64;

type NameMap = Record<string, string>;

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Full quota or blocked storage. Losing the convenience is acceptable; throwing is not.
  }
};

const remove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Same reasoning as write().
  }
};

const readMap = (): NameMap => {
  const raw = read(TRIP_NAMES_KEY);
  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};

    // Anything could have written this key, so keep only well-formed pairs rather than
    // trusting the shape and crashing later on a non-string name.
    const clean: NameMap = {};
    for (const [id, name] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof name === 'string' && name.trim() && name.length <= MAX_NAME_LENGTH) {
        clean[id] = name;
      }
    }
    return clean;
  } catch {
    return {};
  }
};

/** The name this browser used on a given trip, or null. */
export const recalledName = (tripId: string): string | null => readMap()[tripId] ?? null;

/**
 * The last name this browser used on any trip. Used to prefill a *new* trip's join
 * field, which is a guess - so it is only ever a prefill, never an auto-join.
 */
export const lastUsedName = (): string | null => {
  const name = read(LAST_NAME_KEY);
  return name && name.trim() && name.length <= MAX_NAME_LENGTH ? name : null;
};

/** Records the name for this trip, and as this browser's most recent name. */
export const rememberName = (tripId: string, name: string): void => {
  const trimmed = name.trim();
  if (!tripId || !trimmed || trimmed.length > MAX_NAME_LENGTH) return;

  const map = readMap();
  // Re-insert rather than mutate in place, so this trip becomes the newest key and the
  // eviction below drops genuinely stale trips instead of the one in front of us.
  delete map[tripId];
  const entries = [...Object.entries(map), [tripId, trimmed] as const];
  const kept = entries.slice(Math.max(0, entries.length - MAX_ENTRIES));

  write(TRIP_NAMES_KEY, JSON.stringify(Object.fromEntries(kept)));
  write(LAST_NAME_KEY, trimmed);
};

/**
 * Drops the name for one trip, without touching the last-used name.
 *
 * Called when someone withdraws: they are no longer a participant, so auto-rejoining
 * them on the next visit would silently put them back in the group.
 */
export const forgetName = (tripId: string): void => {
  const map = readMap();
  if (!(tripId in map)) return;

  delete map[tripId];
  if (Object.keys(map).length === 0) remove(TRIP_NAMES_KEY);
  else write(TRIP_NAMES_KEY, JSON.stringify(map));
};
