-- Tablas de la seccion Musica: videos, albumes y plataformas de streaming
create table videos_musica (
  id uuid primary key default gen_random_uuid(),
  seccion text not null check (seccion in ('videoclip', 'album', 'vivo')),
  youtube_id text not null,
  titulo text,
  orden integer,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table albumes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  año integer,
  portada_url text,
  spotify_url text,
  youtube_music_url text,
  apple_music_url text,
  orden integer,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table plataformas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  url text,
  orden integer,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table videos_musica enable row level security;
alter table albumes enable row level security;
alter table plataformas enable row level security;

create policy "videos_musica_public_read"
  on videos_musica for select
  to anon, authenticated
  using (true);

create policy "videos_musica_admin_all"
  on videos_musica
  to public
  using (true)
  with check (true);

create policy "albumes_public_read"
  on albumes for select
  to anon, authenticated
  using (true);

create policy "albumes_admin_all"
  on albumes
  to public
  using (true)
  with check (true);

create policy "plataformas_public_read"
  on plataformas for select
  to anon, authenticated
  using (true);

create policy "plataformas_admin_all"
  on plataformas
  to public
  using (true)
  with check (true);
