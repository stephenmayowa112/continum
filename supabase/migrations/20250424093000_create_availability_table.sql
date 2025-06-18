-- Create availability table for mentors' open slots
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free','booked','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_mentor_id ON availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_availability_start_time ON availability(start_time);

-- Enable Row Level Security
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- RLS policies
DO $$
DECLARE
  policy_exists BOOLEAN;
BEGIN
  -- Mentors can view their own availability
  SELECT EXISTS(
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability' AND policyname = 'Mentors can view own availability'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Mentors can view own availability"
      ON availability
      FOR SELECT
      USING (auth.uid()::text = mentor_id);
  END IF;

  -- Users can view free slots
  SELECT EXISTS(
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability' AND policyname = 'Users can view free slots'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Users can view free slots"
      ON availability
      FOR SELECT
      USING (status = 'free');
  END IF;

  -- Mentors can manage their slots
  SELECT EXISTS(
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability' AND policyname = 'Mentors can manage slots'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Mentors can manage slots"
      ON availability
      FOR ALL
      USING (auth.uid()::text = mentor_id)
      WITH CHECK (auth.uid()::text = mentor_id);
  END IF;

  -- Service role full access
  SELECT EXISTS(
    SELECT 1 FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'availability' AND policyname = 'Service role full access'
  ) INTO policy_exists;
  IF NOT policy_exists THEN
    CREATE POLICY "Service role full access"
      ON availability
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_availability_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  trigger_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_availability_updated_at'
      AND tgrelid = 'availability'::regclass
  ) INTO trigger_exists;
  IF NOT trigger_exists THEN
    CREATE TRIGGER update_availability_updated_at
      BEFORE UPDATE ON availability
      FOR EACH ROW
      EXECUTE PROCEDURE update_availability_updated_at();
  END IF;
END;
$$;