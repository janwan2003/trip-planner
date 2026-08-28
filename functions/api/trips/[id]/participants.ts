import {
  Env,
  LIMITS,
  badRequest,
  isCalendarDate,
  isName,
  isTripId,
  json,
  newId,
  nowIso,
  readTrip,
} from '../../../_lib/trips';

const tripIdFrom = (params: Record<string, string | string[]>): string | null => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  return isTripId(id) ? id : null;
};

const tripExists = async (env: Env, tripId: string): Promise<boolean> => {
  const row = await env.DB.prepare('SELECT 1 AS present FROM trips WHERE id = ?')
    .bind(tripId)
    .first<{ present: number }>();
  return row !== null;
};

const respondWithTrip = async (env: Env, tripId: string): Promise<Response> => {
  const trip = await readTrip(env.DB, tripId);
  return trip ? json(trip) : json({ error: 'Not found.' }, 404);
};

interface UpsertBody {
  name?: unknown;
  availableDates?: unknown;
}

/**
 * PUT /api/trips/:id/participants — add a participant, or replace the availability of
 * one who already exists under that name.
 *
 * Matching is case-insensitive and the unique index enforces the same rule, so two
 * people saving "Anna" and "anna" at the same moment end up as one participant rather
 * than two rows that the UI would then show twice.
 */
export const onRequestPut: PagesFunction<Env> = async ({ request, params, env }) => {
  const tripId = tripIdFrom(params);
  if (!tripId) return json({ error: 'Not found.' }, 404);

  let body: UpsertBody;
  try {
    body = (await request.json()) as UpsertBody;
  } catch {
    return badRequest('Body must be JSON.');
  }

  const { name, availableDates } = body;

  if (!isName(name)) {
    return badRequest(`name must be 1-${LIMITS.name} characters.`);
  }
  if (!Array.isArray(availableDates)) {
    return badRequest('availableDates must be an array of YYYY-MM-DD strings.');
  }
  if (availableDates.length > LIMITS.datesPerParticipant) {
    return badRequest(`availableDates must hold at most ${LIMITS.datesPerParticipant} dates.`);
  }
  if (!availableDates.every(isCalendarDate)) {
    return badRequest('availableDates must hold real calendar dates as YYYY-MM-DD.');
  }

  if (!(await tripExists(env, tripId))) {
    return json({ error: 'Not found.' }, 404);
  }

  const trimmed = name.trim();
  // Deduplicate and sort so the stored value does not depend on click order.
  const dates = JSON.stringify([...new Set(availableDates)].sort());
  const timestamp = nowIso();

  // Update first. Someone already on the trip is not subject to the participant cap -
  // locking out the people who are already there would be a worse bug than the one the
  // cap prevents - so this path never consults it.
  const updated = await env.DB.prepare(
    `UPDATE participants
        SET name = ?, available_dates = ?, updated_at = ?
      WHERE trip_id = ? AND lower(name) = lower(?)`,
  )
    .bind(trimmed, dates, timestamp, tripId, trimmed)
    .run();

  if ((updated.meta.changes ?? 0) > 0) {
    return respondWithTrip(env, tripId);
  }

  // Nobody by that name yet, so this is an insert and the cap applies. The count lives
  // inside the statement rather than in a preceding SELECT: read-then-insert let two
  // simultaneous requests at 199 both pass the check and land a 201st participant.
  //
  // ON CONFLICT absorbs the other race - two requests inserting the same name at once -
  // which the unique index would otherwise turn into a constraint error and a 500.
  const inserted = await env.DB.prepare(
    `INSERT INTO participants (id, trip_id, name, available_dates, updated_at)
     SELECT ?, ?, ?, ?, ?
      WHERE (SELECT COUNT(*) FROM participants WHERE trip_id = ?) < ?
     ON CONFLICT (trip_id, lower(name)) DO UPDATE
        SET name = excluded.name,
            available_dates = excluded.available_dates,
            updated_at = excluded.updated_at`,
  )
    .bind(newId(), tripId, trimmed, dates, timestamp, tripId, LIMITS.participants)
    .run();

  if ((inserted.meta.changes ?? 0) === 0) {
    return badRequest(`A trip can hold at most ${LIMITS.participants} participants.`);
  }

  return respondWithTrip(env, tripId);
};

interface RenameBody {
  oldName?: unknown;
  newName?: unknown;
}

/** PATCH /api/trips/:id/participants — rename a participant. */
export const onRequestPatch: PagesFunction<Env> = async ({ request, params, env }) => {
  const tripId = tripIdFrom(params);
  if (!tripId) return json({ error: 'Not found.' }, 404);

  let body: RenameBody;
  try {
    body = (await request.json()) as RenameBody;
  } catch {
    return badRequest('Body must be JSON.');
  }

  const { oldName, newName } = body;

  if (!isName(oldName) || !isName(newName)) {
    return badRequest(`oldName and newName must be 1-${LIMITS.name} characters.`);
  }

  const existing = await env.DB.prepare(
    'SELECT id FROM participants WHERE trip_id = ? AND lower(name) = lower(?)',
  )
    .bind(tripId, oldName)
    .first<{ id: string }>();

  if (!existing) {
    return json({ error: 'No participant by that name on this trip.' }, 404);
  }

  const trimmed = newName.trim();

  // Renaming onto a name already taken by someone else would violate the unique
  // index, so it is refused with a reason instead of a 500 from the database.
  const clash = await env.DB.prepare(
    'SELECT id FROM participants WHERE trip_id = ? AND lower(name) = lower(?) AND id != ?',
  )
    .bind(tripId, trimmed, existing.id)
    .first<{ id: string }>();

  if (clash) {
    return json({ error: 'Someone on this trip already uses that name.' }, 409);
  }

  await env.DB.prepare('UPDATE participants SET name = ?, updated_at = ? WHERE id = ?')
    .bind(trimmed, nowIso(), existing.id)
    .run();

  return respondWithTrip(env, tripId);
};

/**
 * DELETE /api/trips/:id/participants?name=... — withdraw from a trip.
 *
 * The name travels in the query string rather than a body because DELETE bodies are
 * not reliably forwarded by every intermediary.
 */
export const onRequestDelete: PagesFunction<Env> = async ({ request, params, env }) => {
  const tripId = tripIdFrom(params);
  if (!tripId) return json({ error: 'Not found.' }, 404);

  const name = new URL(request.url).searchParams.get('name');
  if (!isName(name)) {
    return badRequest('A name query parameter is required.');
  }

  await env.DB.prepare('DELETE FROM participants WHERE trip_id = ? AND lower(name) = lower(?)')
    .bind(tripId, name)
    .run();

  return respondWithTrip(env, tripId);
};
