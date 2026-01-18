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
  
  // Build availability map: date -> set of names
  const availabilityMap = new Map<string, Set<string>>();
  for (const date of dates) {
    const names = availability[date] || [];
    if (names.length > 0) {
      availabilityMap.set(date, new Set(names));
    }
  }

  if (availabilityMap.size === 0) {
    return null;
  }

  // Get all unique participant sets (as sorted string keys)
  const allParticipants = new Set<string>();
  for (const names of availabilityMap.values()) {
    for (const name of names) {
      allParticipants.add(name);
    }
  }

  // Generate all non-empty subsets of participants (power set minus empty)
  const participantList = Array.from(allParticipants);
  const participantSubsets: Set<string>[] = [];
  
  // Only consider subsets of size 1 to all participants
  for (let mask = 1; mask < (1 << participantList.length); mask++) {
    const subset = new Set<string>();
    for (let i = 0; i < participantList.length; i++) {
      if (mask & (1 << i)) {
        subset.add(participantList[i]);
      }
    }
    participantSubsets.push(subset);
  }

  // Sort subsets by size descending (prefer larger groups)
  participantSubsets.sort((a, b) => b.size - a.size);

  // For each participant subset, find maximal consecutive ranges where ALL are available
  const allRanges: DateRange[] = [];
  
  for (const subset of participantSubsets) {
    // Find dates where ALL members of this subset are available
    const validDates: string[] = [];
    for (const date of dates) {
      const available = availabilityMap.get(date);
      if (available) {
        let allPresent = true;
        for (const name of subset) {
          if (!available.has(name)) {
            allPresent = false;
            break;
          }
        }
        if (allPresent) {
          validDates.push(date);
        }
      }
    }

    if (validDates.length === 0) continue;

    // Group into consecutive ranges
    let rangeStart = validDates[0];
    let rangeEnd = validDates[0];

    for (let i = 1; i < validDates.length; i++) {
      const prevDate = parseISO(rangeEnd);
      const currDate = parseISO(validDates[i]);
      const daysDiff = differenceInDays(currDate, prevDate);

      if (daysDiff === 1) {
        rangeEnd = validDates[i];
      } else {
        allRanges.push({
          startDate: rangeStart,
          endDate: rangeEnd,
          count: subset.size,
          names: Array.from(subset),
        });
        rangeStart = validDates[i];
        rangeEnd = validDates[i];
      }
    }
    // Push the last range
    allRanges.push({
      startDate: rangeStart,
      endDate: rangeEnd,
      count: subset.size,
      names: Array.from(subset),
    });
  }

  // Remove ranges that are subsets of larger ranges with the same people
  // Also remove ranges where the same date range exists with MORE people
  const maximalRanges = allRanges.filter(range => {
    const rangeKey = [...range.names].sort().join(',');
    const rangeStart = parseISO(range.startDate).getTime();
    const rangeEnd = parseISO(range.endDate).getTime();
    
    for (const other of allRanges) {
      if (other === range) continue;
      
      const otherStart = parseISO(other.startDate).getTime();
      const otherEnd = parseISO(other.endDate).getTime();
      const otherKey = [...other.names].sort().join(',');
      
      // Case 1: Same participants, other range strictly contains this one
      if (otherKey === rangeKey) {
        if (otherStart <= rangeStart && otherEnd >= rangeEnd && 
            (otherStart < rangeStart || otherEnd > rangeEnd)) {
          return false;
        }
      }
      
      // Case 2: Same date range but other has MORE people - this range is dominated
      if (otherStart === rangeStart && otherEnd === rangeEnd && other.count > range.count) {
        return false;
      }
    }
    return true;
  });

  // Filter by minimum days
  const filteredRanges = maximalRanges.filter(range => {
    const rangeLength = differenceInDays(parseISO(range.endDate), parseISO(range.startDate)) + 1;
    return rangeLength >= minDays;
  });

  const maxCount = Math.max(...filteredRanges.map(r => r.count), 0);

  // Sort: first by people count (desc), then chronologically (asc)
  const sortedRanges = filteredRanges.sort((a, b) => {
    // First priority: number of people
    if (b.count !== a.count) return b.count - a.count;
    
    // Second priority: chronological order
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
