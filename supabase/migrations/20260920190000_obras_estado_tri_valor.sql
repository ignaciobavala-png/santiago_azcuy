-- Reemplaza el boolean `disponible` por un estado de tres valores: el panel
-- necesita distinguir una obra vendida de una que simplemente no esta a la
-- venta, y un solo booleano no alcanza para eso.
alter table public.obras
  add column estado text not null default 'disponible'
  check (estado = any (array['disponible'::text, 'vendido'::text, 'no_disponible'::text]));

update public.obras
  set estado = case when disponible then 'disponible' else 'no_disponible' end;

alter table public.obras drop column disponible;
