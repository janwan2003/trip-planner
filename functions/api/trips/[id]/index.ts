import { Env, isTripId, json, readTrip } from '../../../_lib/trips';

/** GET /api/trips/:id — one trip with its participants. */
export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!isTripId(id)) {
    return json({ error: 'Not found.' }, 404);
  }

  const trip = await readTrip(env.DB, id);
  return trip ? json(trip) : json({ error: 'Not found.' }, 404);
};
