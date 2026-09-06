-- ============================================================
-- Bucket publico de medios.
-- Estructura de paths:
--   obras/{slug}-sm.webp | -md.webp | -lg.webp
--   proyectos/{slug}/{n}-sm.webp | -md.webp | -lg.webp
--   docs/{nombre}.pdf
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'medios',
  'medios',
  true,
  10485760,  -- 10 MB por archivo: de sobra para WebP, acota PDFs
  array['image/webp','image/jpeg','image/png','image/avif','application/pdf']
)
on conflict (id) do nothing;

create policy "medios: lectura publica"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'medios');

create policy "medios: subida solo autenticado"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'medios');

create policy "medios: update solo autenticado"
  on storage.objects for update to authenticated
  using (bucket_id = 'medios') with check (bucket_id = 'medios');

create policy "medios: borrado solo autenticado"
  on storage.objects for delete to authenticated
  using (bucket_id = 'medios');
