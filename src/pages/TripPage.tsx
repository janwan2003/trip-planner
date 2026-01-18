import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trip, getTrip, addParticipant, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { ParticipantsList } from '@/components/ParticipantsList';
import { BestDates } from '@/components/BestDates';
import { Tutorial } from '@/components/Tutorial';
import { Copy, Check, ArrowLeft, Calendar, Users, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasSavedAvailability, setHasSavedAvailability] = useState(false);
  const [hasSharedLink, setHasSharedLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadTrip = async () => {
      if (tripId) {
        setIsLoading(true);
        const loadedTrip = await getTrip(tripId);
        setTrip(loadedTrip);
        setIsLoading(false);
      }
    };
    
    loadTrip();
  }, [tripId]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    
    // Check if user already exists
    const existingParticipant = trip?.participants.find(
      p => p.name.toLowerCase() === userName.toLowerCase()
    );
    
    if (existingParticipant) {
      setSelectedDates(existingParticipant.availableDates);
      setHasSavedAvailability(existingParticipant.availableDates.length > 0);
    }
    
    setHasJoined(true);
  };

  const handleToggleDate = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const handleSave = async () => {
    if (!trip || !userName) return;
    
    setIsSaving(true);

    try {
      const updatedTrip = await addParticipant(trip.id, {
        name: userName,
        availableDates: selectedDates,
      });
      
      if (updatedTrip) {
        setTrip(updatedTrip);
        setHasSavedAvailability(true);
        toast({
          title: "Availability saved!",
          description: `Your dates have been updated.`,
        });
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error saving",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setHasSharedLink(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Link copied!",
      description: "Share this link with your friends.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-2">Trip not found</h2>
          <p className="text-muted-foreground mb-4">This trip doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/">Create a new trip</Link>
          </Button>
        </div>
      </div>
    );
  }

  const availability = getAvailabilityCount(trip);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="py-3 px-4 border-b">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16">
              <img src="/trip-planner/favicon.png" alt="TripSync Logo" className="w-full h-full object-contain" />
            </div>
            <div className="h-8">
              <img src="/trip-planner/text-logo.png" alt="TripSync" className="h-full object-contain" />
            </div>
          </Link>
          
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share Link'}
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-3xl font-display font-bold mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                {format(parseISO(trip.startDate), 'MMM d')} - {format(parseISO(trip.endDate), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">
                {trip.participants.length} participant{trip.participants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Calendar Section */}
          <div className="lg:col-span-2 space-y-6">
            {!hasJoined ? (
              <Card className="animate-scale-in shadow-warm border-0">
                <CardHeader>
                  <CardTitle className="font-display">Join this trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleJoin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="userName">Your Name</Label>
                      <Input
                        id="userName"
                        placeholder="Enter your name"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="animate-scale-in shadow-warm border-0">
                <CardHeader>
                  <div>
                    <CardTitle className="font-display">Mark Your Availability</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Hi {userName}! Click and drag to select dates you're available.
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDates(getDatesBetween(trip.startDate, trip.endDate))}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDates([])}
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <AvailabilityCalendar
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    selectedDates={selectedDates}
                    onToggleDate={handleToggleDate}
                    availability={availability}
                    totalParticipants={trip.participants.length}
                  />
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-success-light border-2 border-success" />
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted" />
                      <span>Not selected</span>
                    </div>
                  </div>
                  
                  {/* Floating Save Button */}
                  <div className="sticky bottom-4 mt-6 z-10">
                    <Button 
                      onClick={handleSave} 
                      disabled={selectedDates.length === 0 || isSaving}
                      size="lg"
                      className="w-full px-8 font-semibold shadow-2xl hover:shadow-xl transition-all"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Availability'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Group Availability View */}
            {trip.participants.length > 0 && (
              <Card className="shadow-soft animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-display">Group Availability</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Hover over dates to see who's available
                  </p>
                </CardHeader>
                <CardContent>
                  <AvailabilityCalendar
                    startDate={trip.startDate}
                    endDate={trip.endDate}
                    selectedDates={[]}
                    onToggleDate={() => {}}
                    readOnly
                    availability={availability}
                    totalParticipants={trip.participants.length}
                  />
                  
                  <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-heat-low" />
                      <span>Few</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-heat-medium" />
                      <span>Some</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-heat-high" />
                      <span>Everyone</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tutorial */}
            <Tutorial 
              completedSteps={[
                1, // Trip created
                ...(hasSharedLink || trip.participants.length > 1 ? [2] : []), // Link shared
                ...(hasSavedAvailability ? [3] : []), // Availability saved
                ...(trip.participants.length > 1 ? [4] : []), // Best dates available
              ]}
            />
            
            {/* Best Dates */}
            <Card className="shadow-soft animate-fade-in">
              <CardContent className="pt-6">
                <BestDates trip={trip} />
                {trip.participants.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Best dates will appear here</p>
                    <p className="text-xs">once people mark their availability</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="shadow-soft animate-fade-in">
              <CardHeader>
                <CardTitle className="font-display text-lg">Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <ParticipantsList 
                  participants={trip.participants} 
                  currentUser={hasJoined ? userName : undefined}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
