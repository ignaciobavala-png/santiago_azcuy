-- Market: datos bancarios nacional / internacional, opciones de pago por obra
-- y mail al comprador cuando se confirma el pago.

-- Datos bancarios. Viven en market_config (sin acceso anon): el servidor los
-- entrega recien despues de crear un pedido, nunca en el catalogo publico.
alter table public.market_config
  add column datos_nacional jsonb not null default '{"activo":false}'::jsonb,
  add column datos_internacional jsonb not null default '{"activo":false}'::jsonb,
  add column mail_pago_confirmado boolean not null default true;

-- Que opciones de pago acepta cada obra. Por defecto, ambas.
alter table public.obras
  add column pago_nacional boolean not null default true,
  add column pago_internacional boolean not null default true;

-- Desde donde paga el comprador y ultimo estado del que ya se aviso por mail.
alter table public.market_pedidos
  add column region text check (region in ('nacional','internacional')),
  add column idioma text not null default 'es' check (idioma in ('es','en')),
  add column mail_estado_enviado text;
