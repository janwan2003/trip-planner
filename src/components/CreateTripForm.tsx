import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, MapPin } from 'lucide-react';
import { generateTripId, saveTrip, Trip } from '@/lib/tripStore';

export function CreateTripForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !startDate || !endDate) return;
    
    const trip: Trip = {
      id: generateTripId(),
      name,
      startDate,
      endDate,
      participants: [],
    };
    
    saveTrip(trip);
    navigate(`/trip/${trip.id}`);
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
              placeholder="Summer Adventure 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">Start Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={today}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">End Date</Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || today}
                  className="h-11 pl-10"
                  required
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" variant="hero" className="w-full mt-6">
            Create Trip
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
