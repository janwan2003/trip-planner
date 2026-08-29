import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getDatesBetween, Participant } from '@/lib/tripStore';
import { format, parseISO, getDay } from 'date-fns';

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

export function AvailabilityCalendar({
  startDate,
  endDate,
  selectedDates,
  onToggleDate,
  readOnly = false,
  availability,
  totalParticipants = 0,
  selectedParticipants = [],
  participants = [],
}: AvailabilityCalendarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null);
  const draggedDatesRef = useRef<Set<string>>(new Set());
  
  const dates = getDatesBetween(startDate, endDate);
  
  // Calculate availability based on selected participants (empty means all)
  const getFilteredAvailability = (date: string): number => {
    const activeParticipants = selectedParticipants.length === 0 
      ? participants.map(p => p.name)
      : selectedParticipants;
    
    return activeParticipants.filter(participantName => {
      const participant = participants.find(p => p.name === participantName);
      return participant?.availableDates.includes(date);
    }).length;
  };
  
  const getHeatLevel = (date: string): 'none' | 'low' | 'medium' | 'high' => {
    if (readOnly && participants.length > 0) {
      // Use filtered count based on selected participants (or all if none selected)
      const activeCount = selectedParticipants.length === 0 ? participants.length : selectedParticipants.length;
      const count = getFilteredAvailability(date);
      const ratio = count / activeCount;
      
      if (ratio === 0) return 'none';
      if (ratio < 0.5) return 'low';
      if (ratio < 1) return 'medium';
      return 'high';
    }
    
    // Fallback to original logic
    if (!availability || totalParticipants === 0) return 'none';
    const count = availability[date]?.length || 0;
    const ratio = count / totalParticipants;
    
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
    const isCurrentlySelected = selectedDates.includes(date);
    setDragStartValue(!isCurrentlySelected);
    draggedDatesRef.current = new Set([date]);
    onToggleDate(date);
  }, [readOnly, selectedDates, onToggleDate]);

  /** Extends an in-progress drag onto another date, once. */
  const extendDrag = useCallback((date: string) => {
    if (!isDragging || readOnly) return;

    if (!draggedDatesRef.current.has(date)) {
      draggedDatesRef.current.add(date);
      const isCurrentlySelected = selectedDates.includes(date);

      if (dragStartValue !== null && isCurrentlySelected !== dragStartValue) {
        onToggleDate(date);
      }
    }
  }, [isDragging, readOnly, selectedDates, dragStartValue, onToggleDate]);

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Group dates by month
  const datesByMonth = dates.reduce((acc, date) => {
    const monthKey = format(parseISO(date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(date);
    return acc;
  }, {} as Record<string, string[]>);

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
        const firstDate = parseISO(monthDates[0]);
        const firstDayOfWeek = getDay(firstDate);
        
        return (
          <div key={monthKey} className={cn(monthIndex > 0 && "pt-2 border-t")}>
            {/* Month header - only show if spanning multiple months */}
            {spanMultipleMonths && (
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                {format(firstDate, 'MMMM yyyy')}
              </h3>
            )}
            
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center mb-1">
              {weekDays.map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className={cn("grid grid-cols-7 gap-0.5 sm:gap-1", isDragging && "touch-none")}>
              {/* Empty cells for alignment - only for first week of each month */}
              {monthIndex === 0 || getDay(firstDate) !== 0 ? (
                Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${monthKey}-${i}`} className="aspect-square sm:aspect-auto sm:h-14" />
                ))
              ) : null}
              
              {monthDates.map(date => {
                const isSelected = selectedDates.includes(date);
                const heatLevel = getHeatLevel(date);
                const availableCount = readOnly && participants.length > 0
                  ? getFilteredAvailability(date)
                  : (availability?.[date]?.length || 0);
                const dateObj = parseISO(date);
                
                return (
                  <button
                    key={date}
                    type="button"
                    data-date={date}
                    aria-pressed={readOnly ? undefined : isSelected}
                    aria-expanded={readOnly ? revealedDate === date : undefined}
                    aria-label={
                      readOnly
                        ? `${format(dateObj, 'EEEE d MMMM yyyy')}, ${availableCount} available`
                        : format(dateObj, 'EEEE d MMMM yyyy')
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
                        const activeCount = selectedParticipants.length === 0 ? participants.length : selectedParticipants.length;
                        const count = readOnly && participants.length > 0 ? getFilteredAvailability(date) : (availability?.[date]?.length || 0);
                        const ratio = count / activeCount;
                        
                        // Interpolate from muted to primary (orange) based on ratio
                        const isDark = document.documentElement.classList.contains('dark');
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
                    )}>{format(dateObj, 'd')}</span>
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
              <span className="font-medium">{format(parseISO(revealedDate), 'EEE d MMM')}</span>
              <span className="text-muted-foreground">
                {namesAvailableOn(revealedDate).length > 0
                  ? ` — ${namesAvailableOn(revealedDate).join(', ')}`
                  : ' — nobody is free'}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Tap a day to see who is free</p>
          )}
        </div>
      )}
    </div>
  );
}
