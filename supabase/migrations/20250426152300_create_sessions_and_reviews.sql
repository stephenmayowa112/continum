-- Create sessions table
CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.mentees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  meeting_link TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.mentees(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.mentoring_sessions(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Mentors can view their own sessions"
  ON public.mentoring_sessions
  FOR SELECT
  USING (mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()));

CREATE POLICY "Mentees can view their own sessions"
  ON public.mentoring_sessions
  FOR SELECT
  USING (mentee_id IN (SELECT id FROM public.mentees WHERE user_id = auth.uid()));

CREATE POLICY "Mentees can insert sessions"
  ON public.mentoring_sessions
  FOR INSERT
  WITH CHECK (mentee_id IN (SELECT id FROM public.mentees WHERE user_id = auth.uid()));

CREATE POLICY "Mentors and mentees can update their own sessions"
  ON public.mentoring_sessions
  FOR UPDATE
  USING (
    mentor_id IN (SELECT id FROM public.mentors WHERE user_id = auth.uid()) OR
    mentee_id IN (SELECT id FROM public.mentees WHERE user_id = auth.uid())
  );

-- Reviews policies
CREATE POLICY "Mentees can insert reviews for sessions they attended"
  ON public.mentor_reviews
  FOR INSERT
  WITH CHECK (mentee_id IN (SELECT id FROM public.mentees WHERE user_id = auth.uid()));

CREATE POLICY "Mentees can update their own reviews"
  ON public.mentor_reviews
  FOR UPDATE
  USING (mentee_id IN (SELECT id FROM public.mentees WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view reviews"
  ON public.mentor_reviews
  FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentor_id ON public.mentoring_sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_mentee_id ON public.mentoring_sessions(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentoring_sessions_status ON public.mentoring_sessions(status);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor_id ON public.mentor_reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentee_id ON public.mentor_reviews(mentee_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_session_id ON public.mentor_reviews(session_id);

-- Add triggers to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_mentoring_sessions
BEFORE UPDATE ON public.mentoring_sessions
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_mentor_reviews
BEFORE UPDATE ON public.mentor_reviews
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to calculate mentor stats (avg rating, total sessions)
CREATE OR REPLACE FUNCTION get_mentor_stats(mentor_id UUID)
RETURNS TABLE (
  avg_rating NUMERIC,
  total_reviews BIGINT,
  total_sessions BIGINT,
  completed_sessions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(r.rating), 0)::NUMERIC as avg_rating,
    COUNT(DISTINCT r.id) as total_reviews,
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sessions
  FROM
    public.mentors m
    LEFT JOIN public.mentoring_sessions s ON m.id = s.mentor_id
    LEFT JOIN public.mentor_reviews r ON m.id = r.mentor_id
  WHERE
    m.id = mentor_id;
END;
$$ LANGUAGE plpgsql;