-- Contenido editable del dossier "Espiral Virtuosa" (/dossier).
-- Cada slug almacena una seccion distinta como JSONB.
create table dossier_secciones (
  slug text primary key,
  datos jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table dossier_secciones enable row level security;

create policy "dossier_public_read"
  on dossier_secciones for select
  to anon, authenticated
  using (true);

create policy "dossier_admin_all"
  on dossier_secciones
  to service_role
  using (true)
  with check (true);
