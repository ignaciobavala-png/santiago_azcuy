-- Contenido editable de la pagina /el-aprendiz.
-- Single-row: titulo, subtitulo, descripcion, portada y Spotify embed.
create table novela_contenido (
  id integer primary key default 1 check (id = 1),
  titulo text,
  subtitulo text,
  descripcion text,
  portada_url text,
  spotify_show_id text,
  updated_at timestamptz not null default now()
);

alter table novela_contenido enable row level security;

create policy "novela_contenido_public_read"
  on novela_contenido for select
  to anon, authenticated
  using (true);

create policy "novela_contenido_admin_all"
  on novela_contenido
  to service_role
  using (true)
  with check (true);
