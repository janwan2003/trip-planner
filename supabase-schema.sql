-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id TEXT NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  available_dates TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trip_id, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participants_trip_id ON participants(trip_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since trips are meant to be shared)
-- Anyone can read trips
CREATE POLICY "Trips are publicly readable" ON trips
  FOR SELECT USING (true);

-- Anyone can create trips
CREATE POLICY "Anyone can create trips" ON trips
  FOR INSERT WITH CHECK (true);

-- Anyone can update trips
CREATE POLICY "Anyone can update trips" ON trips
  FOR UPDATE USING (true);

-- Anyone can read participants
CREATE POLICY "Participants are publicly readable" ON participants
  FOR SELECT USING (true);

-- Anyone can create participants
CREATE POLICY "Anyone can create participants" ON participants
  FOR INSERT WITH CHECK (true);

-- Anyone can update participants
CREATE POLICY "Anyone can update participants" ON participants
  FOR UPDATE USING (true);

-- Anyone can delete participants
CREATE POLICY "Anyone can delete participants" ON participants
  FOR DELETE USING (true);
