import { supabase, isSupabaseConfigured } from './supabase';

export interface Participant {
  id?: string;
  name: string;
  availableDates: string[];
  created_at?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'trip-planner-trips';

export const generateTripId = (): string => {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
};

// LocalStorage functions (fallback)
const getTripsLocal = (): Trip[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getTripLocal = (id: string): Trip | null => {
  const trips = getTripsLocal();
  return trips.find(t => t.id === id) || null;
};

const saveTripLocal = (trip: Trip): void => {
  const trips = getTripsLocal();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  
  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

// Supabase functions
export const getTrip = async (id: string): Promise<Trip | null> => {
  if (!isSupabaseConfigured()) {
    return getTripLocal(id);
  }

  try {
    const { data, error } = await supabase!
      .from('trips')
      .select(`
        *,
        participants (
          id,
          name,
          available_dates,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      startDate: data.start_date,
      endDate: data.end_date,
      participants: (data.participants || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        availableDates: p.available_dates || [],
        created_at: p.created_at,
      })),
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching trip:', error);
    return getTripLocal(id);
  }
};

export const saveTrip = async (trip: Trip): Promise<Trip | null> => {
  if (!isSupabaseConfigured()) {
    saveTripLocal(trip);
    return trip;
  }

  try {
    const { data, error } = await supabase!
      .from('trips')
      .upsert({
        id: trip.id,
        name: trip.name,
        start_date: trip.startDate,
        end_date: trip.endDate,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Also save to localStorage as cache
    saveTripLocal(trip);
    
    return {
      ...trip,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (error) {
    console.error('Error saving trip:', error);
    saveTripLocal(trip);
    return trip;
  }
};

export const addParticipant = async (
  tripId: string,
  participant: Participant
): Promise<Trip | null> => {
  if (!isSupabaseConfigured()) {
    const trip = getTripLocal(tripId);
    if (!trip) return null;
    
    const existingIndex = trip.participants.findIndex(
      p => p.name.toLowerCase() === participant.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      trip.participants[existingIndex] = participant;
    } else {
      trip.participants.push(participant);
    }
    
    saveTripLocal(trip);
    return trip;
  }

  try {
    // Check if participant exists
    const { data: existingParticipant } = await supabase!
      .from('participants')
      .select('id')
      .eq('trip_id', tripId)
      .ilike('name', participant.name)
      .maybeSingle();

    if (existingParticipant) {
      // Update existing participant
      await supabase!
        .from('participants')
        .update({
          available_dates: participant.availableDates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingParticipant.id);
    } else {
      // Insert new participant
      await supabase!
        .from('participants')
        .insert({
          trip_id: tripId,
          name: participant.name,
          available_dates: participant.availableDates,
        });
    }

    // Fetch updated trip
    return await getTrip(tripId);
  } catch (error) {
    console.error('Error adding participant:', error);
    
    // Fallback to localStorage
    const trip = getTripLocal(tripId);
    if (!trip) return null;
    
    const existingIndex = trip.participants.findIndex(
      p => p.name.toLowerCase() === participant.name.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      trip.participants[existingIndex] = participant;
    } else {
      trip.participants.push(participant);
    }
    
    saveTripLocal(trip);
    return trip;
  }
};

export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const getAvailabilityCount = (trip: Trip): Record<string, string[]> => {
  const availability: Record<string, string[]> = {};
  const dates = getDatesBetween(trip.startDate, trip.endDate);
  
  dates.forEach(date => {
    availability[date] = trip.participants
      .filter(p => p.availableDates.includes(date))
      .map(p => p.name);
  });
  
  return availability;
};
