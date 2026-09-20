-- ============================================================
-- Seccion "Sobre": galeria de fotos/videos + bloque de biografia
--
-- Hoy la pagina publica es un placeholder ("en construccion") sin ningun
-- lugar donde Santiago pueda cargar material. Esto agrega:
--   1. public.sobre_media: fotos (suben a Storage, 3 tamanos como obras) y
--      videos (solo se pega el link de YouTube/Vimeo, sin subir archivo).
--   2. la clave 'biografia' en public.textos, que ya es el mecanismo
--      existente para bloques largos editables (ver lib/consultas.ts texto()
--      y el panel /admin/textos -> "Bloques largos").
-- ============================================================

create table public.sobre_media (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('foto', 'video')),
  -- foto: path base en storage (bucket "medios"), igual que obras.imagen.
  imagen        text,
  imagen_w      int,
  imagen_h      int,
  blur          text,
  -- video: URL pegada tal cual por Santiago (YouTube o Vimeo).
  video_url     text,
  epigrafe      text,
  publicada     boolean not null default true,
  orden         int not null default 0,
  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now(),
  constraint sobre_media_forma check (
    (tipo = 'foto'  and imagen is not null and imagen_w is not null and imagen_h is not null and video_url is null)
    or
    (tipo = 'video' and video_url is not null and imagen is null)
  )
);

create index sobre_media_orden_idx on public.sobre_media (orden, creado_at) where publicada;

create trigger sobre_media_actualizado before update on public.sobre_media
  for each row execute function public.set_actualizado_at();

alter table public.sobre_media enable row level security;

create policy "sobre_media publicada visible para todos"
  on public.sobre_media for select to anon, authenticated using (publicada);

create policy "admin gestiona sobre_media"
  on public.sobre_media for all to authenticated using (true) with check (true);

-- Biografia: mismo mecanismo que 'statement' (home) y 'libro.sinopsis'. Vacia
-- de entrada: si Santiago no cargo nada, la pagina cae en el texto de fabrica
-- del diccionario (lib/i18n.ts -> sobre.nota).
insert into public.textos (clave, titulo, contenido) values
  ('biografia', 'Biografía', '')
on conflict (clave) do nothing;
