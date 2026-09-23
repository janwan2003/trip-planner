import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execFileSync, spawn, ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TRIP_ORIGINS } from '../src/lib/tripStore';

/**
 * Integration tests for the trip API, run against a real `wrangler pages dev` with a
 * real (local) D1 database. Nothing is mocked: these exercise the Functions, the SQL,
 * the unique index and the middleware together.
 *
 * They are deliberately out of the default `pnpm test` run - booting workerd takes
 * seconds - and have their own config and script. CI runs them as a separate step.
 *
 * Requires `pnpm run build` first, because Pages serves `dist` alongside the Functions.
 */

const PORT = 8798;
const BASE = `http://127.0.0.1:${PORT}`;
const API = `${BASE}/api/trips`;

let server: ChildProcess;

/**
 * Each run gets its own local D1, seeded with the `trips` table as production had it
 * before `origin` existed, plus one trip in it. So every run exercises the upgrade path
 * production takes - `ensureSchema` adding a column to a table that already has rows -
 * and not only the fresh-database path CI would otherwise see.
 */
const persistDir = mkdtempSync(join(tmpdir(), 'wegowhen-d1-'));
const WRANGLER = join(process.cwd(), 'node_modules', '.bin', 'wrangler');
const LEGACY_TRIP_ID = 'legacy00000000000000000000000001';

