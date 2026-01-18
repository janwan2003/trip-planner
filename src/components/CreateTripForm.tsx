import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin, Loader2 } from 'lucide-react';
import { generateTripId, saveTrip, Trip } from '@/lib/tripStore';
import { useToast } from '@/hooks/use-toast';

export function CreateTripForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const endDateRef = useRef<HTMLInputElement>(null);

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

  const today = new Date().toISOString().split('T')[0];

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
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Select Date Range
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      // Auto-focus end date after selecting start date
                      setTimeout(() => endDateRef.current?.focus(), 100);
                    }}
                    min={today}
                    className="h-11 text-center font-medium"
                    required
                    disabled={isCreating}
                    placeholder="Start"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground">
                    {!startDate && 'Start Date'}
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    ref={endDateRef}
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || today}
                    className="h-11 text-center font-medium"
                    required
                    disabled={isCreating || !startDate}
                    placeholder="End"
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-xs text-muted-foreground">
                    {!endDate && 'End Date'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Button type="submit" variant="hero" className="w-full mt-6" disabled={isCreating}>
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
