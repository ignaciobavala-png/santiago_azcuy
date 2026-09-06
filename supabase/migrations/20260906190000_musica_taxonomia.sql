-- ------------------------------------------------------------
-- musica: taxonomia real del material de Santiago.
--
-- El check original ('album','video','show') no distinguia entre un album de
-- 38 minutos y un videoclip de 3, que en la pagina son bloques distintos.
-- Tampoco habia donde guardar la duracion, que es justo el dato que decide si
-- alguien le da play desde el telefono.
--
-- `url_embed` pasa a `recurso` porque ya no guarda una URL sino el id de la
-- entidad (video de YouTube o album/artista de Spotify). El front arma la URL
-- del iframe y la de la miniatura a partir del id; guardando la URL entera no
-- se podia derivar la miniatura sin volver a parsearla.
-- ------------------------------------------------------------

alter table public.musica rename column url_embed to recurso;

alter table public.musica drop constraint musica_tipo_check;

alter table public.musica
  add constraint musica_tipo_check
  check (tipo in ('album', 'clip', 'tema', 'entrevista'));

alter table public.musica
  add column if not exists duracion text,
  add column if not exists descripcion text;

comment on column public.musica.recurso is
  'Id de la entidad, no una URL: videoId de YouTube o id de album/artista de Spotify.';
comment on column public.musica.duracion is
  'Como la muestra la plataforma: "38:44", "7:37:03".';
