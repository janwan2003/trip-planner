import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AvailabilityCalendar } from './AvailabilityCalendar';

const props = (over: Partial<Parameters<typeof AvailabilityCalendar>[0]> = {}) => ({
  startDate: '2026-09-01',
  endDate: '2026-09-07',
  selectedDates: [] as string[],
  onToggleDate: vi.fn(),
  ...over,
});

/** The day cells are the buttons whose whole label starts with the day number. */
const dayCell = (day: string) =>
  screen.getAllByRole('button').find((b) => b.textContent?.trim().startsWith(day))!;

describe('AvailabilityCalendar', () => {
  it('renders one cell per day in the range', () => {
    render(<AvailabilityCalendar {...props()} />);

    // Sep 1-7 is seven days. Leading blanks are rendered as divs, not buttons.
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('labels the days of the week', () => {
    render(<AvailabilityCalendar {...props()} />);

    for (const day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
  });

  it('spans more than one month when the range does', () => {
    render(<AvailabilityCalendar {...props({ startDate: '2026-08-30', endDate: '2026-09-02' })} />);

    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText(/August 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/September 2026/i)).toBeInTheDocument();
  });

  it('toggles a date when a cell is pressed', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.mouseDown(dayCell('3'));

    expect(onToggleDate).toHaveBeenCalledWith('2026-09-03');
  });

  it('extends the selection across a drag', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.mouseDown(dayCell('2'));
    fireEvent.mouseEnter(dayCell('3'));
    fireEvent.mouseEnter(dayCell('4'));

    expect(onToggleDate.mock.calls.map(([d]) => d)).toEqual([
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);
  });

  it('stops extending once the drag ends', () => {
    const onToggleDate = vi.fn();
    const { container } = render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.mouseDown(dayCell('2'));
    // mouseup is handled on the calendar container, not on window.
    fireEvent.mouseUp(container.firstElementChild!);
    onToggleDate.mockClear();
    fireEvent.mouseEnter(dayCell('3'));

    expect(onToggleDate).not.toHaveBeenCalled();
  });

  it('also ends the drag when the pointer leaves the calendar', () => {
    const onToggleDate = vi.fn();
    const { container } = render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.mouseDown(dayCell('2'));
    fireEvent.mouseLeave(container.firstElementChild!);
    onToggleDate.mockClear();
    fireEvent.mouseEnter(dayCell('3'));

    expect(onToggleDate).not.toHaveBeenCalled();
  });

  it('does not toggle the same date twice within one drag', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.mouseDown(dayCell('2'));
    fireEvent.mouseEnter(dayCell('3'));
    fireEvent.mouseEnter(dayCell('3'));

    expect(onToggleDate).toHaveBeenCalledTimes(2);
  });

  it('ignores interaction when read-only', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate, readOnly: true })} />);

    fireEvent.mouseDown(dayCell('3'));

    expect(onToggleDate).not.toHaveBeenCalled();
    expect(dayCell('3')).toBeDisabled();
  });

  it('shows how many people are free on a date in read-only mode', () => {
    render(
      <AvailabilityCalendar
        {...props({
          readOnly: true,
          participants: [
            { name: 'Ada', availableDates: ['2026-09-03'] },
            { name: 'Bo', availableDates: ['2026-09-03'] },
          ],
          availability: { '2026-09-03': ['Ada', 'Bo'] },
          totalParticipants: 2,
        })}
      />,
    );

    expect(dayCell('3').textContent).toContain('2');
  });

  it('counts only the filtered subset when participants are filtered', () => {
    render(
      <AvailabilityCalendar
        {...props({
          readOnly: true,
          participants: [
            { name: 'Ada', availableDates: ['2026-09-03'] },
            { name: 'Bo', availableDates: ['2026-09-03'] },
          ],
          selectedParticipants: ['Ada'],
          availability: { '2026-09-03': ['Ada', 'Bo'] },
          totalParticipants: 2,
        })}
      />,
    );

    expect(dayCell('3').textContent).toContain('1');
  });

  /**
   * Regression guard for a known defect rather than a passing feature.
   *
   * Selection is wired to mousedown/mouseenter only. On a phone, a tap synthesises a
   * mousedown so single days still work, but dragging across days does not, because no
   * mouseenter fires during a touch drag. PRODUCT.md records "must work on a phone" as
   * non-negotiable and the UI tells people to "click and drag", so this is a
   * contradiction the codebase should not lose track of.
   *
   * When touch support lands, this test should fail — and then be rewritten to assert
   * that a touch drag selects a range.
   */
  it('does not yet respond to touch events (known gap)', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    const cell = dayCell('3');
    fireEvent.touchStart(cell);
    fireEvent.touchEnd(cell);

    expect(onToggleDate).not.toHaveBeenCalled();
  });
});
