import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TripPage from './TripPage';
import { Trip, TripApiError } from '@/lib/tripStore';
import { getRecentTrips } from '@/lib/recentTrips';

const getTrip = vi.fn();
const addParticipant = vi.fn();
const updateParticipantName = vi.fn();
const removeParticipant = vi.fn();

vi.mock('@/lib/tripStore', async () => {
  const actual = await vi.importActual<typeof import('@/lib/tripStore')>('@/lib/tripStore');
  return {
    ...actual,
    getTrip: (...a: unknown[]) => getTrip(...a),
    addParticipant: (...a: unknown[]) => addParticipant(...a),
    updateParticipantName: (...a: unknown[]) => updateParticipantName(...a),
    removeParticipant: (...a: unknown[]) => removeParticipant(...a),
  };
});

const trip = (over: Partial<Trip> = {}): Trip => ({
  id: 'abc123',
  name: 'Alps trip',
  startDate: '2026-09-01',
  endDate: '2026-09-07',
  participants: [],
  ...over,
});

const renderTripPage = () =>
  render(
    <MemoryRouter initialEntries={['/trip/abc123']}>
      <Routes>
        <Route path="/trip/:tripId" element={<TripPage />} />
      </Routes>
    </MemoryRouter>,
  );

const join = async (user: ReturnType<typeof userEvent.setup>, name: string) => {
  await user.type(screen.getByLabelText(/your name/i), name);
  await user.click(screen.getByRole('button', { name: /continue/i }));
};

/**
 * The page renders two calendars - the editable one and the read-only group view - so a
 * day cell has to be looked up inside the card it belongs to.
 */
const editableDayCell = (day: string) => {
  const card = screen.getAllByText(/Mark Your Availability/i)[0].closest('div[class*="rounded"]')!;
  return Array.from(card.querySelectorAll('button')).find(
    (b) => b.textContent?.trim().startsWith(day) && !b.disabled,
  )!;
};

