-- Create itineraries table for storing and sharing generated travel plans
CREATE TABLE public.itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex') UNIQUE,
  destination TEXT NOT NULL,
  days INTEGER NOT NULL DEFAULT 3,
  preferences JSONB DEFAULT '{}',
  itinerary_data JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- Anyone can read (for shared links)
CREATE POLICY "Itineraries are publicly readable"
ON public.itineraries
FOR SELECT
USING (true);

-- Anyone can create (no auth needed)
CREATE POLICY "Anyone can create itineraries"
ON public.itineraries
FOR INSERT
WITH CHECK (true);

-- Index for share_id lookups
CREATE INDEX idx_itineraries_share_id ON public.itineraries (share_id);