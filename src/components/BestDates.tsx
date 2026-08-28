import { useMemo, useState } from 'react';
import { Trip } from '@/lib/tripStore';
import { findBestDateRanges } from '@/lib/bestDates';
import { format, parseISO } from 'date-fns';
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
  /** Names the organiser has filtered to. Empty means the whole group. */
  selectedParticipants?: string[];
}

export function BestDates({ trip, selectedParticipants = [] }: BestDatesProps) {
  const [minDays, setMinDays] = useState<number>(1);

  // Computed without the length filter so that raising "Min" past every option empties
  // the list without removing the control that would let you lower it again.
  const allRanges = useMemo(
    () =>
      findBestDateRanges(trip, {
        minDays: 1,
        limit: Number.MAX_SAFE_INTEGER,
        onlyParticipants: selectedParticipants,
      }),
    [trip, selectedParticipants],
  );

  const topRanges = useMemo(
    () => allRanges.filter((range) => range.days >= minDays).slice(0, 5),
    [allRanges, minDays],
  );

  if (allRanges.length === 0) {
    return null;
  }

  const maxCount = Math.max(...topRanges.map((r) => r.count), 0);

  return (
    <div className="space-y-3">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium min-w-0">
          <Star className="w-4 h-4 text-accent shrink-0" />
          <span className="shrink-0">Best Dates</span>
          {selectedParticipants.length > 0 && (
            <span
              data-testid="best-dates-scope"
              className="text-xs font-normal text-muted-foreground truncate"
            >
              for {selectedParticipants.join(', ')}
            </span>
          )}
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
              data-testid="best-date-row"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isBest ? "bg-heat-high/20 border border-heat-high/30" : "bg-muted"
              )}
            >
              <div
                data-testid="best-date-label"
                className={cn(
                  "text-center min-w-[72px]",
                  isBest && "text-primary"
                )}
              >
                {isRange ? (
                  <>
                    <div className="text-base font-display font-semibold">
                      {format(startDateObj, 'd MMM')} - {format(endDateObj, 'd MMM')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {range.days} days
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
                <div data-testid="best-date-names" className="text-xs text-muted-foreground">
                  {range.names.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" />
                <span data-testid="best-date-count" className="text-sm font-medium">
                  {range.count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
