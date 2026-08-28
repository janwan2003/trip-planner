import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  Trip,
  TripApiError,
  addParticipant,
  generateTripId,
  getAvailabilityCount,
  getDatesBetween,
  getTrip,
  removeParticipant,
  saveTrip,
  updateParticipantName,
} from './tripStore';

const trip = (over: Partial<Trip> = {}): Trip => ({
  id: 'abc123',
  name: 'Alps',
  startDate: '2026-09-01',
  endDate: '2026-09-05',
  participants: [],
  ...over,
});

/** Builds a Response-alike, because jsdom's fetch is what we are replacing. */
const reply = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
  }) as Response;

describe('getDatesBetween', () => {
  it('includes both ends of the range', () => {
    expect(getDatesBetween('2026-09-01', '2026-09-04')).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
  });

  it('returns a single date when start and end are the same day', () => {
    expect(getDatesBetween('2026-09-01', '2026-09-01')).toEqual(['2026-09-01']);
  });

  it('returns nothing when the range is inverted', () => {
    expect(getDatesBetween('2026-09-05', '2026-09-01')).toEqual([]);
  });

  it('crosses a month boundary', () => {
    expect(getDatesBetween('2026-08-30', '2026-09-02')).toEqual([
      '2026-08-30',
      '2026-08-31',
      '2026-09-01',
      '2026-09-02',
    ]);
  });

  it('handles a leap day', () => {
    expect(getDatesBetween('2028-02-27', '2028-03-01')).toEqual([
      '2028-02-27',
      '2028-02-28',
      '2028-02-29',
      '2028-03-01',
    ]);
  });

  describe('timezones', () => {
    /**
     * The previous guard here stubbed `Date.prototype.getTimezoneOffset` and asserted the
     * range came back unshifted. It passed for months while the bug was live, because the
     * implementation never called that method: `new Date('2026-09-01')` and `getFullYear()`
     * read the engine's own timezone, which a stub cannot reach. The suite now runs in
     * America/New_York (see src/test/setup.ts), so these assertions are made from the
     * offset where the bug shows.
     */
    // Skipped only when WGW_TEST_TZ is set, which means someone is deliberately
    // cross-checking another offset rather than running the default suite.
    it.skipIf(Boolean(process.env.WGW_TEST_TZ))(
      'defaults to running these tests somewhere the bug would actually show',
      () => {
        // If this fails, the default has drifted back to UTC and every assertion below
        // is vacuous - the same failure mode as the guard this replaced.
        expect(new Date('2026-09-01').getTimezoneOffset()).toBeGreaterThan(0);
        expect(new Date('2026-09-01').getDate()).toBe(31);
      },
    );

    it('starts at the date it was given, not the day before', () => {
      // The single most visible symptom: west of UTC, the trip's own start date was
      // missing from its calendar and a day before the trip appeared instead.
      const dates = getDatesBetween('2026-09-01', '2026-09-03');

      expect(dates[0]).toBe('2026-09-01');
      expect(dates).toEqual(['2026-09-01', '2026-09-02', '2026-09-03']);
    });

    it('does not shift a range that crosses a month boundary', () => {
      expect(getDatesBetween('2026-08-31', '2026-09-01')).toEqual(['2026-08-31', '2026-09-01']);
    });

    it('does not shift a range that crosses a year boundary', () => {
      expect(getDatesBetween('2026-12-31', '2027-01-01')).toEqual(['2026-12-31', '2027-01-01']);
    });

    it('does not shift across a daylight-saving change', () => {
      // US clocks go forward on 8 March 2026, so this range contains a 23-hour day.
      // Stepping by 24 hours through local time would skip or repeat a date.
      expect(getDatesBetween('2026-03-07', '2026-03-10')).toEqual([
        '2026-03-07',
        '2026-03-08',
        '2026-03-09',
        '2026-03-10',
      ]);
    });

    it('does not shift across the autumn daylight-saving change either', () => {
      // 1 November 2026: a 25-hour day.
      expect(getDatesBetween('2026-10-31', '2026-11-02')).toEqual([
        '2026-10-31',
        '2026-11-01',
        '2026-11-02',
      ]);
    });

    it('gives nothing for a date that does not exist', () => {
      // Date.UTC rolls 31 February forward to 3 March rather than rejecting it.
      expect(getDatesBetween('2026-02-31', '2026-03-05')).toEqual([]);
      expect(getDatesBetween('2026-13-01', '2026-13-05')).toEqual([]);
    });

    it('gives nothing for a string that is not a date', () => {
      expect(getDatesBetween('not-a-date', '2026-09-02')).toEqual([]);
      expect(getDatesBetween('2026-9-1', '2026-09-02')).toEqual([]);
      expect(getDatesBetween('', '')).toEqual([]);
    });
  });
});

