-- Pool de banners de video para el fondo del sitio
create table banners (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  video_url text not null,
  poster_url text,
  orden integer,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table banners enable row level security;

create policy "banners_public_read"
  on banners for select
  to anon, authenticated
  using (true);

create policy "banners_admin_all"
  on banners
  to public
  using (true)
  with check (true);
