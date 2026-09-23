import {
  Env,
  LIMITS,
  badRequest,
  daysInclusive,
  isCalendarDate,
  isName,
  isTripId,
  isTripOrigin,
  json,
  nowIso,
  readTrip,
} from '../../_lib/trips';

interface SaveTripBody {
  id?: unknown;
  name?: unknown;
  startDate?: unknown;
  endDate?: unknown;
  origin?: unknown;
}

/**
 * POST /api/trips — create a trip, or update the name and range of one that exists.
 *
 * Participants are not touched here. They have their own endpoint, so saving a trip
 * cannot accidentally wipe availability that other people have already entered.
 *
 * `origin` is stored on creation only and never overwritten, so the first answer stands.
 * Anything other than a known value is stored as NULL rather than refused: a bundle
 * cached from before the field, or a hand-written request, must still create its trip.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: SaveTripBody;
  try {
    body = (await request.json()) as SaveTripBody;
  } catch {
    return badRequest('Body must be JSON.');
  }

  const { id, name, startDate, endDate, origin } = body;

  if (!isTripId(id)) {
    return badRequest(`id must be 1-${LIMITS.tripId} characters of A-Z, a-z, 0-9, "-" or "_".`);
  }
  if (!isName(name)) {
    return badRequest(`name must be 1-${LIMITS.name} characters.`);
  }
  if (!isCalendarDate(startDate) || !isCalendarDate(endDate)) {
    return badRequest('startDate and endDate must be real calendar dates as YYYY-MM-DD.');
  }
  if (startDate > endDate) {
    return badRequest('startDate must not be after endDate.');
  }
  if (daysInclusive(startDate, endDate) > LIMITS.tripDays) {
    return badRequest(`A trip can span at most ${LIMITS.tripDays} days.`);
  }

  const updatedAt = nowIso();

  await env.DB.prepare(
    `INSERT INTO trips (id, name, start_date, end_date, updated_at, origin)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       start_date = excluded.start_date,
       end_date = excluded.end_date,
       updated_at = excluded.updated_at`,
  )
    .bind(id, name.trim(), startDate, endDate, updatedAt, isTripOrigin(origin) ? origin : null)
    .run();

  const trip = await readTrip(env.DB, id);
  return trip ? json(trip) : json({ error: 'Trip could not be read back after saving.' }, 500);
};
