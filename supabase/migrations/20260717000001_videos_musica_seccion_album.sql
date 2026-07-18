-- Permite la sección 'album' en videos_musica (álbumes completos publicados en YouTube).
alter table public.videos_musica drop constraint videos_musica_seccion_check;
alter table public.videos_musica add constraint videos_musica_seccion_check
  check (seccion = any (array['videoclip'::text, 'album'::text, 'vivo'::text]));
