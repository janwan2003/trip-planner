import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ModernDateInputProps {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  minDate?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function ModernDateInput({
  label,
  value,
  onChange,
  minDate,
  disabled,
  placeholder = 'Select date',
}: ModernDateInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onChange(format(date, 'yyyy-MM-dd'));
      setIsOpen(false);
    }
  };

  const getDefaultMonth = () => {
    if (minDate) {
      return new Date(minDate);
    }
    if (selectedDate) {
      return selectedDate;
    }
    return new Date();
  };

  const minDateObj = minDate ? new Date(minDate) : new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full h-11 justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={getDefaultMonth()}
            disabled={(day) => day < minDateObj}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
