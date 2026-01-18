import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onDateChange: (startDate: string, endDate: string) => void;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  disabled,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      };
    }
    return undefined;
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (date?.from && date?.to) {
      // Format dates as YYYY-MM-DD for form submission
      const from = format(date.from, 'yyyy-MM-dd');
      const to = format(date.to, 'yyyy-MM-dd');
      onDateChange(from, to);
    }
  }, [date, onDateChange]);

  const formatDateRange = () => {
    if (!date?.from) return 'Select date range';
    if (!date.to) return format(date.from, 'dd/MM/yyyy');
    return `${format(date.from, 'dd/MM/yyyy')} - ${format(date.to, 'dd/MM/yyyy')}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full h-11 justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            // Auto-close when both dates are selected
            if (newDate?.from && newDate?.to) {
              setTimeout(() => setIsOpen(false), 300);
            }
          }}
          numberOfMonths={2}
          disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
        />
      </PopoverContent>
    </Popover>
  );
}
