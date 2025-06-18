-- Create expertise_tags table
CREATE TABLE IF NOT EXISTS public.expertise_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expertise_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select on expertise_tags" ON public.expertise_tags
  FOR SELECT USING (true);

-- Create mentor_expertise join table
CREATE TABLE IF NOT EXISTS public.mentor_expertise (
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.expertise_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (mentor_id, tag_id)
);
ALTER TABLE public.mentor_expertise ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor can manage own expertise" ON public.mentor_expertise
  FOR ALL USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- Create mentor_availability
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  recurrence JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor can manage availability" ON public.mentor_availability
  FOR ALL USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- Create mentor_social_links
CREATE TABLE IF NOT EXISTS public.mentor_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor can manage social links" ON public.mentor_social_links
  FOR ALL USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);

-- Create mentor_calendar_oauth
CREATE TABLE IF NOT EXISTS public.mentor_calendar_oauth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_calendar_oauth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mentor can manage calendar oauth" ON public.mentor_calendar_oauth
  FOR ALL USING (auth.uid() = mentor_id) WITH CHECK (auth.uid() = mentor_id);
