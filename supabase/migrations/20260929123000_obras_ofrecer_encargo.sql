-- "Ofrecer por encargo": Santiago elige que obras se ofrecen como modelo para
-- encargar. Esas obras se muestran solo en la seccion Encargos de la galeria y
-- no se mezclan con las categorias.
-- No se reusa `es_encargo`: ese campo es el origen de la obra (se hizo por
-- encargo: murales, customizados) y marca 105 obras que tienen que seguir en
-- sus categorias. Arranca en false: la seleccion la hace Santiago desde el panel.
alter table public.obras
  add column ofrecer_encargo boolean not null default false;
