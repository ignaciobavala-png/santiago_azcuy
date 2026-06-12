CREATE TABLE public.hero_banner (
  id        integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  video_url text,
  poster_url text,
  activo    boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_hero_banner"
  ON public.hero_banner FOR SELECT USING (true);

CREATE POLICY "admin_all_hero_banner"
  ON public.hero_banner FOR ALL
  USING (auth.role() = 'service_role');

INSERT INTO public.hero_banner (id) VALUES (1);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('hero-videos', 'hero-videos', true, 524288000)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_hero_videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hero-videos');

CREATE POLICY "service_all_hero_videos"
  ON storage.objects FOR ALL
  USING (bucket_id = 'hero-videos' AND auth.role() = 'service_role');

CREATE POLICY "allow_signed_uploads_hero_videos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'hero-videos');
