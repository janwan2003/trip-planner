import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getDatesBetween, Participant } from '@/lib/tripStore';
import { format, parseISO, getDay, startOfMonth, isSameMonth } from 'date-fns';

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

  const handleMouseDown = useCallback((date: string) => {
    if (readOnly) return;
    
    setIsDragging(true);
    const isCurrentlySelected = selectedDates.includes(date);
    setDragStartValue(!isCurrentlySelected);
    draggedDatesRef.current = new Set([date]);
    onToggleDate(date);
  }, [readOnly, selectedDates, onToggleDate]);

  const handleMouseEnter = useCallback((date: string) => {
    if (!isDragging || readOnly) return;
    
    if (!draggedDatesRef.current.has(date)) {
      draggedDatesRef.current.add(date);
      const isCurrentlySelected = selectedDates.includes(date);
      
      if (dragStartValue !== null && isCurrentlySelected !== dragStartValue) {
        onToggleDate(date);
      }
    }
  }, [isDragging, readOnly, selectedDates, dragStartValue, onToggleDate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartValue(null);
    draggedDatesRef.current.clear();
  }, []);

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
      className="space-y-6"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
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
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {weekDays.map(day => (
                <div key={day} className="text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for alignment - only for first week of each month */}
              {monthIndex === 0 || getDay(firstDate) !== 0 ? (
                Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${monthKey}-${i}`} className="aspect-square" />
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
                    disabled={readOnly}
                    onMouseDown={() => handleMouseDown(date)}
                    onMouseEnter={() => handleMouseEnter(date)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-200 relative group select-none",
                      !readOnly && "hover:scale-105 cursor-pointer",
                      readOnly && "cursor-default",
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
                      <span className={cn(
                        "text-[10px] font-medium",
                        readOnly && heatLevel === 'high' ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {availableCount}
                      </span>
                    )}
                    
                    {/* Tooltip for hover */}
                    {readOnly && availableCount > 0 && (() => {
                      const activeParticipants = selectedParticipants.length === 0
                        ? participants.map(p => p.name)
                        : selectedParticipants;
                      
                      const availableNames = activeParticipants.filter(name => {
                        const participant = participants.find(p => p.name === name);
                        return participant?.availableDates.includes(date);
                      });
                      return availableNames.length > 0 ? (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <div className="bg-popover border border-border shadow-lg rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                            <div className="font-medium mb-1 text-popover-foreground">{format(dateObj, 'MMM d, yyyy')}</div>
                            <div className="text-muted-foreground">
                              {availableNames.join(', ')}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
