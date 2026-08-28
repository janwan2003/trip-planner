import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn, ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';

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
  server = spawn(
    'pnpm',
    ['exec', 'wrangler', 'pages', 'dev', '--port', String(PORT), '--ip', '127.0.0.1'],
    { stdio: 'ignore', env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: '1' } },
  );
  await waitForServer();
}, 120_000);

afterAll(() => {
  server?.kill('SIGTERM');
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

  it('accepts 1000 dates and rejects 1001', async () => {
    const { id } = await createTrip({ startDate: '2026-01-01', endDate: '2029-12-31' });

    const isoDay = (offset: number) =>
      new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);

    const thousand = Array.from({ length: 1000 }, (_, i) => isoDay(i));
    expect((await putParticipant(id, 'Ada', thousand)).status).toBe(200);

    const thousandAndOne = Array.from({ length: 1001 }, (_, i) => isoDay(i));
    expect((await putParticipant(id, 'Bo', thousandAndOne)).status).toBe(400);
  });

  it('stores 1000 dates without losing any', async () => {
    const { id } = await createTrip({ startDate: '2026-01-01', endDate: '2029-12-31' });
    const dates = Array.from({ length: 1000 }, (_, i) =>
      new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10),
    );

    await putParticipant(id, 'Ada', dates);
    const trip = await (await fetch(`${API}/${id}`)).json();

    expect(trip.participants[0].availableDates).toHaveLength(1000);
    expect(trip.participants[0].availableDates[0]).toBe('2026-01-01');
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
