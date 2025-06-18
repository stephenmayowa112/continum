-- Add slot_id to bookings to reference availability
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS slot_id UUID;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings(slot_id);

-- Update RLS if needed (service role keeps full access)
-- No new policies required for SELECT/INSERT since slot_id is managed server-side