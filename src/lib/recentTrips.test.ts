import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  forgetAllTrips,
  forgetTrip,
  getRecentTrips,
  rememberTrip,
} from './recentTrips';

const KEY = 'wegowhen.recentTrips.v1';

const trip = (id: string, name = `Trip ${id}`) => ({
  id,
  name,
  startDate: '2026-07-01',
  endDate: '2026-07-10',
});

describe('recentTrips', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts empty', () => {
    expect(getRecentTrips()).toEqual([]);
  });

  it('records a trip with the fields a list row needs, and nothing else', () => {
    rememberTrip(trip('a'), 'creator', new Date('2026-08-01T10:00:00Z'));

    expect(getRecentTrips()).toEqual([
      {
        id: 'a',
        name: 'Trip a',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        role: 'creator',
        lastOpenedAt: '2026-08-01T10:00:00.000Z',
      },
    ]);
  });

  it('does not store participants, so this can never answer a read for trip data', () => {
    rememberTrip(
      { ...trip('a'), participants: [{ name: 'Ada', availableDates: ['2026-07-02'] }] } as never,
      'creator',
    );

    expect(localStorage.getItem(KEY)).not.toContain('Ada');
    expect(localStorage.getItem(KEY)).not.toContain('participants');
  });

  it('defaults to visitor for a trip opened from someone else’s link', () => {
    rememberTrip(trip('a'));
    expect(getRecentTrips()[0].role).toBe('visitor');
  });

  it('orders most recently opened first', () => {
    rememberTrip(trip('old'), 'visitor', new Date('2026-08-01T10:00:00Z'));
    rememberTrip(trip('new'), 'visitor', new Date('2026-08-02T10:00:00Z'));

    expect(getRecentTrips().map((t) => t.id)).toEqual(['new', 'old']);
  });

  it('refreshes name, dates and timestamp instead of duplicating a row', () => {
    rememberTrip(trip('a', 'Old name'), 'creator', new Date('2026-08-01T10:00:00Z'));
    rememberTrip(
      { id: 'a', name: 'New name', startDate: '2026-09-01', endDate: '2026-09-05' },
      'visitor',
      new Date('2026-08-05T10:00:00Z'),
    );

    const entries = getRecentTrips();
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('New name');
    expect(entries[0].startDate).toBe('2026-09-01');
    expect(entries[0].lastOpenedAt).toBe('2026-08-05T10:00:00.000Z');
  });

  it('keeps the creator badge when the creator re-opens their own link', () => {
    rememberTrip(trip('a'), 'creator', new Date('2026-08-01T10:00:00Z'));
    rememberTrip(trip('a'), 'visitor', new Date('2026-08-02T10:00:00Z'));

    expect(getRecentTrips()[0].role).toBe('creator');
  });

  it('caps the list at 25 entries, dropping the oldest', () => {
    for (let i = 0; i < 30; i += 1) {
      const day = String(i + 1).padStart(2, '0');
      rememberTrip(trip(`t${i}`), 'visitor', new Date(`2026-08-${day}T10:00:00Z`));
    }

    const entries = getRecentTrips();
    expect(entries).toHaveLength(25);
    expect(entries[0].id).toBe('t29');
    expect(entries.map((e) => e.id)).not.toContain('t0');
  });

  it('ignores a trip with no id', () => {
    rememberTrip({ ...trip(''), id: '' });
    expect(getRecentTrips()).toEqual([]);
  });

  it('forgets one trip and leaves the rest', () => {
    rememberTrip(trip('a'), 'visitor', new Date('2026-08-01T10:00:00Z'));
    rememberTrip(trip('b'), 'visitor', new Date('2026-08-02T10:00:00Z'));

    forgetTrip('a');

    expect(getRecentTrips().map((t) => t.id)).toEqual(['b']);
  });

  it('forgets everything', () => {
    rememberTrip(trip('a'));
    forgetAllTrips();
    expect(getRecentTrips()).toEqual([]);
  });

  it('returns an empty list for stored junk rather than throwing', () => {
    localStorage.setItem(KEY, 'not json at all');
    expect(getRecentTrips()).toEqual([]);
  });

  it('returns an empty list when the stored value is not an array', () => {
    localStorage.setItem(KEY, '{"id":"a"}');
    expect(getRecentTrips()).toEqual([]);
  });

  it('drops malformed entries and keeps the well-formed ones', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify([
        { id: 'good', name: 'Good', startDate: '2026-07-01', endDate: '2026-07-10', role: 'visitor', lastOpenedAt: '2026-08-01T10:00:00.000Z' },
        { id: 'no-role', name: 'x', startDate: 'a', endDate: 'b', lastOpenedAt: 'c' },
        { id: 'bad-role', name: 'x', startDate: 'a', endDate: 'b', role: 'owner', lastOpenedAt: 'c' },
        { name: 'no id', startDate: 'a', endDate: 'b', role: 'visitor', lastOpenedAt: 'c' },
        null,
        'a string',
      ]),
    );

    expect(getRecentTrips().map((t) => t.id)).toEqual(['good']);
  });

  it('survives a browser that throws on getItem, such as one blocking site data', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('The operation is insecure.');
    });

    expect(getRecentTrips()).toEqual([]);
  });

  it('survives a browser that throws on setItem, such as Safari private mode', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => rememberTrip(trip('a'), 'creator')).not.toThrow();
    expect(() => forgetTrip('a')).not.toThrow();
  });

  it('survives a browser that throws on removeItem', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('The operation is insecure.');
    });

    expect(() => forgetAllTrips()).not.toThrow();
  });
});
