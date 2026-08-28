/**
 * The database schema, and the single place it is defined.
 *
 * Why this is applied from the Function rather than by `wrangler d1 migrations apply`:
 * applying migrations out of band needs a Cloudflare credential, and the only one
 * offered without a lot of ceremony is an OAuth grant covering the whole account —
 * workers, pages, DNS certificates, email sending. That is a large standing permission
 * to buy one CREATE TABLE, so the schema is applied by the app instead.
 *
 * Every statement is idempotent, so running it on each cold start is safe and two
 * isolates racing both succeed. The cost is a handful of no-op statements the first
 * time an isolate serves a request, and `ensureSchema` memoises per isolate so it is
 * not paid per request.
 *
 * The trade-off worth knowing: schema changes are code changes here, not numbered
 * migrations. Anything destructive — dropping or altering a column — cannot be
 * expressed this way and needs real migrations, which is a small change once someone
 * has run `wrangler login` and can use `wrangler d1 migrations apply`.
 */

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS trips (
     id         TEXT PRIMARY KEY,
     name       TEXT NOT NULL,
     start_date TEXT NOT NULL,
     end_date   TEXT NOT NULL,
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
     updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   )`,
  `CREATE TABLE IF NOT EXISTS participants (
     id              TEXT PRIMARY KEY,
     trip_id         TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
     name            TEXT NOT NULL,
     available_dates TEXT NOT NULL DEFAULT '[]',
     created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
     updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   )`,
  // One participant per name per trip, case-insensitively: the app has always treated
  // "Anna" and "anna" as the same person, and the database should agree rather than
  // leaving it to whichever code path happens to run first.
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_participants_trip_name
     ON participants (trip_id, lower(name))`,
  `CREATE INDEX IF NOT EXISTS idx_participants_trip_id ON participants (trip_id)`,
  `CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips (created_at)`,
];

/** Memoised per isolate, so the statements run once rather than once per request. */
let applied: Promise<void> | null = null;

export const ensureSchema = (db: D1Database): Promise<void> => {
  applied ??= db
    .batch(STATEMENTS.map((sql) => db.prepare(sql)))
    .then(() => undefined)
    .catch((error: unknown) => {
      // Do not cache a failure: the next request should try again rather than
      // inherit a permanently broken isolate.
      applied = null;
      throw error;
    });

  return applied;
};
