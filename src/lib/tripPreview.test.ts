import { describe, it, expect } from 'vitest';
import { formatDateWindow, tripPreview } from './tripPreview';

describe('formatDateWindow', () => {
  it('names the month once for a trip inside one month', () => {
    expect(formatDateWindow('2027-02-01', '2027-02-28')).toBe('Feb 1 – 28, 2027');
  });

  it('names both months for a trip across two', () => {
    expect(formatDateWindow('2027-02-28', '2027-03-03')).toBe('Feb 28 – Mar 3, 2027');
  });

  it('names both years for a trip across new year', () => {
    expect(formatDateWindow('2026-12-28', '2027-01-03')).toBe('Dec 28, 2026 – Jan 3, 2027');
  });

  it('gives a one-day trip as a single date', () => {
    expect(formatDateWindow('2027-02-12', '2027-02-12')).toBe('Feb 12, 2027');
  });

  it('reads the calendar day the string names, whatever the timezone', () => {
    // The suite runs in America/New_York; `new Date('2026-09-01')` there is 31 August.
    expect(formatDateWindow('2026-09-01', '2026-09-01')).toBe('Sep 1, 2026');
  });

  it('refuses anything that is not a real, ordered range', () => {
    expect(formatDateWindow('2027-02-31', '2027-03-02')).toBeNull();
    expect(formatDateWindow('2027-3-1', '2027-03-02')).toBeNull();
    expect(formatDateWindow('2027-03-05', '2027-03-01')).toBeNull();
    expect(formatDateWindow('', '')).toBeNull();
  });
});

describe('tripPreview', () => {
  it('puts the date window in the title, and the invitation link in url', () => {
    expect(tripPreview({ id: 'abc123', startDate: '2027-02-01', endDate: '2027-02-28' })).toEqual({
      title: "Mark the days you're free: Feb 1 – 28, 2027 | WeGoWhen",
      description: expect.stringMatching(/Tap the days you can make it/),
      url: 'https://wegowhen.com/trip/abc123',
    });
  });

  it('carries nothing about the trip but its dates', () => {
    // The signature takes no name, and this pins that it stays that way: the preview is
    // fetched by the messaging app's servers, not only by the people in the chat.
    const preview = tripPreview({ id: 'abc123', startDate: '2027-02-01', endDate: '2027-02-28' })!;
    expect(Object.keys(preview).sort()).toEqual(['description', 'title', 'url']);
  });

  it('keeps title and description to lengths an unfurler shows whole', () => {
    const preview = tripPreview({ id: 'x', startDate: '2026-12-28', endDate: '2027-01-03' })!;
    expect(preview.title.length).toBeLessThanOrEqual(70);
    expect(preview.description.length).toBeLessThanOrEqual(160);
  });

  it('gives no preview for dates it cannot read, so the generic head is kept', () => {
    expect(tripPreview({ id: 'x', startDate: 'junk', endDate: '2027-01-03' })).toBeNull();
  });
});
