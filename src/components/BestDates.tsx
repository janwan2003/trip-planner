import { Trip, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BestDatesProps {
  trip: Trip;
}

interface DateRange {
  startDate: string;
  endDate: string;
  count: number;
  names: string[];
}

export function BestDates({ trip }: BestDatesProps) {
  const availability = getAvailabilityCount(trip);
  const dates = getDatesBetween(trip.startDate, trip.endDate);
  
  if (trip.participants.length === 0) {
    return null;
  }
  
  // Sort dates by availability count
  const sortedDates = dates
    .map(date => ({
      date,
      count: availability[date]?.length || 0,
      names: availability[date] || [],
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  if (sortedDates.length === 0) {
    return null;
  }

  const maxCount = sortedDates[0].count;

  // Group consecutive dates with the same availability
  const dateRanges: DateRange[] = [];
  let currentRange: DateRange | null = null;

  for (const item of sortedDates) {
    if (!currentRange) {
      currentRange = {
        startDate: item.date,
        endDate: item.date,
        count: item.count,
        names: item.names,
      };
    } else {
      const prevDate = parseISO(currentRange.endDate);
      const currDate = parseISO(item.date);
      const daysDiff = differenceInDays(currDate, prevDate);
      
      // Check if consecutive and same availability
      const sameAvailability = 
        item.count === currentRange.count &&
        JSON.stringify([...item.names].sort()) === JSON.stringify([...currentRange.names].sort());
      
      if (daysDiff === 1 && sameAvailability) {
        currentRange.endDate = item.date;
      } else {
        dateRanges.push(currentRange);
        currentRange = {
          startDate: item.date,
          endDate: item.date,
          count: item.count,
          names: item.names,
        };
      }
    }
  }
  
  if (currentRange) {
    dateRanges.push(currentRange);
  }

  // Take top 5 ranges
  const topRanges = dateRanges.slice(0, 5);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Star className="w-4 h-4 text-accent" />
        Best Dates
      </div>
      
      <div className="space-y-2">
        {topRanges.map((range) => {
          const startDateObj = parseISO(range.startDate);
          const endDateObj = parseISO(range.endDate);
          const isBest = range.count === maxCount;
          const isRange = range.startDate !== range.endDate;
          
          return (
            <div
              key={`${range.startDate}-${range.endDate}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isBest ? "bg-heat-high/20 border border-heat-high/30" : "bg-muted"
              )}
            >
              <div className={cn(
                "text-center min-w-[72px]",
                isBest && "text-primary"
              )}>
                {isRange ? (
                  <>
                    <div className="text-base font-display font-semibold">
                      {format(startDateObj, 'd')}-{format(endDateObj, 'd')} {format(endDateObj, 'MMM')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {differenceInDays(endDateObj, startDateObj) + 1} days
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-display font-semibold">
                      {format(startDateObj, 'd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(startDateObj, 'MMM')}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {isRange ? (
                    `${format(startDateObj, 'EEE')} - ${format(endDateObj, 'EEE')}`
                  ) : (
                    format(startDateObj, 'EEEE')
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {range.names.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="text-sm font-medium">{range.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
