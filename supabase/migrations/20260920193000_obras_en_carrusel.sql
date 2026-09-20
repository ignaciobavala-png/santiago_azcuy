-- "Destacada" es un tag propio de Santiago (destacar la obra), no significa
-- "mostrar en el carrusel del home" aunque hoy sea la unica que lo usa. Se
-- separa en su propio campo para no forzarle un significado que no tiene.
-- Se arranca copiando el valor de `destacada`: hoy es lo unico que decide
-- que sale en el carrusel, asi que la seleccion actual del sitio en vivo no
-- se pierde con el cambio.
alter table public.obras
  add column en_carrusel boolean not null default false;

update public.obras set en_carrusel = destacada;
