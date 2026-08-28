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

  it('does not shift dates in a timezone behind UTC', () => {
    // The implementation normalises to UTC midnight precisely so that a machine in,
    // say, UTC-10 does not report the previous day. Guard that intent.
    const original = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = () => 600; // UTC-10
    try {
      expect(getDatesBetween('2026-09-01', '2026-09-02')).toEqual(['2026-09-01', '2026-09-02']);
    } finally {
      Date.prototype.getTimezoneOffset = original;
    }
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
