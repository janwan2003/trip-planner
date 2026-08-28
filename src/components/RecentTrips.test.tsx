import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test/render';
import { RecentTrips } from './RecentTrips';
import { getRecentTrips, rememberTrip } from '@/lib/recentTrips';

describe('RecentTrips', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing for a browser that has never opened a trip', () => {
    const { container } = renderWithRouter(<RecentTrips />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links each remembered trip to its page, most recent first', () => {
    rememberTrip(
      { id: 'aaa', name: 'Alps hike', startDate: '2026-07-01', endDate: '2026-07-10' },
      'creator',
      new Date('2026-08-01T10:00:00Z'),
    );
    rememberTrip(
      { id: 'bbb', name: 'Lisbon weekend', startDate: '2026-09-04', endDate: '2026-09-06' },
      'visitor',
      new Date('2026-08-02T10:00:00Z'),
    );

    renderWithRouter(<RecentTrips />);

    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/trip/bbb', '/trip/aaa']);
    expect(screen.getByText('Alps hike')).toBeInTheDocument();
    expect(screen.getByText('Lisbon weekend')).toBeInTheDocument();
  });

  it('shows the date range so two trips with the same name are tellable apart', () => {
    rememberTrip({ id: 'aaa', name: 'Alps hike', startDate: '2026-07-01', endDate: '2026-07-10' });

    renderWithRouter(<RecentTrips />);

    expect(screen.getByText('Jul 1 - Jul 10, 2026')).toBeInTheDocument();
  });

  it('marks the trips this browser created, and only those', () => {
    rememberTrip(
      { id: 'aaa', name: 'Mine', startDate: '2026-07-01', endDate: '2026-07-10' },
      'creator',
    );
    rememberTrip(
      { id: 'bbb', name: 'Theirs', startDate: '2026-07-01', endDate: '2026-07-10' },
      'visitor',
    );

    renderWithRouter(<RecentTrips />);

    expect(screen.getAllByText('Yours')).toHaveLength(1);
  });

  it('says the list is local, so nobody reads it as an account', () => {
    rememberTrip({ id: 'aaa', name: 'Alps hike', startDate: '2026-07-01', endDate: '2026-07-10' });

    renderWithRouter(<RecentTrips />);

    expect(screen.getByText(/opened in this browser/i)).toBeInTheDocument();
    expect(screen.getByText(/not on our servers/i)).toBeInTheDocument();
  });

  it('removes a trip from the list on request, and from storage', async () => {
    const user = userEvent.setup();
    rememberTrip({ id: 'aaa', name: 'Alps hike', startDate: '2026-07-01', endDate: '2026-07-10' });
    rememberTrip({ id: 'bbb', name: 'Lisbon', startDate: '2026-09-04', endDate: '2026-09-06' });

    renderWithRouter(<RecentTrips />);

    await user.click(screen.getByRole('button', { name: /Remove Alps hike from this list/i }));

    expect(screen.queryByText('Alps hike')).not.toBeInTheDocument();
    expect(screen.getByText('Lisbon')).toBeInTheDocument();
    expect(getRecentTrips().map((t) => t.id)).toEqual(['bbb']);
  });

  it('renders a row whose stored dates are unusable, without the range', () => {
    localStorage.setItem(
      'wegowhen.recentTrips.v1',
      JSON.stringify([
        {
          id: 'aaa',
          name: 'Broken dates',
          startDate: 'not-a-date',
          endDate: 'also-not',
          role: 'visitor',
          lastOpenedAt: '2026-08-01T10:00:00.000Z',
        },
      ]),
    );

    renderWithRouter(<RecentTrips />);

    expect(screen.getByText('Broken dates')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/trip/aaa');
  });

  it('falls back to a placeholder name for an unnamed trip', () => {
    rememberTrip({ id: 'aaa', name: '', startDate: '2026-07-01', endDate: '2026-07-10' });

    renderWithRouter(<RecentTrips />);

    expect(screen.getByText('Untitled trip')).toBeInTheDocument();
  });

  it('names each link for a screen reader, trip first', () => {
    rememberTrip({ id: 'aaa', name: 'Alps hike', startDate: '2026-07-01', endDate: '2026-07-10' });

    renderWithRouter(<RecentTrips />);

    expect(
      screen.getByRole('link', { name: 'Open Alps hike, Jul 1 - Jul 10, 2026' }),
    ).toHaveAttribute('href', '/trip/aaa');
  });

  it('still names a link whose stored dates are unusable', () => {
    localStorage.setItem(
      'wegowhen.recentTrips.v1',
      JSON.stringify([
        {
          id: 'aaa',
          name: 'Broken dates',
          startDate: 'nope',
          endDate: 'nope',
          role: 'visitor',
          lastOpenedAt: '2026-08-01T10:00:00.000Z',
        },
      ]),
    );

    renderWithRouter(<RecentTrips />);

    expect(screen.getByRole('link', { name: 'Open Broken dates' })).toBeInTheDocument();
  });
});
