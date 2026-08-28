import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, History, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { forgetTrip, getRecentTrips, RecentTrip } from '@/lib/recentTrips';

/**
 * A date range, or null if either end is unusable. The entries come from our own
 * writes, so a bad date means storage was tampered with or written by an older build —
 * worth degrading to "no dates shown" rather than throwing out of a render.
 */
const formatRange = (startDate: string, endDate: string): string | null => {
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  } catch {
    return null;
  }
};

/**
 * Lists the trips this browser has opened, newest first, so a creator who closed the
 * tab without saving the link can get back in. Renders nothing at all for a browser
 * with no history: an empty card on the landing page would be noise on the one screen
 * that has a job to do.
 */
export function RecentTrips() {
  const [trips, setTrips] = useState<RecentTrip[]>(() => getRecentTrips());

  if (trips.length === 0) return null;

  const handleForget = (id: string) => {
    forgetTrip(id);
    setTrips(getRecentTrips());
  };

  return (
    <Card className="w-full animate-fade-in shadow-warm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Your trips
        </CardTitle>
        <CardDescription>
          Trips you opened in this browser. Saved here only — not on our servers, and not
          on your other devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border/60">
          {trips.map((trip) => {
            const range = formatRange(trip.startDate, trip.endDate);
            const name = trip.name || 'Untitled trip';

            return (
              <li key={trip.id} className="flex items-center gap-2 py-2">
                <Link
                  to={`/trip/${trip.id}`}
                  // The row is two stacked lines, and a name computed from them reads as
                  // one run-on string; naming the link explicitly keeps the trip name
                  // first for anyone tabbing through with a screen reader.
                  aria-label={range ? `Open ${name}, ${range}` : `Open ${name}`}
                  className="flex-1 min-w-0 group rounded-md px-1 py-1 hover:bg-muted/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="font-medium truncate group-hover:underline">
                      {name}
                    </span>
                    {trip.role === 'creator' && (
                      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-primary bg-primary/10 rounded px-1.5 py-0.5">
                        Yours
                      </span>
                    )}
                  </span>
                  {range && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {range}
                    </span>
                  )}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-11 w-11 text-muted-foreground hover:text-foreground"
                  aria-label={`Remove ${name} from this list`}
                  onClick={() => handleForget(trip.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
