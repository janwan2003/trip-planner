export interface Participant {
  name: string;
  availableDates: string[];
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  participants: Participant[];
}

const STORAGE_KEY = 'trip-planner-trips';

export const generateTripId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const getTrips = (): Trip[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getTrip = (id: string): Trip | null => {
  const trips = getTrips();
  return trips.find(t => t.id === id) || null;
};

export const saveTrip = (trip: Trip): void => {
  const trips = getTrips();
  const existingIndex = trips.findIndex(t => t.id === trip.id);
  
  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
};

export const addParticipant = (tripId: string, participant: Participant): Trip | null => {
  const trip = getTrip(tripId);
  if (!trip) return null;
  
  const existingIndex = trip.participants.findIndex(
    p => p.name.toLowerCase() === participant.name.toLowerCase()
  );
  
  if (existingIndex >= 0) {
    trip.participants[existingIndex] = participant;
  } else {
    trip.participants.push(participant);
  }
  
  saveTrip(trip);
  return trip;
};

export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
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
