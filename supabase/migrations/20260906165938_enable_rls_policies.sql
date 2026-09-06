-- ============================================================
-- RLS: lectura publica de lo publicado, escritura solo autenticado
-- Se usa `to anon/authenticated` en vez de llamar a auth.uid()
-- para que las policies no cuesten una funcion por fila.
-- ============================================================

alter table public.series            enable row level security;
alter table public.obras             enable row level security;
alter table public.textos            enable row level security;
alter table public.musica            enable row level security;
alter table public.proyectos         enable row level security;
alter table public.proyecto_imagenes enable row level security;
alter table public.consultas         enable row level security;

-- ---------- lectura publica ----------
create policy "series visibles para todos"
  on public.series for select to anon, authenticated using (true);

create policy "obras publicadas visibles para todos"
  on public.obras for select to anon, authenticated using (publicada);

create policy "textos visibles para todos"
  on public.textos for select to anon, authenticated using (true);

create policy "musica visible para todos"
  on public.musica for select to anon, authenticated using (visible);

create policy "proyectos publicados visibles para todos"
  on public.proyectos for select to anon, authenticated using (publicado);

create policy "imagenes de proyectos publicados visibles para todos"
  on public.proyecto_imagenes for select to anon, authenticated
  using (exists (
    select 1 from public.proyectos p
    where p.id = proyecto_imagenes.proyecto_id and p.publicado
  ));

-- ---------- escritura: solo usuarios autenticados (admin) ----------
create policy "admin gestiona series"
  on public.series for all to authenticated using (true) with check (true);

create policy "admin gestiona obras"
  on public.obras for all to authenticated using (true) with check (true);

create policy "admin gestiona textos"
  on public.textos for all to authenticated using (true) with check (true);

create policy "admin gestiona musica"
  on public.musica for all to authenticated using (true) with check (true);

create policy "admin gestiona proyectos"
  on public.proyectos for all to authenticated using (true) with check (true);

create policy "admin gestiona imagenes de proyectos"
  on public.proyecto_imagenes for all to authenticated using (true) with check (true);

-- ---------- consultas: cualquiera escribe, solo admin lee ----------
create policy "cualquiera puede enviar una consulta"
  on public.consultas for insert to anon, authenticated with check (true);

create policy "admin lee y gestiona consultas"
  on public.consultas for select to authenticated using (true);

create policy "admin actualiza consultas"
  on public.consultas for update to authenticated using (true) with check (true);

create policy "admin borra consultas"
  on public.consultas for delete to authenticated using (true);