/** Runs SQL against the test's local D1 and returns the rows. Test-only; ids are hex. */
const sql = (query: string): Record<string, unknown>[] => {
  const out = execFileSync(
    WRANGLER,
    ['d1', 'execute', 'wegowhen', '--local', '--persist-to', persistDir, '--json', '--command', query],
    { encoding: 'utf8', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' } },
  );
  return JSON.parse(out.slice(out.indexOf('[')))[0].results;
};

const newTripId = () => randomBytes(16).toString('hex');

const waitForServer = async (timeoutMs = 90_000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/api/trips/doesnotexist`);
      // Any answer from our middleware means the Functions are live.
      if (response.status === 404) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`wrangler pages dev did not become ready on ${BASE}`);
};

const createTrip = async (over: Record<string, unknown> = {}) => {
  const id = newTripId();
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id,
      name: 'Integration trip',
      startDate: '2026-09-01',
      endDate: '2026-09-10',
      ...over,
    }),
  });
  return { id, response };
};

const putParticipant = (tripId: string, name: string, availableDates: string[]) =>
  fetch(`${API}/${tripId}/participants`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, availableDates }),
  });

beforeAll(async () => {
  sql(`CREATE TABLE trips (
         id         TEXT PRIMARY KEY,
         name       TEXT NOT NULL,
         start_date TEXT NOT NULL,
         end_date   TEXT NOT NULL,
         created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
         updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
       );
       INSERT INTO trips (id, name, start_date, end_date)
       VALUES ('${LEGACY_TRIP_ID}', 'Made before origin', '2026-12-28', '2027-01-03');`);

  server = spawn(
    WRANGLER,
    ['pages', 'dev', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', persistDir],
    { stdio: 'ignore', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' } },
  );
  await waitForServer();
}, 150_000);

afterAll(() => {
  server?.kill('SIGTERM');
  rmSync(persistDir, { recursive: true, force: true });
});

describe('trip lifecycle', () => {
  it('creates a trip and reads it back', async () => {
    const { id, response } = await createTrip({ name: 'Alps' });
    expect(response.status).toBe(200);

    const created = await response.json();
    expect(created).toMatchObject({ id, name: 'Alps', participants: [] });
    expect(created.created_at).toBeTruthy();

    const fetched = await (await fetch(`${API}/${id}`)).json();
    expect(fetched).toMatchObject({ id, name: 'Alps' });
  });

  it('updates a trip without disturbing its participants', async () => {
    const { id } = await createTrip();
    await putParticipant(id, 'Ada', ['2026-09-02']);

    await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        name: 'Renamed',
        startDate: '2026-09-01',
        endDate: '2026-09-20',
      }),
    });

    const trip = await (await fetch(`${API}/${id}`)).json();
    expect(trip.name).toBe('Renamed');
    expect(trip.endDate).toBe('2026-09-20');
    // The point: saving the trip must not wipe availability other people entered.
    expect(trip.participants).toHaveLength(1);
    expect(trip.participants[0]).toMatchObject({ name: 'Ada', availableDates: ['2026-09-02'] });
  });

  it('answers 404 for a trip that was never created', async () => {
    const response = await fetch(`${API}/${newTripId()}`);
    expect(response.status).toBe(404);
  });
});

describe('participants', () => {
  it('stores dates deduplicated and sorted, whatever order they arrive in', async () => {
    const { id } = await createTrip();

    const trip = await (
      await putParticipant(id, 'Ada', ['2026-09-05', '2026-09-02', '2026-09-05'])
    ).json();

    expect(trip.participants[0].availableDates).toEqual(['2026-09-02', '2026-09-05']);
  });

  it('treats the same name in a different case as the same person', async () => {
    const { id } = await createTrip();

    await putParticipant(id, 'Ada', ['2026-09-02']);
    const trip = await (await putParticipant(id, 'ADA', ['2026-09-03'])).json();

    expect(trip.participants).toHaveLength(1);
    expect(trip.participants[0].availableDates).toEqual(['2026-09-03']);
  });

  it('keeps the stored spelling when a save uses another case', async () => {
    const { id } = await createTrip();

    await putParticipant(id, 'Anna', ['2026-09-02']);
    const trip = await (await putParticipant(id, 'anna', ['2026-09-03'])).json();

    expect(trip.participants[0].name).toBe('Anna');
  });

  it('refuses a save made from a stale read, and says what is current', async () => {
    const { id } = await createTrip();
    const first = await (await putParticipant(id, 'Bob', ['2026-09-02'])).json();
    const loadedAt = first.participants[0].updated_at;
    expect(typeof loadedAt).toBe('string');

    // Bob changes his own answer from another phone.
    await putParticipant(id, 'Bob', ['2026-09-04']);

    // The first phone still holds the old read and saves over it.
    const stale = await fetch(`${API}/${id}/participants`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Bob', availableDates: ['2026-09-09'], expectedUpdatedAt: loadedAt }),
    });

    expect(stale.status).toBe(409);
    const body = await stale.json();
    expect(body.trip.participants[0].availableDates).toEqual(['2026-09-04']);
  });

  it('applies a save whose read is current', async () => {
    const { id } = await createTrip();
    const first = await (await putParticipant(id, 'Bob', ['2026-09-02'])).json();

    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'bob',
        availableDates: ['2026-09-09'],
        expectedUpdatedAt: first.participants[0].updated_at,
      }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).participants[0].availableDates).toEqual(['2026-09-09']);
  });

  it('will not overwrite a row that appeared after the client saw none', async () => {
    const { id } = await createTrip();
    await putParticipant(id, 'Cleo', ['2026-09-02']);

    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Cleo', availableDates: ['2026-09-09'], expectedUpdatedAt: null }),
    });

    expect(response.status).toBe(409);
    expect((await response.json()).trip.participants[0].availableDates).toEqual(['2026-09-02']);
  });

  it('inserts a new participant when the client expects none', async () => {
    const { id } = await createTrip();

    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Dee', availableDates: ['2026-09-02'], expectedUpdatedAt: null }),
    });

    expect(response.status).toBe(200);
    expect((await response.json()).participants).toHaveLength(1);
  });

  it('does not report days outside the trip', async () => {
    const { id } = await createTrip();

    const trip = await (
      await putParticipant(id, 'Ada', ['2026-08-31', '2026-09-02', '2026-09-11'])
    ).json();

    expect(trip.participants[0].availableDates).toEqual(['2026-09-02']);
  });

  it('keeps two different people apart', async () => {
    const { id } = await createTrip();

    await putParticipant(id, 'Ada', ['2026-09-02']);
    const trip = await (await putParticipant(id, 'Bo', ['2026-09-03'])).json();

    expect(trip.participants.map((p: { name: string }) => p.name).sort()).toEqual(['Ada', 'Bo']);
  });

  it('renames a participant', async () => {
    const { id } = await createTrip();
    await putParticipant(id, 'Ada', ['2026-09-02']);

    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ oldName: 'ada', newName: 'Bea' }),
    });

    expect(response.status).toBe(200);
    const trip = await response.json();
    expect(trip.participants[0]).toMatchObject({ name: 'Bea', availableDates: ['2026-09-02'] });
  });

  it('refuses a rename onto a name someone else already uses', async () => {
    const { id } = await createTrip();
    await putParticipant(id, 'Ada', ['2026-09-02']);
    await putParticipant(id, 'Bo', ['2026-09-03']);

    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ oldName: 'Bo', newName: 'ada' }),
    });

    expect(response.status).toBe(409);
    expect((await response.json()).error).toMatch(/already uses that name/i);
  });

  it('withdraws a participant regardless of the case used', async () => {
    const { id } = await createTrip();
    await putParticipant(id, 'Ada', ['2026-09-02']);

    const trip = await (
      await fetch(`${API}/${id}/participants?name=ADA`, { method: 'DELETE' })
    ).json();

    expect(trip.participants).toHaveLength(0);
  });

  it('will not add a participant to a trip that does not exist', async () => {
    const response = await putParticipant(newTripId(), 'Ada', ['2026-09-02']);
    expect(response.status).toBe(404);
  });
});

describe('validation', () => {
  const cases: Array<[string, RequestInit, number]> = [
    ['body is not JSON', { method: 'POST', body: 'not json' }, 400],
    [
      'id has characters outside the allowed set',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'has spaces',
          name: 'x',
          startDate: '2026-09-01',
          endDate: '2026-09-02',
        }),
      },
      400,
    ],
    [
      'date does not exist in the calendar',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'aaaabbbbccccdddd',
          name: 'x',
          startDate: '2026-02-31',
          endDate: '2026-03-01',
        }),
      },
      400,
    ],
    [
      'range is inverted',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'aaaabbbbccccdddd',
          name: 'x',
          startDate: '2026-09-10',
          endDate: '2026-09-01',
        }),
      },
      400,
    ],
    [
      'name is only whitespace',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: 'aaaabbbbccccdddd',
          name: '   ',
          startDate: '2026-09-01',
          endDate: '2026-09-02',
        }),
      },
      400,
    ],
  ];

  it.each(cases)('rejects when the %s', async (_label, init, status) => {
    const response = await fetch(API, init);
    expect(response.status).toBe(status);
    expect(response.headers.get('content-type')).toMatch(/json/);
  });

  it('rejects availability that is not an array', async () => {
    const { id } = await createTrip();
    const response = await fetch(`${API}/${id}/participants`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Ada', availableDates: 'nope' }),
    });

    expect(response.status).toBe(400);
  });

  it('rejects a badly formatted date inside availability', async () => {
    const { id } = await createTrip();
    const response = await putParticipant(id, 'Ada', ['01-09-2026']);
    expect(response.status).toBe(400);
  });

  it('requires a name when withdrawing', async () => {
    const { id } = await createTrip();
    const response = await fetch(`${API}/${id}/participants`, { method: 'DELETE' });
    expect(response.status).toBe(400);
  });
});

describe('limits', () => {
  /**
   * The API is unauthenticated by design - possession of the link is the credential -
   * so the caps in functions/_lib/trips.ts are the only thing bounding what one
   * request can write. Each boundary is checked on both sides, because an off-by-one
   * in a cap is exactly the kind of thing nobody notices.
   */

  it('accepts a trip id of exactly 64 characters and rejects 65', async () => {
    const ok = await createTrip({ id: 'a'.repeat(64) });
    expect(ok.response.status).toBe(200);

    const tooLong = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: 'a'.repeat(65),
        name: 'x',
        startDate: '2026-09-01',
        endDate: '2026-09-02',
      }),
    });
    expect(tooLong.status).toBe(400);
  });

  it('accepts a trip name of exactly 120 characters and rejects 121', async () => {
    const ok = await createTrip({ name: 'n'.repeat(120) });
    expect(ok.response.status).toBe(200);
    expect((await (await fetch(`${API}/${ok.id}`)).json()).name).toHaveLength(120);

    const tooLong = await createTrip({ name: 'n'.repeat(121) });
    expect(tooLong.response.status).toBe(400);
  });

  it('accepts a participant name of exactly 120 characters and rejects 121', async () => {
    const { id } = await createTrip();

    expect((await putParticipant(id, 'p'.repeat(120), [])).status).toBe(200);
    expect((await putParticipant(id, 'p'.repeat(121), [])).status).toBe(400);
  });

  it('accepts 366 dates and rejects 367', async () => {
    const { id } = await createTrip({ startDate: '2028-01-01', endDate: '2028-12-31' });

    const isoDay = (offset: number) =>
      new Date(Date.UTC(2028, 0, 1 + offset)).toISOString().slice(0, 10);

    const full = Array.from({ length: 366 }, (_, i) => isoDay(i));
    expect((await putParticipant(id, 'Ada', full)).status).toBe(200);
    const trip = await (await fetch(`${API}/${id}`)).json();
    expect(trip.participants[0].availableDates).toHaveLength(366);

    const tooMany = Array.from({ length: 367 }, (_, i) => isoDay(i));
    expect((await putParticipant(id, 'Bo', tooMany)).status).toBe(400);
  });

  it('accepts a 366-day trip and rejects a 367-day one', async () => {
    expect((await createTrip({ startDate: '2028-01-01', endDate: '2028-12-31' })).response.status).toBe(200);
    const tooLong = await createTrip({ startDate: '2028-01-01', endDate: '2029-01-01' });
    expect(tooLong.response.status).toBe(400);
    expect((await tooLong.response.json()).error).toMatch(/at most 366 days/i);
  });

  it('accepts 200 participants and refuses the 201st', async () => {
    const { id } = await createTrip();

    // Sequential rather than parallel: the cap is a read-then-insert, so firing 200 at
    // once would be testing the race instead of the limit.
    for (let i = 0; i < 200; i += 1) {
      const response = await putParticipant(id, `P${i}`, ['2026-09-02']);
      if (response.status !== 200) throw new Error(`participant ${i} was rejected`);
    }

    const trip = await (await fetch(`${API}/${id}`)).json();
    expect(trip.participants).toHaveLength(200);

    const overflow = await putParticipant(id, 'P200', ['2026-09-02']);
    expect(overflow.status).toBe(400);
    expect((await overflow.json()).error).toMatch(/at most 200 participants/i);

    // An existing participant can still update their availability at the cap - the
    // limit guards inserts, not writes.
    expect((await putParticipant(id, 'P0', ['2026-09-03'])).status).toBe(200);
  }, 60_000);

  it('trims surrounding whitespace from names rather than storing it', async () => {
    const { id } = await createTrip({ name: '  Alps  ' });
    expect((await (await fetch(`${API}/${id}`)).json()).name).toBe('Alps');

    const trip = await (await putParticipant(id, '  Ada  ', [])).json();
    expect(trip.participants[0].name).toBe('Ada');
  });

  it('treats a padded name as the same participant', async () => {
    const { id } = await createTrip();

    await putParticipant(id, 'Ada', ['2026-09-02']);
    const trip = await (await putParticipant(id, '  ada  ', ['2026-09-03'])).json();

    expect(trip.participants).toHaveLength(1);
  });
});

describe('concurrency', () => {
  /**
   * These pin the *outcome* the atomic upsert is meant to guarantee. They do not
   * reproduce the race: checked against the previous read-then-insert implementation,
   * they pass there too, because the local miniflare runtime appears to serialise these
   * requests. The argument for the single-statement version is structural rather than
   * test-demonstrated - a read followed by a write cannot be atomic across isolates -
   * and these tests exist to catch a regression in the observable behaviour.
   */

  it('never exceeds the participant cap under simultaneous inserts', async () => {
    const { id } = await createTrip();

    for (let i = 0; i < 199; i += 1) {
      await putParticipant(id, `P${i}`, []);
    }

    // Five distinct newcomers arriving at once, with one slot left. Read-then-insert
    // let all five pass the count check.
    const results = await Promise.all(
      ['A', 'B', 'C', 'D', 'E'].map((n) => putParticipant(id, `Late${n}`, ['2026-09-02'])),
    );

    const trip = await (await fetch(`${API}/${id}`)).json();
    expect(trip.participants).toHaveLength(200);
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 400)).toHaveLength(4);
  }, 90_000);

  it('creates one participant, not several, when the same name arrives at once', async () => {
    const { id } = await createTrip();

    // Same person, five taps in flight. The unique index would turn a racing insert
    // into a constraint error and a 500; ON CONFLICT absorbs it into an update.
    const results = await Promise.all([
      putParticipant(id, 'Ada', ['2026-09-02']),
      putParticipant(id, 'ada', ['2026-09-03']),
      putParticipant(id, 'ADA', ['2026-09-04']),
      putParticipant(id, ' Ada ', ['2026-09-05']),
      putParticipant(id, 'aDa', ['2026-09-06']),
    ]);

    expect(results.every((r) => r.status === 200)).toBe(true);

    const trip = await (await fetch(`${API}/${id}`)).json();
    expect(trip.participants).toHaveLength(1);
    // Whichever write landed last wins; the point is that exactly one row exists.
    expect(trip.participants[0].availableDates).toHaveLength(1);
  }, 30_000);

  it('lets an existing participant save while the trip is full', async () => {
    const { id } = await createTrip();

    for (let i = 0; i < 200; i += 1) {
      await putParticipant(id, `Q${i}`, []);
    }

    // The cap guards inserts, not writes.
    expect((await putParticipant(id, 'Q0', ['2026-09-02'])).status).toBe(200);
    expect((await putParticipant(id, 'Q201', ['2026-09-02'])).status).toBe(400);
  }, 90_000);
});

describe('routing', () => {
  /**
   * public/_redirects serves index.html for anything unmatched, which is right for app
   * routes and wrong for the API: before the middleware existed, GET /api/trips
   * answered 200 with HTML, and a JSON client had no way to tell.
   */
  it('never answers an /api path with the SPA shell', async () => {
    for (const path of ['/api/trips', '/api/nothing-here', '/api/trips/x/y/z']) {
      const response = await fetch(`${BASE}${path}`);
      expect(response.headers.get('content-type')).toMatch(/json/);
      expect(response.status).toBeGreaterThanOrEqual(400);
    }
  });

  it('still serves the app for a non-API route', async () => {
    const response = await fetch(`${BASE}/about`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/html/);
  });

  it('does not cache API responses', async () => {
    const { id } = await createTrip();
    const response = await fetch(`${API}/${id}`);
    expect(response.headers.get('cache-control')).toMatch(/no-store/);
  });
});

describe('feedback', () => {
  const postFeedback = (body: unknown) =>
    fetch(`${BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

  it('stores a bug report and a feature request', async () => {
    const bug = await postFeedback({ kind: 'bug', message: 'It broke', contact: 'a@b.co', page: '/' });
    expect(bug.status).toBe(201);
    expect((await bug.json()).id).toBeTruthy();

    const feature = await postFeedback({ kind: 'feature', message: 'Dark mode' });
    expect(feature.status).toBe(201);
  });

  it('refuses an unknown kind, an empty message and an oversized one', async () => {
    expect((await postFeedback({ kind: 'praise', message: 'hi' })).status).toBe(400);
    expect((await postFeedback({ kind: 'bug', message: '   ' })).status).toBe(400);
    expect((await postFeedback({ kind: 'bug', message: 'x'.repeat(2001) })).status).toBe(400);
    expect((await postFeedback({ kind: 'bug', message: 'ok', contact: 'x'.repeat(201) })).status).toBe(400);
    expect((await postFeedback({ kind: 'bug', message: 'ok', contact: 42 })).status).toBe(400);
  });

  it('refuses a body that is not JSON', async () => {
    const response = await fetch(`${BASE}/api/feedback`, { method: 'POST', body: 'nope' });
    expect(response.status).toBe(400);
  });

  it('cannot be read back', async () => {
    // Feedback is write-only: nothing one visitor sends is shown to another.
    expect((await fetch(`${BASE}/api/feedback`)).status).toBe(404);
  });
});

describe('trip origin', () => {
  it('is added to a database created before it existed, and older trips still read', async () => {
    // The first request above ran ensureSchema against the seeded, origin-less table.
    const response = await fetch(`${API}/${LEGACY_TRIP_ID}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: LEGACY_TRIP_ID, startDate: '2026-12-28' });

    expect(sql("SELECT name FROM pragma_table_info('trips')").map((row) => row.name)).toContain(
      'origin',
    );
    expect(sql(`SELECT origin FROM trips WHERE id = '${LEGACY_TRIP_ID}'`)).toEqual([{ origin: null }]);
  });

  it('stores every origin the client can send, and never returns it', async () => {
    // Imported from the client, so the two lists cannot drift apart: a value the client
    // sends and the API does not know would be stored as NULL and silently uncounted.
    const created: Record<string, string> = {};
    for (const origin of TRIP_ORIGINS) {
      const { id, response } = await createTrip({ origin });
      expect(response.status).toBe(200);
      expect(await response.json()).not.toHaveProperty('origin');
      created[id] = origin;
    }

    const rows = sql(
      `SELECT id, origin FROM trips WHERE id IN (${Object.keys(created).map((id) => `'${id}'`).join(',')})`,
    );
    expect(Object.fromEntries(rows.map((row) => [row.id, row.origin]))).toEqual(created);
  });

  it('stores NULL for an unknown or missing origin, rather than refusing the trip', async () => {
    const unknown = await createTrip({ origin: 'newsletter' });
    const missing = await createTrip();
    const wrongType = await createTrip({ origin: 42 });
    for (const { response } of [unknown, missing, wrongType]) expect(response.status).toBe(200);

    const ids = [unknown.id, missing.id, wrongType.id].map((id) => `'${id}'`).join(',');
    expect(sql(`SELECT origin FROM trips WHERE id IN (${ids})`)).toEqual([
      { origin: null },
      { origin: null },
      { origin: null },
    ]);
  });

  it('keeps the origin a trip was created with when it is saved again', async () => {
    const { id } = await createTrip({ origin: 'direct' });

    const resave = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        name: 'Renamed',
        startDate: '2026-09-01',
        endDate: '2026-09-10',
        origin: 'trip-page',
      }),
    });
    expect(resave.status).toBe(200);

    expect(sql(`SELECT name, origin FROM trips WHERE id = '${id}'`)).toEqual([
      { name: 'Renamed', origin: 'direct' },
    ]);
  });
});

describe('invitation link previews', () => {
  /** The value of a meta tag, looked up by its `name` or `property`. */
  const meta = (html: string, key: string): string | undefined =>
    new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`).exec(html)?.[1];
  const title = (html: string) => /<title>([^<]*)<\/title>/.exec(html)?.[1];
  const canonical = (html: string) => /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];

  const openInvitation = (path: string) => fetch(`${BASE}${path}`, { redirect: 'manual' });

  it("names the trip's dates in every preview tag, and points og:url at the link itself", async () => {
    const { id } = await createTrip({ startDate: '2027-02-01', endDate: '2027-02-28' });

    const response = await openInvitation(`/trip/${id}`);
    // 200, not the 308 a misspelt shell path once turned every invitation into.
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/html/);
    const html = await response.text();

    const expected = "Mark the days you're free: Feb 1 – 28, 2027 | WeGoWhen";
    expect(title(html)).toBe(expected);
    expect(meta(html, 'og:title')).toBe(expected);
    expect(meta(html, 'twitter:title')).toBe(expected);
    for (const key of ['description', 'og:description', 'twitter:description']) {
      expect(meta(html, key)).toMatch(/Tap the days you can make it/);
    }
    // Facebook and WhatsApp key their preview cache on og:url; one shared value for every
    // trip could serve one trip's card for all of them.
    expect(meta(html, 'og:url')).toBe(`https://wegowhen.com/trip/${id}`);
    expect(canonical(html)).toBe(`https://wegowhen.com/trip/${id}`);
  });

  it("never puts the trip's name, or anyone's name, into the page", async () => {
    const { id } = await createTrip({ name: 'Zqxv private trip name' });
    await putParticipant(id, 'Qwzy Person', ['2026-09-02']);

    const html = await (await openInvitation(`/trip/${id}`)).text();

    expect(html).not.toContain('Zqxv');
    expect(html).not.toContain('Qwzy');
  });

  it('is still the private, empty shell', async () => {
    const { id } = await createTrip();

    const html = await (await openInvitation(`/trip/${id}`)).text();

    // Kept out of search by its own head, whatever robots.txt says.
    expect(meta(html, 'robots')).toBe('noindex, nofollow');
    // An empty root: the landing page's body here would put the create form on screen
    // in front of someone opening an invitation, until the JavaScript replaced it.
    expect(html).toMatch(/<div id="root"><\/div>/);
  });

  it('serves the generic shell for a trip that does not exist', async () => {
    const response = await openInvitation(`/trip/${newTripId()}`);

    expect(response.status).toBe(200);
    const html = await response.text();
    expect(meta(html, 'og:title')).toBe('Your trip | WeGoWhen');
    expect(html).toMatch(/<div id="root"><\/div>/);
  });

  it('serves the generic shell for an id the API would refuse', async () => {
    for (const path of [`/trip/${'a'.repeat(65)}`, '/trip/bad%22id%3Cscript%3E']) {
      const response = await openInvitation(path);
      expect(response.status).toBe(200);
      const html = await response.text();
      expect(meta(html, 'og:title')).toBe('Your trip | WeGoWhen');
      expect(html).not.toContain('bad"id');
    }
  });

  it('works for a trip created before origin existed', async () => {
    const html = await (await openInvitation(`/trip/${LEGACY_TRIP_ID}`)).text();
    expect(meta(html, 'og:title')).toBe(
      "Mark the days you're free: Dec 28, 2026 – Jan 3, 2027 | WeGoWhen",
    );
  });

  it('carries the same security headers as a static page', async () => {
    // public/_headers is not applied to a Function's response, so the Function repeats
    // its headers. This is what keeps the two copies from drifting apart.
    const { id } = await createTrip();
    const invitation = await openInvitation(`/trip/${id}`);
    const staticPage = await fetch(`${BASE}/about`);

    for (const header of ['strict-transport-security', 'x-content-type-options', 'referrer-policy']) {
      expect(staticPage.headers.get(header)).toBeTruthy();
      expect(invitation.headers.get(header)).toBe(staticPage.headers.get(header));
    }
    // The file's validator would describe bytes this response no longer has.
    expect(invitation.headers.get('etag')).toBeNull();
  });

  it('answers HEAD with the headers and no body', async () => {
    const { id } = await createTrip();
    const response = await fetch(`${BASE}/trip/${id}`, { method: 'HEAD', redirect: 'manual' });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/html/);
    expect(await response.text()).toBe('');
  });

  it('leaves /trip itself a 404, and deeper paths on the old shell rewrite', async () => {
    expect((await openInvitation('/trip')).status).toBe(404);

    const deeper = await openInvitation('/trip/a/b');
    expect(deeper.status).toBe(200);
    expect(meta(await deeper.text(), 'og:title')).toBe('Your trip | WeGoWhen');
  });
});
