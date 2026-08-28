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
