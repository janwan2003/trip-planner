import {
  Env,
  LIMITS,
  badRequest,
  isCalendarDate,
  isName,
  isTripId,
  json,
  nowIso,
  readTrip,
} from '../../_lib/trips';

interface SaveTripBody {
  id?: unknown;
  name?: unknown;
  startDate?: unknown;
  endDate?: unknown;
}

/**
 * POST /api/trips — create a trip, or update the name and range of one that exists.
 *
 * Participants are not touched here. They have their own endpoint, so saving a trip
 * cannot accidentally wipe availability that other people have already entered.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: SaveTripBody;
  try {
    body = (await request.json()) as SaveTripBody;
  } catch {
    return badRequest('Body must be JSON.');
  }

  const { id, name, startDate, endDate } = body;

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

  const updatedAt = nowIso();

  await env.DB.prepare(
    `INSERT INTO trips (id, name, start_date, end_date, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       start_date = excluded.start_date,
       end_date = excluded.end_date,
       updated_at = excluded.updated_at`,
  )
    .bind(id, name.trim(), startDate, endDate, updatedAt)
    .run();

  const trip = await readTrip(env.DB, id);
  return trip ? json(trip) : json({ error: 'Trip could not be read back after saving.' }, 500);
};
