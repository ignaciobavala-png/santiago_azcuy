-- Tabla para leads de descarga de la novela "El Aprendiz"
create table novela_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

alter table novela_leads enable row level security;

-- Cualquier persona puede insertar su email (captura de leads)
create policy "novela_leads_public_insert"
  on novela_leads for insert
  to anon, authenticated
  with check (true);
