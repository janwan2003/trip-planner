import { Trip, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { format, parseISO } from 'date-fns';
import { Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BestDatesProps {
  trip: Trip;
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
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (sortedDates.length === 0) {
    return null;
  }

  const maxCount = sortedDates[0].count;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Star className="w-4 h-4 text-accent" />
        Best Dates
      </div>
      
      <div className="space-y-2">
        {sortedDates.map(({ date, count, names }) => {
          const dateObj = parseISO(date);
          const isBest = count === maxCount;
          
          return (
            <div
              key={date}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isBest ? "bg-heat-high/20 border border-heat-high/30" : "bg-muted"
              )}
            >
              <div className={cn(
                "text-center min-w-[48px]",
                isBest && "text-primary"
              )}>
                <div className="text-lg font-display font-semibold">
                  {format(dateObj, 'd')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(dateObj, 'MMM')}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {format(dateObj, 'EEEE')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {names.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="text-sm font-medium">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
