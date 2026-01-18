import { useState } from 'react';
import { Trip, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { Star, Users, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const [minDays, setMinDays] = useState<number>(1);
  const availability = getAvailabilityCount(trip);
  const dates = getDatesBetween(trip.startDate, trip.endDate);
  
  if (trip.participants.length === 0) {
    return null;
  }
  
  // Get dates with availability (keep chronological order for grouping)
  const datesWithAvailability = dates
    .map(date => ({
      date,
      count: availability[date]?.length || 0,
      names: availability[date] || [],
    }))
    .filter(d => d.count > 0);

  if (datesWithAvailability.length === 0) {
    return null;
  }

  const maxCount = Math.max(...datesWithAvailability.map(d => d.count));

  // Find all consecutive date sequences (regardless of who's available)
  const dateRanges: DateRange[] = [];
  let currentRange: DateRange | null = null;

  for (const item of datesWithAvailability) {
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
      
      // Just check if consecutive (extend range with current item's data)
      if (daysDiff === 1) {
        currentRange.endDate = item.date;
        // Update to minimum count in the range
        currentRange.count = Math.min(currentRange.count, item.count);
        // Combine names (intersection of all days in range)
        const currentNames = new Set(currentRange.names);
        currentRange.names = item.names.filter(name => currentNames.has(name));
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

  // Filter ranges by minimum days - keep full ranges that meet the minimum
  const filteredRanges = dateRanges.filter(range => {
    const rangeLength = differenceInDays(parseISO(range.endDate), parseISO(range.startDate)) + 1;
    return rangeLength >= minDays;
  });

  console.log('BestDates Debug:', {
    tripDates: `${trip.startDate} to ${trip.endDate}`,
    totalDates: dates.length,
    datesWithAvailability: datesWithAvailability.length,
    minDays,
    totalRanges: dateRanges.length,
    filteredRanges: filteredRanges.length,
    allRanges: dateRanges.map(r => ({
      start: r.startDate,
      end: r.endDate,
      days: differenceInDays(parseISO(r.endDate), parseISO(r.startDate)) + 1,
      count: r.count,
      names: r.names.join(', ')
    })),
    filteredOnly: filteredRanges.map(r => ({
      start: r.startDate,
      end: r.endDate,
      days: differenceInDays(parseISO(r.endDate), parseISO(r.startDate)) + 1,
      count: r.count
    }))
  });

  // Sort: first by people count (desc), then by length (desc), then by start date (asc)
  const sortedRanges = filteredRanges.sort((a, b) => {
    // First priority: number of people
    if (b.count !== a.count) return b.count - a.count;
    
    // Second priority: length of period
    const aLength = differenceInDays(parseISO(a.endDate), parseISO(a.startDate)) + 1;
    const bLength = differenceInDays(parseISO(b.endDate), parseISO(b.startDate)) + 1;
    if (bLength !== aLength) return bLength - aLength;
    
    // Third priority: chronological order
    return parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime();
  });

  // Take top 5 ranges
  const topRanges = sortedRanges.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Star className="w-4 h-4 text-accent" />
          Best Dates
        </div>
        
        <div className="flex items-center gap-1.5">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-default">
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Minimum length of trip period.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-xs text-muted-foreground">Min:</span>
          <Input
            type="number"
            value={minDays}
            onChange={(e) => setMinDays(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            className="h-6 w-10 text-xs px-1.5"
            title="Min days"
          />
        </div>
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
                      {format(startDateObj, 'd MMM')} - {format(endDateObj, 'd MMM')}
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
