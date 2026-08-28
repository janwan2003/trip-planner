import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { generateTripId, saveTrip, Trip } from '@/lib/tripStore';
import { rememberTrip } from '@/lib/recentTrips';
import { useToast } from '@/hooks/use-toast';
import { ModernDateInput } from '@/components/ModernDateInput';

export function CreateTripForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !startDate || !endDate) return;

    if (new Date(endDate) < new Date(startDate)) {
      toast({
        title: "Invalid dates",
        description: "End date must be after start date.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);

    try {
      const trip: Trip = {
        id: generateTripId(),
        name,
        startDate,
        endDate,
        participants: [],
      };
      
      await saveTrip(trip);
      // Recorded before navigating, and only after the trip really exists: this list is
      // the only way back in for someone who closes the tab without keeping the link.
      rememberTrip(trip, 'creator');
      navigate(`/trip/${trip.id}`);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error creating trip",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in shadow-warm border-0">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-display">Plan Your Trip</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a trip and share the link with friends to find the best dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Trip Name</Label>
            <Input
              id="name"
              placeholder="Summer Adventure 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
              disabled={isCreating}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <ModernDateInput
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              disabled={isCreating}
              placeholder="Start date"
            />
            <ModernDateInput
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate}
              disabled={isCreating || !startDate}
              placeholder="End date"
            />
          </div>
          
          <Button type="submit" variant="hero" size="hero" className="w-full mt-6" disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Trip'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
