import { lazy, Suspense, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';
import { currentLocale, localeBundle } from '@/i18n';
import { useFormat } from '@/i18n/format';

// react-day-picker is the largest thing on the home page, and nobody sees it until a
// popover opens. Loading it then - or on hover/focus of the trigger, which usually
// wins the race - keeps it off the critical path of the landing form.
const loadCalendar = () => import('@/components/ui/calendar');
const Calendar = lazy(() => loadCalendar().then((m) => ({ default: m.Calendar })));

interface ModernDateInputProps {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  minDate?: string;
  /** Last selectable day, `YYYY-MM-DD`. Later days are disabled. */
  maxDate?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ModernDateInput({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  placeholder,
}: ModernDateInputProps) {
  const { t } = useTranslation();
  const f = useFormat();
  const [isOpen, setIsOpen] = useState(false);
  // Derived from `value` rather than mirrored into state, so clearing the value from
  // the parent clears the button too; the mirrored copy only ever followed a truthy one.
  const selectedDate = value ? parseISO(value) : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const getDefaultMonth = () => {
    if (minDate) {
      return parseISO(minDate);
    }
    if (selectedDate) {
      return selectedDate;
    }
    return new Date();
  };

  const minDateObj = minDate ? parseISO(minDate) : new Date(new Date().setHours(0, 0, 0, 0));
  const maxDateObj = maxDate ? parseISO(maxDate) : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            onPointerEnter={loadCalendar}
            onFocus={loadCalendar}
            className={cn(
              'w-full h-11 justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? f.date(format(selectedDate, 'yyyy-MM-dd'), 'numeric')
              : (placeholder ?? t('dateInput.placeholder'))}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Suspense fallback={<div className="h-[300px] w-[280px]" aria-busy="true" />}>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              defaultMonth={getDefaultMonth()}
              disabled={(day) => day < minDateObj || (maxDateObj !== undefined && day > maxDateObj)}
              autoFocus
              // Month and weekday names, and which day starts the week.
              locale={localeBundle(currentLocale()).dateLocale}
            />
          </Suspense>
        </PopoverContent>
      </Popover>
    </div>
  );
}
