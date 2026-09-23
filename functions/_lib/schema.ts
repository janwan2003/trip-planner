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
 * migrations. Adding a nullable column works, through `ADDED_COLUMNS` below. Anything
 * destructive — dropping or altering a column — cannot be expressed this way and needs
 * real migrations, which is a small change once someone has run `wrangler login` and
 * can use `wrangler d1 migrations apply`.
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
  // Bug reports and feature requests from the buttons at the top of the app. Not tied
  // to a trip by key: feedback should outlive any trip it mentions.
  `CREATE TABLE IF NOT EXISTS feedback (
     id         TEXT PRIMARY KEY,
     kind       TEXT NOT NULL CHECK (kind IN ('bug', 'feature')),
     message    TEXT NOT NULL,
     contact    TEXT,
     page       TEXT,
     user_agent TEXT,
     created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
   )`,
];

/**
 * Columns added after a table was first created in production, and so absent from the
 * CREATE TABLE above for a database that already existed.
 *
 * SQLite has no `ADD COLUMN IF NOT EXISTS`, and a duplicate ADD COLUMN inside the batch
 * above would fail the whole batch - and with it every API request. So each is added on
 * its own, only when `PRAGMA table_info` says it is missing, and a "duplicate column"
 * error from an isolate that lost the race to add it is treated as success.
 *
 * Nullable only: an existing row has to be valid without a value.
 */
const ADDED_COLUMNS: { table: string; column: string; definition: string }[] = [
  // How the creator reached the create form; see TRIP_ORIGINS in trips.ts. Added
  // 2026-09-23. Trips created before then hold NULL.
  { table: 'trips', column: 'origin', definition: 'TEXT' },
];

const addMissingColumns = async (db: D1Database): Promise<void> => {
  for (const { table, column, definition } of ADDED_COLUMNS) {
    const { results } = await db.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>();
    if (results.some((row) => row.name === column)) continue;

    try {
      await db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
    } catch (error) {
      if (!/duplicate column/i.test(String(error))) throw error;
    }
  }
};

/** Memoised per isolate, so the statements run once rather than once per request. */
let applied: Promise<void> | null = null;

export const ensureSchema = (db: D1Database): Promise<void> => {
  applied ??= db
    .batch(STATEMENTS.map((sql) => db.prepare(sql)))
    .then(() => addMissingColumns(db))
    .catch((error: unknown) => {
      // Do not cache a failure: the next request should try again rather than
      // inherit a permanently broken isolate.
      applied = null;
      throw error;
    });

  return applied;
};
