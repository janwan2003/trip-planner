import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { CalendarRange, Loader2 } from 'lucide-react';
import {
  addDays,
  cameFromTripPage,
  generateTripId,
  MAX_TRIP_DAYS,
  saveTrip,
  Trip,
  TripOrigin,
} from '@/lib/tripStore';
import { hasOpenedSomeoneElsesTrip, rememberTrip } from '@/lib/recentTrips';
import { useToast } from '@/hooks/use-toast';
import { ModernDateInput } from '@/components/ModernDateInput';
import { useTranslation } from 'react-i18next';

export function CreateTripForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trimmed: a name of only spaces passed this check, the API refused it, and the
    // visitor saw "Something went wrong" instead of a field that needs filling.
    const tripName = name.trim();
    if (!tripName || !startDate || !endDate) return;

    // Both are YYYY-MM-DD, which sorts correctly as text; parsing them into Dates only
    // reintroduces the timezone question this format exists to avoid.
    if (endDate < startDate) {
      toast({
        title: t('createTrip.invalidDatesTitle'),
        description: t('createTrip.invalidDatesBody'),
        variant: "destructive",
      });
      return;
    }

    const lastAllowed = addDays(startDate, MAX_TRIP_DAYS - 1);
    if (lastAllowed && endDate > lastAllowed) {
      toast({
        title: t('createTrip.tooLongTitle'),
        description: t('createTrip.tooLongBody', { count: MAX_TRIP_DAYS }),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const trip: Trip = {
        id: generateTripId(),
        name: tripName,
        startDate,
        endDate,
        participants: [],
      };
      
      // Worked out before rememberTrip below adds this trip, as 'creator', to the list.
      const origin: TripOrigin = cameFromTripPage(searchParams)
        ? 'trip-page'
        : hasOpenedSomeoneElsesTrip()
          ? 'invitee'
          : 'direct';

      await saveTrip(trip, origin);
      // Recorded before navigating, and only after the trip really exists: this list is
      // the only way back in for someone who closes the tab without keeping the link.
      rememberTrip(trip, 'creator');
      navigate(`/trip/${trip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: t('createTrip.errorTitle'),
        description: t('common.genericError'),
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in shadow-warm border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          {/* A range of days, not a pin. The product does not know or care where
              you go; the whole thesis is when. */}
            <CalendarRange className="w-6 h-6 text-primary" />
        </div>
        {/* An h2, not the vendored CardTitle's h3: this sits straight under the page's h1. */}
        <h2 className="text-2xl font-semibold leading-none tracking-tight font-display">
          {t('createTrip.title')}
        </h2>
        <CardDescription className="text-muted-foreground">
          {t('createTrip.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">{t('createTrip.nameLabel')}</Label>
            <Input
              id="name"
              placeholder={t('createTrip.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              disabled={isCreating}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <ModernDateInput
              label={t('createTrip.startLabel')}
              value={startDate}
              onChange={setStartDate}
              disabled={isCreating}
              placeholder={t('createTrip.startPlaceholder')}
            />
            <ModernDateInput
              label={t('createTrip.endLabel')}
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              maxDate={startDate ? addDays(startDate, MAX_TRIP_DAYS - 1) ?? undefined : undefined}
              disabled={isCreating || !startDate}
              placeholder={t('createTrip.endPlaceholder')}
            />
          </div>
          
          <Button type="submit" variant="hero" size="hero" className="w-full mt-6" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('createTrip.submitting')}
              </>
            ) : (
              t('createTrip.submit')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
