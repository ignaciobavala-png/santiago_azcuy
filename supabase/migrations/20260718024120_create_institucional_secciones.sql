-- Contenido editable de la pagina /institucional.
-- Cada slug almacena una seccion distinta como JSONB.
create table institucional_secciones (
  slug text primary key,
  datos jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table institucional_secciones enable row level security;

create policy "institucional_public_read"
  on institucional_secciones for select
  to anon, authenticated
  using (true);

create policy "institucional_admin_all"
  on institucional_secciones
  to service_role
  using (true)
  with check (true);
