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

  it('never edits availability when read-only', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate, readOnly: true })} />);

    fireEvent.mouseDown(dayCell('3'));
    fireEvent.click(dayCell('3'));
    fireEvent.keyDown(dayCell('3'), { key: 'Enter' });

    expect(onToggleDate).not.toHaveBeenCalled();
    // Deliberately NOT disabled any more: a disabled button cannot be focused or tapped,
    // which is what made "who is free" unreachable by keyboard and on a phone.
    expect(dayCell('3')).toBeEnabled();
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

  it('gives every cell a target of at least 44px', () => {
    // jsdom has no layout, so this asserts the utility that guarantees the floor rather
    // than a measured box. The measured result - 44.7px at 375px wide, 44px at 320px -
    // is recorded in the PR that introduced it.
    render(<AvailabilityCalendar {...props()} />);

    for (const cell of screen.getAllByRole('button')) {
      expect(cell.className).toContain('min-h-11');
      expect(cell.className).toContain('min-w-11');
    }
  });

  it('makes the availability count legible on every heat level, not only a unanimous one', () => {
    // The count used to fall back to text-muted-foreground unless heatLevel was 'high',
    // which only happens when literally everyone is free - measured 1.8:1 on a 4-of-5
    // fill, against 5.7:1 after this change.
    render(
      <AvailabilityCalendar
        {...props({
          readOnly: true,
          participants: [
            { name: 'Ada', availableDates: ['2026-09-03'] },
            { name: 'Bo', availableDates: ['2026-09-03'] },
            { name: 'Cy', availableDates: [] },
          ],
          availability: { '2026-09-03': ['Ada', 'Bo'] },
          totalParticipants: 3,
        })}
      />,
    );

    const badge = [...dayCell('3').querySelectorAll('span')][1];
    expect(badge).toHaveTextContent('2');
    expect(badge?.className).toContain('text-foreground/80');
    expect(badge?.className).not.toContain('text-muted-foreground');
  });

  describe('who is free, in read-only mode', () => {
    const group = () =>
      props({
        readOnly: true,
        participants: [
          { name: 'Ada', availableDates: ['2026-09-03'] },
          { name: 'Bo', availableDates: ['2026-09-03'] },
          { name: 'Cy', availableDates: ['2026-09-04'] },
        ],
        availability: { '2026-09-03': ['Ada', 'Bo'], '2026-09-04': ['Cy'] },
        totalParticipants: 3,
      });

    it('replaces the hover tooltip entirely', () => {
      const { container } = render(<AvailabilityCalendar {...group()} />);
      // The old mechanism was a hover-only absolute div inside each cell.
      expect(container.querySelector('button[data-date] div.absolute')).toBeNull();
    });

    it('prompts for the interaction rather than hiding it', () => {
      render(<AvailabilityCalendar {...group()} />);
      expect(screen.getByTestId('availability-detail')).toHaveTextContent(/Tap a day to see who/i);
    });

    it('names who is free when a day is tapped', () => {
      render(<AvailabilityCalendar {...group()} />);

      fireEvent.click(dayCell('3'));

      expect(screen.getByTestId('availability-detail')).toHaveTextContent('Ada, Bo');
    });

    it('answers by keyboard too', () => {
      render(<AvailabilityCalendar {...group()} />);

      fireEvent.keyDown(dayCell('4'), { key: 'Enter' });

      expect(screen.getByTestId('availability-detail')).toHaveTextContent('Cy');
    });

    it('says so for a day nobody picked', () => {
      render(<AvailabilityCalendar {...group()} />);

      fireEvent.click(dayCell('6'));

      expect(screen.getByTestId('availability-detail')).toHaveTextContent(/nobody is free/i);
    });

    it('tapping the same day again closes it', () => {
      render(<AvailabilityCalendar {...group()} />);

      fireEvent.click(dayCell('3'));
      fireEvent.click(dayCell('3'));

      expect(screen.getByTestId('availability-detail')).toHaveTextContent(/Tap a day to see who/i);
    });

    it('honours the participant filter', () => {
      render(<AvailabilityCalendar {...group()} selectedParticipants={['Ada']} />);

      fireEvent.click(dayCell('3'));

      const panel = screen.getByTestId('availability-detail');
      expect(panel).toHaveTextContent('Ada');
      expect(panel).not.toHaveTextContent('Bo');
    });

    it('announces changes without stealing focus', () => {
      render(<AvailabilityCalendar {...group()} />);
      expect(screen.getByTestId('availability-detail')).toHaveAttribute('aria-live', 'polite');
    });

    it('puts the count in the cell name, which aria-label would otherwise hide', () => {
      render(<AvailabilityCalendar {...group()} />);
      expect(dayCell('3')).toHaveAccessibleName('Thursday 3 September 2026, 2 available');
    });
  });

  it('toggles a date on a touch tap', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.touchStart(dayCell('3'));

    expect(onToggleDate).toHaveBeenCalledWith('2026-09-03');
  });

  /**
   * PRODUCT.md records "must work on a phone" as non-negotiable, and the UI tells
   * people to click and drag. A touch drag cannot use mouseenter - no such event fires
   * while a finger moves - so each move is resolved through elementFromPoint to
   * whatever cell sits under the finger.
   */
  it('extends the selection across a touch drag', () => {
    const onToggleDate = vi.fn();
    const { container } = render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    const cells = ['2', '3', '4'].map(dayCell);
    // jsdom has no layout, so elementFromPoint cannot resolve a real position. Stand in
    // for it by mapping each synthetic coordinate to the cell the test means.
    const byPoint = new Map<number, Element>([
      [10, cells[1]],
      [20, cells[2]],
    ]);
    const spy = vi
      .spyOn(document, 'elementFromPoint')
      .mockImplementation((x: number) => byPoint.get(x) ?? null);

    fireEvent.touchStart(cells[0]);
    const grid = container.firstElementChild!;
    fireEvent.touchMove(grid, { touches: [{ clientX: 10, clientY: 0 }] });
    fireEvent.touchMove(grid, { touches: [{ clientX: 20, clientY: 0 }] });

    expect(onToggleDate.mock.calls.map(([d]) => d)).toEqual([
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
    ]);

    spy.mockRestore();
  });

  it('stops extending after the finger lifts', () => {
    const onToggleDate = vi.fn();
    const { container } = render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    const cells = ['2', '3'].map(dayCell);
    const spy = vi.spyOn(document, 'elementFromPoint').mockReturnValue(cells[1]);

    fireEvent.touchStart(cells[0]);
    const grid = container.firstElementChild!;
    fireEvent.touchEnd(grid);
    onToggleDate.mockClear();
    fireEvent.touchMove(grid, { touches: [{ clientX: 10, clientY: 0 }] });

    expect(onToggleDate).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('ignores touch entirely when read-only', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate, readOnly: true })} />);

    fireEvent.touchStart(dayCell('3'));

    expect(onToggleDate).not.toHaveBeenCalled();
  });

  it('can be operated with the keyboard', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.keyDown(dayCell('3'), { key: 'Enter' });
    fireEvent.keyDown(dayCell('4'), { key: ' ' });

    expect(onToggleDate.mock.calls.map(([d]) => d)).toEqual(['2026-09-03', '2026-09-04']);
  });

  it('does not toggle on other keys', () => {
    const onToggleDate = vi.fn();
    render(<AvailabilityCalendar {...props({ onToggleDate })} />);

    fireEvent.keyDown(dayCell('3'), { key: 'Tab' });
    fireEvent.keyDown(dayCell('3'), { key: 'a' });

    expect(onToggleDate).not.toHaveBeenCalled();
  });

  it('tells assistive technology whether a date is selected', () => {
    render(<AvailabilityCalendar {...props({ selectedDates: ['2026-09-03'] })} />);

    expect(dayCell('3')).toHaveAttribute('aria-pressed', 'true');
    expect(dayCell('4')).toHaveAttribute('aria-pressed', 'false');
  });

  it('names each date for a screen reader rather than leaving a bare number', () => {
    render(<AvailabilityCalendar {...props()} />);

    expect(dayCell('3')).toHaveAccessibleName('Thursday 3 September 2026');
  });
});