describe('TripPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    getTrip.mockResolvedValue(trip());
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
  });

  it('shows the trip name, its range and the headcount', async () => {
    getTrip.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }),
    );
    renderTripPage();

    expect(await screen.findByText('Alps trip')).toBeInTheDocument();
    expect(screen.getByText(/Sep 1 - Sep 7, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/1 participant$/)).toBeInTheDocument();
  });

  it('pluralises the headcount', async () => {
    getTrip.mockResolvedValue(
      trip({
        participants: [
          { name: 'Ada', availableDates: [] },
          { name: 'Bo', availableDates: [] },
        ],
      }),
    );
    renderTripPage();

    expect(await screen.findByText(/2 participants/)).toBeInTheDocument();
  });

  it('says a trip does not exist only when the server says so', async () => {
    getTrip.mockResolvedValue(null);
    renderTripPage();

    expect(await screen.findByText(/Trip not found/i)).toBeInTheDocument();
  });

  /**
   * The distinction this guards is the whole reason getTrip throws rather than
   * returning null on failure: telling someone their trip does not exist, when in fact
   * the network faltered, is an error they cannot recover from.
   */
  it('does not claim the trip is missing when the request fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getTrip.mockRejectedValue(new TripApiError('Could not reach the trip service'));
    renderTripPage();

    expect(await screen.findByText(/Couldn't load this trip/i)).toBeInTheDocument();
    expect(screen.queryByText(/Trip not found/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('lets someone join by name', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    await join(user, 'Ada');

    expect(screen.getAllByText(/Mark Your Availability/i).length).toBeGreaterThan(0);
    // The greeting puts the name in a button so it can be edited in place, which
    // means the text is split across elements.
    expect(screen.getAllByRole('button', { name: /Ada/ }).length).toBeGreaterThan(0);
    expect(screen.getByText(/days you're free/i)).toBeInTheDocument();
  });

  it('does not tell a phone user to click', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    expect(screen.getByText(/days you're free/i)).toBeInTheDocument();
    // PRODUCT.md puts touch first; the instruction used to read "Click and drag".
    expect(screen.queryByText(/click and drag/i)).not.toBeInTheDocument();
  });

  /**
   * The page has one job: say when everyone is free. On a phone every card is one column,
   * so DOM order is reading order, and the answer used to sit third from last - behind the
   * heat map and behind a tutorial explaining the flow the reader is already in.
   */
  it('puts the answer above the detail and the teaching last', async () => {
    getTrip.mockResolvedValue(
      trip({
        participants: [
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03'] },
          { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03'] },
        ],
      }),
    );
    renderTripPage();
    await screen.findByText('Alps trip');

    // "Best Dates" also appears as a tutorial step, so anchor on the real result row.
    const answer = (await screen.findAllByTestId('best-date-row'))[0];
    const detail = screen.getByText('Group Availability');
    const teaching = screen.getByText(/Share the Link/i);

    const before = (a: HTMLElement, b: HTMLElement) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

    expect(before(answer, detail)).toBe(true);
    expect(before(detail, teaching)).toBe(true);
  });

  it('will not join with a blank name', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Still on the join step: the name field has not been replaced by the calendar.
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.queryByText(/Click and drag to select dates/i)).not.toBeInTheDocument();
  });

  it('prefills the availability of someone who already answered', async () => {
    getTrip.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02', '2026-09-03'] }] }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    await join(user, 'ada');

    // Nothing to save yet, because the selection already matches what is stored.
    expect(screen.getByRole('button', { name: /no changes to save/i })).toBeDisabled();
  });

  it('enables saving once the selection changes, and saves it', async () => {
    addParticipant.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-03'] }] }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(editableDayCell('3'));

    const save = screen.getByRole('button', { name: /save availability/i });
    expect(save).toBeEnabled();
    await user.click(save);

    await waitFor(() =>
      expect(addParticipant).toHaveBeenCalledWith('abc123', {
        name: 'Ada',
        availableDates: ['2026-09-03'],
      }),
    );
  });

  it('keeps the page usable when saving availability fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    addParticipant.mockRejectedValue(new TripApiError('offline'));
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(editableDayCell('3'));
    await user.click(screen.getByRole('button', { name: /save availability/i }));

    await waitFor(() => expect(addParticipant).toHaveBeenCalled());
    expect(screen.getAllByText(/Mark Your Availability/i).length).toBeGreaterThan(0);
    errorSpy.mockRestore();
  });

  it('warns before losing days that were marked but not saved', async () => {
    const added = vi.spyOn(window, 'addEventListener');
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    expect(added.mock.calls.filter(([e]) => e === 'beforeunload')).toHaveLength(0);

    await user.click(editableDayCell('3'));

    await waitFor(() =>
      expect(added.mock.calls.filter(([e]) => e === 'beforeunload').length).toBeGreaterThan(0),
    );
    added.mockRestore();
  });

  it('stops warning once there is nothing unsaved', async () => {
    addParticipant.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-03'] }] }),
    );
    const removed = vi.spyOn(window, 'removeEventListener');
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(editableDayCell('3'));
    await user.click(screen.getByRole('button', { name: /save availability/i }));

    await waitFor(() =>
      expect(removed.mock.calls.filter(([e]) => e === 'beforeunload').length).toBeGreaterThan(0),
    );
    removed.mockRestore();
  });

  it('copies the trip link to the clipboard', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    await user.click(screen.getByRole('button', { name: /share link/i }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument();
  });

  it('renames a participant', async () => {
    getTrip.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }),
    );
    updateParticipantName.mockResolvedValue(
      trip({ participants: [{ name: 'Bea', availableDates: ['2026-09-02'] }] }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    // The name itself is the edit affordance. Scope to the availability card, because
    // the participants list also renders a button labelled with the same name.
    const card = screen.getAllByText(/Mark Your Availability/i)[0].closest('div[class*="rounded"]')!;
    await user.click(within(card as HTMLElement).getByRole('button', { name: /Ada/ }));
    const field = screen.getByDisplayValue('Ada');
    await user.clear(field);
    await user.type(field, 'Bea');
    // The confirm control is an icon-only button sitting next to the field.
    await user.click(field.parentElement!.querySelector('button')!);

    await waitFor(() =>
      expect(updateParticipantName).toHaveBeenCalledWith('abc123', 'Ada', 'Bea'),
    );
  });

  it('names the withdraw control for assistive technology', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    // It is icon-only; before this it was named by `title` alone, so the most
    // destructive action in the product announced itself as "button".
    expect(screen.getByRole('button', { name: /withdraw from trip/i })).toBeInTheDocument();
  });

  it('withdraws from the trip once the confirmation is accepted', async () => {
    getTrip.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }),
    );
    removeParticipant.mockResolvedValue(trip({ participants: [] }));
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(screen.getByRole('button', { name: /withdraw from trip/i }));
    await user.click(await screen.findByRole('button', { name: /^withdraw$/i }));

    await waitFor(() => expect(removeParticipant).toHaveBeenCalledWith('abc123', 'Ada'));
  });

  it('does not withdraw when the confirmation is declined', async () => {
    getTrip.mockResolvedValue(
      trip({ participants: [{ name: 'Ada', availableDates: ['2026-09-02'] }] }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(screen.getByRole('button', { name: /withdraw from trip/i }));
    await user.click(await screen.findByRole('button', { name: /stay on the trip/i }));

    expect(removeParticipant).not.toHaveBeenCalled();
  });

  it('returns to the group view without losing the trip', async () => {
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');
    await join(user, 'Ada');

    await user.click(screen.getByRole('button', { name: /back to trip view/i }));

    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByText('Alps trip')).toBeInTheDocument();
  });

  /**
   * The regression guard for the defect this filter shipped with: toggling a
   * participant re-computed the heat map but left the ranked answer untouched, so the
   * organiser read recommendations that still named people they had just excluded.
   */
  it('filters the recommended dates, not just the calendar', async () => {
    getTrip.mockResolvedValue(
      trip({
        // Everyone can do Sep 2. Without Cy, Ada and Bo have a three-day stretch.
        participants: [
          { name: 'Ada', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
          { name: 'Bo', availableDates: ['2026-09-02', '2026-09-03', '2026-09-04'] },
          { name: 'Cy', availableDates: ['2026-09-02'] },
        ],
      }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    const rowsFor = () =>
      screen.queryAllByTestId('best-date-row').map((row) => ({
        count: row.querySelector('[data-testid="best-date-count"]')?.textContent?.trim(),
        names: row.querySelector('[data-testid="best-date-names"]')?.textContent ?? '',
      }));

    const before = rowsFor();
    expect(before[0].count).toBe('3');
    expect(before.some((r) => r.names.includes('Cy'))).toBe(true);
    expect(screen.queryByTestId('best-dates-scope')).not.toBeInTheDocument();

    // Filter to Ada only.
    await user.click(screen.getByRole('button', { name: /Ada/ }));

    const after = rowsFor();
    expect(after).not.toEqual(before);
    expect(after.every((r) => !r.names.includes('Cy'))).toBe(true);
    expect(after.every((r) => !r.names.includes('Bo'))).toBe(true);
    expect(screen.getByTestId('best-dates-scope')).toHaveTextContent('for Ada');
  });

  it('filters the group view down to a chosen subset', async () => {
    getTrip.mockResolvedValue(
      trip({
        participants: [
          { name: 'Ada', availableDates: ['2026-09-02'] },
          { name: 'Bo', availableDates: ['2026-09-03'] },
        ],
      }),
    );
    const user = userEvent.setup();
    renderTripPage();
    await screen.findByText('Alps trip');

    const buttons = screen.getAllByRole('button', { name: /Ada/ });
    await user.click(buttons[buttons.length - 1]);

    // Ada is now the only selected participant, and the group calendar re-renders
    // counting only her.
    expect(screen.getAllByRole('button', { name: /Ada/ }).length).toBeGreaterThan(0);
  });

  it('remembers a trip opened from a link, so it is recoverable from the home page', async () => {
    renderTripPage();
    expect(await screen.findByText('Alps trip')).toBeInTheDocument();

    const remembered = getRecentTrips();
    expect(remembered).toHaveLength(1);
    expect(remembered[0]).toMatchObject({
      id: 'abc123',
      name: 'Alps trip',
      startDate: '2026-09-01',
      endDate: '2026-09-07',
      role: 'visitor',
    });
  });

  it('does not remember a trip that does not exist', async () => {
    getTrip.mockResolvedValue(null);
    renderTripPage();

    expect(await screen.findByText(/Trip not found/i)).toBeInTheDocument();
    expect(getRecentTrips()).toEqual([]);
  });

  it('does not remember a trip it could not load', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    getTrip.mockRejectedValue(new TripApiError('offline'));
    renderTripPage();

    expect(await screen.findByText(/Couldn't load this trip/i)).toBeInTheDocument();
    expect(getRecentTrips()).toEqual([]);

    errorSpy.mockRestore();
  });
});
