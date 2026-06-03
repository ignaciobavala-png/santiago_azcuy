-- ═══════════════════════════════════════════════
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ═══════════════════════════════════════════════
alter table obras        enable row level security;
alter table series       enable row level security;
alter table exposiciones enable row level security;
alter table consultas    enable row level security;

-- ═══════════════════════════════════════════════
-- SERIES — lectura pública sin restricción
-- ═══════════════════════════════════════════════
create policy "series_public_read"
  on series for select
  to anon, authenticated
  using (true);

-- ═══════════════════════════════════════════════
-- EXPOSICIONES — lectura pública sin restricción
-- ═══════════════════════════════════════════════
create policy "exposiciones_public_read"
  on exposiciones for select
  to anon, authenticated
  using (true);

-- ═══════════════════════════════════════════════
-- OBRAS — solo las publicadas son visibles
-- ═══════════════════════════════════════════════
create policy "obras_public_read"
  on obras for select
  to anon, authenticated
  using (publicada = true);

-- ═══════════════════════════════════════════════
-- CONSULTAS — insert público (formulario de contacto)
--             lectura/actualización solo service_role (admin)
-- ═══════════════════════════════════════════════
create policy "consultas_public_insert"
  on consultas for insert
  to anon, authenticated
  with check (true);
