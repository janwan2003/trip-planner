import { memo, useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getDatesBetween, Participant } from '@/lib/tripStore';
import { getDay, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useFormat } from '@/i18n/format';

interface AvailabilityCalendarProps {
  startDate: string;
  endDate: string;
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  readOnly?: boolean;
  availability?: Record<string, string[]>;
  totalParticipants?: number;
  selectedParticipants?: string[];
  participants?: Participant[];
}

const EMPTY: string[] = [];
const NO_PARTICIPANTS: Participant[] = [];

/**
 * Memoised: the page holds two of these, and during a drag only the editable one's
 * `selectedDates` changes. Without `memo` the read-only group view re-rendered - every
 * cell, every count - on each day the finger crossed.
 */
export const AvailabilityCalendar = memo(function AvailabilityCalendar({
  startDate,
  endDate,
  selectedDates,
  onToggleDate,
  readOnly = false,
  availability,
  totalParticipants = 0,
  selectedParticipants = EMPTY,
  participants = NO_PARTICIPANTS,
}: AvailabilityCalendarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null);
  const draggedDatesRef = useRef<Set<string>>(new Set());
  const { t } = useTranslation();
  const f = useFormat();
  
  const dates = useMemo(() => getDatesBetween(startDate, endDate), [startDate, endDate]);
  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  /**
   * Each day's labels, formatted once per range and language. Formatting ran twice per
   * cell on every render, and on a full-year trip that was most of what a drag step cost.
   */
  const dayLabels = useMemo(() => {
    const labels = new Map<string, { full: string; day: string }>();
    for (const date of dates) {
      labels.set(date, { full: f.date(date, 'full'), day: f.date(date, 'day') });
    }
    return labels;
  }, [dates, f]);

  const usesFilter = readOnly && participants.length > 0;

  /**
   * How many people count as "everyone" for the heat map: the filtered subset in the
   * read-only view (all participants when no filter is set), else the whole trip.
   */
  const activeCount = usesFilter
    ? selectedParticipants.length === 0
      ? participants.length
      : selectedParticipants.length
    : totalParticipants;

  /**
   * People free on each date, computed once per change of inputs. It used to be a
   * `participants.find` plus an `includes` for every active name, three times per cell
   * per render - about 20-40 ms a render on a 365-day trip with 30-50 people.
   */
  const countByDate = useMemo(() => {
    const counts = new Map<string, number>();
    if (usesFilter) {
      const active =
        selectedParticipants.length === 0
          ? participants
          : participants.filter((p) => selectedParticipants.includes(p.name));
      for (const participant of active) {
        for (const date of participant.availableDates) {
          counts.set(date, (counts.get(date) ?? 0) + 1);
        }
      }
    } else if (availability) {
      for (const [date, names] of Object.entries(availability)) {
        counts.set(date, names.length);
      }
    }
    return counts;
  }, [usesFilter, participants, selectedParticipants, availability]);

  const countOn = (date: string) => countByDate.get(date) ?? 0;

  const getHeatLevel = (count: number): 'none' | 'low' | 'medium' | 'high' => {
    if (activeCount === 0) return 'none';
    const ratio = count / activeCount;

    if (ratio === 0) return 'none';
    if (ratio < 0.5) return 'low';
    if (ratio < 1) return 'medium';
    return 'high';
  };

  const gridRef = useRef<HTMLDivElement>(null);

  /**
   * Which day's participant list is currently shown, in read-only mode.
   *
   * This replaces a hover tooltip that was unreachable by everyone the product is built
   * for: it lived on a `disabled` button, so there was no hover on a phone and no focus
   * for a keyboard, and `aria-label` on the cell overrode its contents so a screen reader
   * never heard the names either. The heat map's actual payload - who is free - reached
   * only sighted mouse users.
   */
  const [revealedDate, setRevealedDate] = useState<string | null>(null);

  /** Starts a drag and toggles the date it started on. */
  const beginDrag = useCallback((date: string) => {
    if (readOnly) return;

    setIsDragging(true);
    const isCurrentlySelected = selectedSet.has(date);
    setDragStartValue(!isCurrentlySelected);
    draggedDatesRef.current = new Set([date]);
    onToggleDate(date);
  }, [readOnly, selectedSet, onToggleDate]);

  /** Extends an in-progress drag onto another date, once. */
  const extendDrag = useCallback((date: string) => {
    if (!isDragging || readOnly) return;

    if (!draggedDatesRef.current.has(date)) {
      draggedDatesRef.current.add(date);
      const isCurrentlySelected = selectedSet.has(date);

      if (dragStartValue !== null && isCurrentlySelected !== dragStartValue) {
        onToggleDate(date);
      }
    }
  }, [isDragging, readOnly, selectedSet, dragStartValue, onToggleDate]);

  /**
   * When the last touch happened, so the mouse events a touch synthesises can be ignored.
   *
   * A tap that ends without any `preventDefault` is followed by a compatibility
   * mousedown/mouseup/click on the same element. `beginDrag` had already run on
   * `touchstart`, and that synthetic mousedown ran it a second time - toggling the day
   * straight back off, so a tap looked like it did nothing. Only a press-and-hold
   * appeared to work, because it fires `touchmove`, whose `preventDefault` suppresses
   * the compatibility events.
   */
  const lastTouchAt = useRef(0);

  /** True while any mouse event is still plausibly the echo of a finger. */
  const isTouchEcho = useCallback(() => Date.now() - lastTouchAt.current < 700, []);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragStartValue(null);
    draggedDatesRef.current.clear();
  }, []);

  const endTouch = useCallback(() => {
    lastTouchAt.current = Date.now();
    endDrag();
  }, [endDrag]);

  /** Toggles a single date without starting a drag - used by the keyboard. */
  const toggleOne = useCallback((date: string) => {
    if (readOnly) return;
    onToggleDate(date);
  }, [readOnly, onToggleDate]);

  /**
   * Touch dragging cannot use mouseenter: no such event fires while a finger moves.
   * Instead, each move is resolved to whatever cell is under the finger.
   *
   * The listener is attached natively rather than through React's onTouchMove because
   * it must be non-passive to call preventDefault, which is what stops the page
   * scrolling underneath the gesture. React registers touchmove as passive.
   */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || readOnly || !isDragging) return;

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;

      const under = document.elementFromPoint(touch.clientX, touch.clientY);
      const cell = under?.closest<HTMLElement>('[data-date]');
      if (cell?.dataset.date) {
        // Only prevent the scroll once the gesture is genuinely over the grid, so a
        // finger that strays off the calendar can still scroll the page.
        event.preventDefault();
        extendDrag(cell.dataset.date);
      }
    };

    grid.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => grid.removeEventListener('touchmove', onTouchMove);
  }, [readOnly, isDragging, extendDrag]);

  const namesAvailableOn = useCallback(
    (date: string): string[] => {
      const active =
        selectedParticipants.length === 0 ? participants.map((p) => p.name) : selectedParticipants;

      return active.filter((name) =>
        participants.find((p) => p.name === name)?.availableDates.includes(date),
      );
    },
    [participants, selectedParticipants],
  );

  const weekDays = useMemo(() => f.weekdays(), [f]);

  // Group dates by month. The key is the string's own `YYYY-MM` prefix: no parsing, and
  // no timezone to get wrong.
  const datesByMonth = useMemo(() => {
    const byMonth: Record<string, string[]> = {};
    for (const date of dates) {
      (byMonth[date.slice(0, 7)] ??= []).push(date);
    }
    return byMonth;
  }, [dates]);

  // Read once per render rather than once per cell.
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const months = Object.keys(datesByMonth);
  const spanMultipleMonths = months.length > 1;

  return (
    <div
      ref={gridRef}
      // -mx-4 lets the grid escape the card's 24px padding on a phone, which is what
      // buys each cell its 44px minimum; sm:mx-0 hands the padding back on wider
      // screens, where the cells are already ~90px.
      className="space-y-6 -mx-4 sm:mx-0"
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      onTouchEnd={endTouch}
      onTouchCancel={endTouch}
    >
      {months.map((monthKey, monthIndex) => {
        const monthDates = datesByMonth[monthKey];
        // Blank cells before the first day, counted from the locale's first weekday:
        // Sunday in the US, Monday across most of Europe.
        const leadingBlanks = (getDay(parseISO(monthDates[0])) - f.weekStartsOn + 7) % 7;
        
        return (
          <div key={monthKey} className={cn(monthIndex > 0 && "pt-2 border-t")}>
            {/* Month header - only show if spanning multiple months */}
            {spanMultipleMonths && (
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                {f.date(monthDates[0], 'monthYear')}
              </h3>
            )}
            
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center mb-1">
              {weekDays.map((day, i) => (
                <div key={i} className="text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className={cn("grid grid-cols-7 gap-0.5 sm:gap-1", isDragging && "touch-none")}>
              {/* Empty cells for alignment - only for first week of each month */}
              {Array.from({ length: leadingBlanks }).map((_, i) => (
                <div key={`empty-${monthKey}-${i}`} className="aspect-square sm:aspect-auto sm:h-14" />
              ))}
              
              {monthDates.map(date => {
                const isSelected = selectedSet.has(date);
                const availableCount = countOn(date);
                const heatLevel = getHeatLevel(availableCount);
                const labels = dayLabels.get(date)!;
                
                return (
                  <button
                    key={date}
                    type="button"
                    data-date={date}
                    aria-pressed={readOnly ? undefined : isSelected}
                    aria-expanded={readOnly ? revealedDate === date : undefined}
                    aria-label={
                      readOnly
                        ? t('calendar.dayWithCount', { date: labels.full, count: availableCount })
                        : labels.full
                    }
                    onMouseDown={() => {
                      if (isTouchEcho()) return;
                      beginDrag(date);
                    }}
                    onMouseEnter={() => {
                      if (isTouchEcho()) return;
                      extendDrag(date);
                    }}
                    onTouchStart={() => {
                      lastTouchAt.current = Date.now();
                      beginDrag(date);
                    }}
                    onKeyDown={(e) => {
                      // Buttons synthesise a click from Enter and Space, and onClick is
                      // deliberately inert so a drag does not toggle twice. Without this
                      // the calendar is unusable by keyboard.
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (readOnly) {
                          setRevealedDate((current) => (current === date ? null : date));
                        } else {
                          toggleOne(date);
                        }
                      }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // In read-only mode a tap is the only way to ask who is free.
                      if (readOnly) {
                        setRevealedDate((current) => (current === date ? null : date));
                      }
                    }}
                    className={cn(
                      "aspect-square sm:aspect-auto sm:h-14 min-h-11 min-w-11 rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-200 relative group select-none",
                      "cursor-pointer",
                      !readOnly && "hover:scale-105",
                      readOnly && revealedDate === date && "ring-2 ring-primary ring-offset-1",
                      isSelected && "bg-success-light border-2 border-success text-foreground font-semibold",
                      !isSelected && !readOnly && "bg-muted hover:bg-muted/80 border border-transparent",
                    )}
                    style={readOnly && !isSelected ? {
                      backgroundColor: (() => {
                        if (heatLevel === 'none') return 'hsl(var(--muted))';
                        const ratio = availableCount / activeCount;

                        // Interpolate from muted to primary (orange) based on ratio
                        if (isDark) {
                          // Dark mode: muted (25,15%,20%) to primary (16,65%,55%)
                          const h = 25 + (16 - 25) * ratio;
                          const s = 15 + (65 - 15) * ratio;
                          const l = 20 + (55 - 20) * ratio;
                          return `hsl(${h}, ${s}%, ${l}%)`;
                        } else {
                          // Light mode: muted (40,20%,94%) to primary (16,65%,55%)
                          // Peaks at 16 65% 55%, deliberately lighter than --primary
                          // (44%): these cells carry dark text, so the fill stays light
                          // enough for the count to read. See the note in index.css.
                          const h = 40 + (16 - 40) * ratio;
                          const s = 20 + (65 - 20) * ratio;
                          const l = 94 - (94 - 55) * ratio;
                          return `hsl(${h}, ${s}%, ${l}%)`;
                        }
                      })()
                    } : undefined}
                  >
                    <span className={cn(
                      "font-medium",
                      readOnly && heatLevel === 'high' && "text-primary-foreground"
                    )}>{labels.day}</span>
                    {availableCount > 0 && (
                      <span
                        className={cn(
                          "text-[11px] font-semibold",
                          // The count used to be text-muted-foreground unless heatLevel
                          // was 'high', which only happens when literally everyone is
                          // free - so on a trip where no day reaches 100% it was never
                          // legible: measured 1.8:1 on a 4-of-5 fill. The day number
                          // beside it already uses the dark foreground and measures
                          // 5.7:1 on the darkest fill, so the count uses it too.
                          readOnly && heatLevel === 'high'
                            ? "text-primary-foreground"
                            : "text-foreground/80",
                        )}
                      >
                        {availableCount}
                      </span>
                    )}
                    
                    {/* Who is free is answered by the panel under the grid, not by hover. */}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {readOnly && (
        <div
          data-testid="availability-detail"
          aria-live="polite"
          className="min-h-11 px-4 sm:px-0 flex items-center"
        >
          {revealedDate ? (
            <p className="text-sm">
              <span className="font-medium">{f.date(revealedDate, 'weekdayDayMonth')}</span>
              <span className="text-muted-foreground">
                {' — '}
                {namesAvailableOn(revealedDate).length > 0
                  ? namesAvailableOn(revealedDate).join(', ')
                  : t('calendar.nobodyFree')}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('calendar.tapHint')}</p>
          )}
        </div>
      )}
    </div>
  );
});