describe('getAvailabilityCount', () => {
  it('gives every date in the range a key, including dates nobody picked', () => {
    const result = getAvailabilityCount(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }),
    );

    expect(Object.keys(result)).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ]);
    expect(result['2026-09-01']).toEqual([]);
    expect(result['2026-09-02']).toEqual(['Ada']);
  });

  it('lists every participant available on a date', () => {
    const result = getAvailabilityCount(
      trip({
        participants: [
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03'] },
          { name: 'Bo', availableDates: ['2026-09-03'] },
        ],
      }),
    );

    expect(result['2026-09-02']).toEqual(['Ada']);
    expect(result['2026-09-03']).toEqual(['Ada', 'Bo']);
  });

  it('ignores availability outside the trip range', () => {
    const result = getAvailabilityCount(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-12-24'] }] }),
    );

    expect(result['2026-12-24']).toBeUndefined();
  });
});

describe('generateTripId', () => {
  it('produces 32 hex characters', () => {
    expect(generateTripId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('does not repeat across many calls', () => {
    const ids = new Set(Array.from({ length: 500 }, generateTripId));
    expect(ids.size).toBe(500);
  });

  it('draws from crypto rather than Math.random', () => {
    // The trip link is the product's only credential, so this is a security property,
    // not a style preference.
    const spy = vi.spyOn(globalThis.crypto, 'getRandomValues');
    generateTripId();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('the API client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getTrip', () => {
    it('returns the trip on success', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await expect(getTrip('abc123')).resolves.toMatchObject({ id: 'abc123', name: 'Alps' });
      expect(fetchMock).toHaveBeenCalledWith('/api/trips/abc123', expect.anything());
    });

    it('returns null for a trip that does not exist', async () => {
      fetchMock.mockResolvedValue(reply({ error: 'Not found.' }, 404));
      await expect(getTrip('nope')).resolves.toBeNull();
    });

    it('throws rather than returning null when the server fails', async () => {
      // The distinction matters: null renders "Trip not found", which would be a lie.
      fetchMock.mockResolvedValue(reply({ error: 'boom' }, 500));
      await expect(getTrip('abc123')).rejects.toThrow(TripApiError);
    });

    it('throws when the network is unreachable', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getTrip('abc123')).rejects.toThrow(/Could not reach the trip service/);
    });

    it('throws a readable error when the response is not JSON', async () => {
      fetchMock.mockResolvedValue(reply('<!doctype html><html></html>', 200));
      await expect(getTrip('abc123')).rejects.toThrow(/non-JSON response/);
    });

    it('percent-encodes the id', async () => {
      fetchMock.mockResolvedValue(reply({ error: 'Not found.' }, 404));
      await getTrip('a b/c');
      expect(fetchMock).toHaveBeenCalledWith('/api/trips/a%20b%2Fc', expect.anything());
    });
  });

  describe('saveTrip', () => {
    it('posts only the trip fields, never participants', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await saveTrip(trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }));

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/trips');
      expect(init.method).toBe('POST');
      expect(JSON.parse(init.body)).toEqual({
        id: 'abc123',
        name: 'Alps',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
      });
    });

    it('surfaces the server error message', async () => {
      fetchMock.mockResolvedValue(reply({ error: 'startDate must not be after endDate.' }, 400));
      await expect(saveTrip(trip())).rejects.toThrow('startDate must not be after endDate.');
    });

    it('carries the status on the error', async () => {
      fetchMock.mockResolvedValue(reply({ error: 'nope' }, 400));
      await expect(saveTrip(trip())).rejects.toMatchObject({ status: 400 });
    });
  });

  describe('addParticipant', () => {
    it('PUTs the name and dates', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await addParticipant('abc123', { name: 'Ada', availableDates: ['2026-09-02'] });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/trips/abc123/participants');
      expect(init.method).toBe('PUT');
      expect(JSON.parse(init.body)).toEqual({ name: 'Ada', availableDates: ['2026-09-02'] });
    });

    it('sets a JSON content type when there is a body', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await addParticipant('abc123', { name: 'Ada', availableDates: [] });
      expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
        'content-type': 'application/json',
      });
    });
  });

  describe('updateParticipantName', () => {
    it('PATCHes both names', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await updateParticipantName('abc123', 'Ada', 'Bo');

      const [, init] = fetchMock.mock.calls[0];
      expect(init.method).toBe('PATCH');
      expect(JSON.parse(init.body)).toEqual({ oldName: 'Ada', newName: 'Bo' });
    });

    it('reports a name clash', async () => {
      fetchMock.mockResolvedValue(
        reply({ error: 'Someone on this trip already uses that name.' }, 409),
      );
      await expect(updateParticipantName('abc123', 'Ada', 'Bo')).rejects.toMatchObject({
        status: 409,
      });
    });
  });

  describe('removeParticipant', () => {
    it('DELETEs with the name in the query string', async () => {
      fetchMock.mockResolvedValue(reply(trip()));
      await removeParticipant('abc123', 'Ada Lovelace');

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/trips/abc123/participants?name=Ada%20Lovelace');
      expect(init.method).toBe('DELETE');
    });
  });
});
