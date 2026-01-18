import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getDatesBetween } from '@/lib/tripStore';
import { format, parseISO, getDay } from 'date-fns';

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

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get the day of week for the first date to add empty cells
  const firstDayOfWeek = getDay(parseISO(startDate));

  return (
    <div className="space-y-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map(day => (
          <div key={day} className="text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for alignment */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        
        {dates.map(date => {
          const isSelected = selectedDates.includes(date);
          const heatLevel = getHeatLevel(date);
          const availableCount = availability?.[date]?.length || 0;
          const dateObj = parseISO(date);
          
          return (
            <button
              key={date}
              type="button"
              disabled={readOnly}
              onClick={() => !readOnly && onToggleDate(date)}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-200 relative group",
                !readOnly && "hover:scale-105 cursor-pointer",
                readOnly && "cursor-default",
                isSelected && "bg-success-light border-2 border-success text-foreground",
                !isSelected && !readOnly && "bg-muted hover:bg-muted/80 border border-transparent",
                readOnly && heatLevel === 'none' && "bg-muted",
                readOnly && heatLevel === 'low' && "bg-heat-low",
                readOnly && heatLevel === 'medium' && "bg-heat-medium",
                readOnly && heatLevel === 'high' && "bg-heat-high text-primary-foreground",
              )}
            >
              <span className="font-medium">{format(dateObj, 'd')}</span>
              {readOnly && availableCount > 0 && (
                <span className={cn(
                  "text-[10px] font-medium",
                  heatLevel === 'high' ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {availableCount}
                </span>
              )}
              
              {/* Tooltip for hover */}
              {readOnly && availability?.[date] && availability[date].length > 0 && (
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
}
