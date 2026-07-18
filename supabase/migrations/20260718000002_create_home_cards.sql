-- Fotos de las cards del home (una por sección del escritorio).
-- href es la clave que matchea SECTION_TREE (ej: '/obras', '/musica').
create table public.home_cards (
  id uuid primary key default gen_random_uuid(),
  href text not null unique,
  imagen_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.home_cards enable row level security;

create policy home_cards_public_read on public.home_cards
  for select to anon, authenticated using (true);

create policy home_cards_admin_all on public.home_cards
  for all using (auth.role() = 'service_role');
