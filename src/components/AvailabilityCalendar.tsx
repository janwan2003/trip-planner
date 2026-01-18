import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { getDatesBetween } from '@/lib/tripStore';
import { format, parseISO, getDay, startOfMonth, isSameMonth } from 'date-fns';

interface AvailabilityCalendarProps {
  startDate: string;
  endDate: string;
  selectedDates: string[];
  onToggleDate: (date: string) => void;
  readOnly?: boolean;
  availability?: Record<string, string[]>;
  totalParticipants?: number;
}

export function AvailabilityCalendar({
  startDate,
  endDate,
  selectedDates,
  onToggleDate,
  readOnly = false,
  availability,
  totalParticipants = 0,
}: AvailabilityCalendarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartValue, setDragStartValue] = useState<boolean | null>(null);
  const draggedDatesRef = useRef<Set<string>>(new Set());
  
  const dates = getDatesBetween(startDate, endDate);
  
  const getHeatLevel = (date: string): 'none' | 'low' | 'medium' | 'high' => {
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
                const availableCount = availability?.[date]?.length || 0;
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
                      readOnly && heatLevel === 'none' && "bg-muted",
                      readOnly && heatLevel === 'low' && "bg-heat-low",
                      readOnly && heatLevel === 'medium' && "bg-heat-medium",
                      readOnly && heatLevel === 'high' && "bg-heat-high text-primary-foreground",
                    )}
                  >
                    <span className="font-medium">{format(dateObj, 'd')}</span>
                    {availableCount > 0 && (
                      <span className={cn(
                        "text-[10px] font-medium",
                        readOnly && heatLevel === 'high' ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {availableCount}
                      </span>
                    )}
                    
                    {/* Tooltip for hover */}
                    {availability?.[date] && availability[date].length > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <div className="bg-card border shadow-soft rounded-lg px-3 py-2 text-xs whitespace-nowrap">
                          <div className="font-medium mb-1">{format(dateObj, 'MMM d, yyyy')}</div>
                          <div className="text-muted-foreground">
                            {availability[date].join(', ')}
                          </div>
                        </div>
                      </div>
                    )}
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
