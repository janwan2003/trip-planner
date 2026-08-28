import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trip, getTrip, addParticipant, updateParticipantName, removeParticipant, getAvailabilityCount, getDatesBetween } from '@/lib/tripStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { ParticipantsList } from '@/components/ParticipantsList';
import { BestDates } from '@/components/BestDates';
import { Tutorial } from '@/components/Tutorial';
import { Copy, Check, ArrowLeft, Calendar, Users, Loader2, Pencil, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { usePageMeta } from '@/lib/usePageMeta';

export default function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [savedDates, setSavedDates] = useState<string[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [hasSavedAvailability, setHasSavedAvailability] = useState(false);
  const [hasSharedLink, setHasSharedLink] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trips carry no access control beyond possession of the link, so they must not turn
  // up in a search result. `noindex` comes from the `/trip` entry in siteMeta.
  usePageMeta('/trip', trip ? { title: `${trip.name} | WeGoWhen` } : {});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadTrip = async () => {
      if (!tripId) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        setTrip(await getTrip(tripId));
      } catch (error) {
        // getTrip returns null only for a trip that does not exist, and throws for
        // anything else. Telling someone their trip "does not exist" because the
        // network hiccuped would be a lie they cannot recover from.
        console.error('Error loading trip:', error);
        setLoadError(error instanceof Error ? error.message : String(error));
      } finally {
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
      setSavedDates(existingParticipant.availableDates);
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
        setSavedDates(selectedDates);
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

  const handleEditName = () => {
    setEditedName(userName);
    setIsEditingName(true);
  };

  const handleSaveNewName = async () => {
    if (!trip || !editedName.trim() || editedName.trim() === userName) {
      setIsEditingName(false);
      return;
    }

    // Check if name already exists
    const nameExists = trip.participants.some(
      p => p.name.toLowerCase() === editedName.trim().toLowerCase() && 
           p.name.toLowerCase() !== userName.toLowerCase()
    );

    if (nameExists) {
      toast({
        title: "Name already taken",
        description: "Someone else is already using this name.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedTrip = await updateParticipantName(trip.id, userName, editedName.trim());
      if (updatedTrip) {
        setTrip(updatedTrip);
        setUserName(editedName.trim());
        toast({
          title: "Name updated!",
          description: `You are now known as ${editedName.trim()}.`,
        });
      }
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: "Error updating name",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setIsEditingName(false);
    }
  };

  const handleWithdraw = async () => {
    if (!trip || !userName) return;

    if (!confirm('Are you sure you want to withdraw from this trip? Your availability will be removed.')) {
      return;
    }

    setIsSaving(true);
    try {
      const updatedTrip = await removeParticipant(trip.id, userName);
      if (updatedTrip) {
        setTrip(updatedTrip);
        setHasJoined(false);
        setUserName('');
        setSelectedDates([]);
        setSavedDates([]);
        setHasSavedAvailability(false);
        toast({
          title: "Withdrawn from trip",
          description: "Your availability has been removed.",
        });
      }
    } catch (error) {
      console.error('Error withdrawing:', error);
      toast({
        title: "Error withdrawing",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleParticipant = (participantName: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantName)
        ? prev.filter(name => name !== participantName)
        : [...prev, participantName]
    );
  };

  // Check if current selection differs from saved state
  const hasUnsavedChanges = () => {
    if (selectedDates.length !== savedDates.length) return true;
    const sortedSelected = [...selectedDates].sort();
    const sortedSaved = [...savedDates].sort();
    return sortedSelected.some((date, index) => date !== sortedSaved[index]);
  };

  const isSaveDisabled = isSaving || !hasUnsavedChanges();

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

  if (loadError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-display font-semibold mb-2">Couldn't load this trip</h2>
          <p className="text-muted-foreground mb-4">
            The trip may well be fine — we just couldn't reach it. Check your connection and try again.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>Try again</Button>
            <Button variant="outline" asChild>
              <Link to="/">Create a new trip</Link>
            </Button>
          </div>
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
            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0">
              <img src="/favicon.png" alt="WeGoWhen Logo" className="w-full h-full object-contain" />
            </div>
            <div className="h-8 flex items-center">
              <span className="font-display font-semibold text-xl sm:text-2xl select-none">
                WeGoWhen
              </span>
            </div>
          </Link>
          
          {/*
            The full "Share Link" label made this button 126px wide, which held the
            header wider than a 320px viewport and gave the whole page 66px of
            horizontal overflow. The word "Link" carries nothing the icon does not, so
            it is dropped on the narrowest screens rather than wrapping the header.
          */}
          <Button variant="outline" onClick={handleCopyLink} className="gap-2 shrink-0">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? (
              'Copied!'
            ) : (
              <>
                Share<span className="hidden sm:inline">&nbsp;Link</span>
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="mb-8 animate-fade-in">
          {hasJoined && (
            <button
              onClick={() => {
                setHasJoined(false);
                setUserName('');
                setSelectedDates([]);
                setSavedDates([]);
              }}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to trip view
            </button>
          )}
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="font-display">Mark Your Availability</CardTitle>
                      {isEditingName ? (
                        <div className="flex items-center gap-2 mt-2">
                          <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="h-8 text-sm w-40"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNewName();
                              if (e.key === 'Escape') setIsEditingName(false);
                            }}
                          />
                          <Button size="sm" variant="ghost" onClick={handleSaveNewName} disabled={isSaving}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          Hi <button 
                            onClick={handleEditName}
                            className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
                          >
                            {userName}
                            <Pencil className="w-3 h-3" />
                          </button>! Tap or drag across the days you're free.
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleWithdraw}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Withdraw from trip"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
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
                      disabled={isSaveDisabled}
                      size="lg"
                      variant={hasUnsavedChanges() ? "default" : "secondary"}
                      className={`w-full px-8 font-semibold transition-all ${
                        hasUnsavedChanges() 
                          ? 'shadow-2xl hover:shadow-xl' 
                          : 'opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : hasUnsavedChanges() ? (
                        'Save Availability'
                      ) : (
                        'No Changes to Save'
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
                    {selectedParticipants.length === 0
                      ? 'Showing all participants'
                      : `Filtered to: ${selectedParticipants.join(', ')}`}
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
                    selectedParticipants={selectedParticipants}
                    participants={trip.participants}
                  />
                  
                  <div className="mt-4">
                    {/* Dynamic gradient legend */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-muted to-primary" />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>No one</span>
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
                <BestDates trip={trip} selectedParticipants={selectedParticipants} />
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
                <p className="text-xs text-muted-foreground">Click to filter by subset</p>
              </CardHeader>
              <CardContent>
                <ParticipantsList 
                  participants={trip.participants} 
                  currentUser={hasJoined ? userName : undefined}
                  selectedParticipants={selectedParticipants}
                  onToggleParticipant={handleToggleParticipant}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
