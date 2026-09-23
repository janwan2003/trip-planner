import { useMemo, useState } from 'react';
import { Trip } from '@/lib/tripStore';
import { findBestDateRanges } from '@/lib/bestDates';
import { useTranslation } from 'react-i18next';
import { useFormat } from '@/i18n/format';
import { Star, Users, HelpCircle, Calendar } from 'lucide-react';
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
  /**
   * The raw contents of the "Min" box, not a number.
   *
   * It was a `number` coerced with `parseInt(value) || 1` on every keystroke, so an
   * empty box snapped straight back to 1 and the character you had just deleted
   * reappeared. Typing 2 over a 1 meant typing 12 and then deleting the 1. Holding the
   * string lets the field be empty while it is being retyped; the filter reads 1 in the
   * meantime, and the box normalises to a valid number on blur.
   */
  const [minDaysInput, setMinDaysInput] = useState('1');
  const { t } = useTranslation();
  const f = useFormat();
  const minDays = Math.max(1, parseInt(minDaysInput, 10) || 1);

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

  const maxCount = Math.max(...topRanges.map((r) => r.count), 0);

  /**
   * The denominator for a row's count. A bare "6" next to a people icon does not say
   * whether the range is unanimous, which is the one thing the organiser is looking for -
   * and under a participant filter it is more ambiguous still, because 6 could be 6 of 6
   * selected or 6 of 20 on the trip.
   */
  const scopeTotal =
    selectedParticipants.length > 0 ? selectedParticipants.length : trip.participants.length;

  /**
   * The empty state lives here rather than in the parent, because this is the only
   * component that knows whether any ranges exist.
   *
   * It used to return null, while TripPage rendered a placeholder gated on
   * `participants.length === 0`. The state in between - somebody has joined but marked
   * nothing yet - fell through both and rendered an empty bordered card. That is exactly
   * what an organiser sees in the seconds after creating a trip.
   */
  if (allRanges.length === 0) {
    const filtered = selectedParticipants.length > 0;
    const nobodyHasMarked = trip.participants.every((p) => p.availableDates.length === 0);

    return (
      <div data-testid="best-dates-empty" className="text-center py-6 text-muted-foreground">
        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
        {trip.participants.length === 0 ? (
          <>
            <p className="text-sm text-foreground">{t('bestDates.empty.noParticipantsTitle')}</p>
            <p className="text-xs">{t('bestDates.empty.noParticipantsBody')}</p>
          </>
        ) : filtered ? (
          <>
            <p className="text-sm text-foreground">
              {t('bestDates.empty.filteredTitle', { names: selectedParticipants.join(', ') })}
            </p>
            <p className="text-xs">{t('bestDates.empty.filteredBody')}</p>
          </>
        ) : nobodyHasMarked ? (
          <>
            <p className="text-sm text-foreground">
              {t('bestDates.empty.nobodyMarkedTitle', { count: trip.participants.length })}
            </p>
            <p className="text-xs">{t('bestDates.empty.nobodyMarkedBody')}</p>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">{t('bestDates.empty.noOverlapTitle')}</p>
            <p className="text-xs">{t('bestDates.empty.noOverlapBody')}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with filter */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium min-w-0">
          <Star className="w-4 h-4 text-accent shrink-0" />
          <span className="shrink-0">{t('bestDates.title')}</span>
          {selectedParticipants.length > 0 && (
            <span
              data-testid="best-dates-scope"
              className="text-xs font-normal text-muted-foreground truncate"
            >
              {t('bestDates.forNames', { names: selectedParticipants.join(', ') })}
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
                  {t('bestDates.minHelp')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-xs text-muted-foreground">{t('bestDates.minLabel')}</span>
          <Input
            type="number"
            inputMode="numeric"
            value={minDaysInput}
            onChange={(e) => {
              // Digits or nothing: a number input hands back '' for anything it cannot
              // parse, and '' has to be allowed through or the box cannot be cleared.
              if (/^\d*$/.test(e.target.value)) setMinDaysInput(e.target.value);
            }}
            onBlur={() => setMinDaysInput(String(minDays))}
            min="1"
            className="h-6 w-12 text-xs px-1.5"
            title={t('bestDates.minTitle')}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        {topRanges.map((range) => {
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
                      {f.dateRange(range.startDate, range.endDate, 'dayMonth')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('bestDates.days', { count: range.days })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-display font-semibold">
                      {f.date(range.startDate, 'day')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {f.date(range.startDate, 'month')}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {isRange ? (
                    f.dateRange(range.startDate, range.endDate, 'weekday')
                  ) : (
                    f.date(range.startDate, 'weekdayLong')
                  )}
                </div>
                <div data-testid="best-date-names" className="text-xs text-muted-foreground">
                  {range.names.join(', ')}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3 h-3" aria-hidden="true" />
                <span className="text-sm font-medium">
                  <span data-testid="best-date-count">{range.count}</span>
                  <span aria-hidden="true" className="text-muted-foreground/80">
                    /{scopeTotal}
                  </span>
                  {/* The icon carries no text, so the ratio needs saying in full. */}
                  <span className="sr-only">
                    {' '}
                    {t('bestDates.ofPeopleFree', { count: scopeTotal })}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
