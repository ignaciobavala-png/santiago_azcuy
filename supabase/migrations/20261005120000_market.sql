-- Market: pedidos coordinados por email, sin pasarela de pago.
alter table public.obras
  add column para_venta boolean not null default false,
  add column precio numeric(12,2),
  add column moneda text not null default 'USD' check (moneda in ('USD','ARS')),
  add constraint obras_precio_venta_check check (precio is null or precio > 0);
alter table public.obras add constraint obras_venta_requiere_precio check (not para_venta or precio is not null);
alter table public.consultas alter column email drop not null;

create table public.market_config (
  id boolean primary key default true check (id),
  emails_aviso text not null default '',
  instrucciones_pago text not null default '',
  porcentajes_senia jsonb not null default '{"figurativo":30,"abstracto":30,"dibujo":30,"encargos":30}'::jsonb,
  actualizado_at timestamptz not null default now()
);
insert into public.market_config (id) values (true) on conflict (id) do nothing;
alter table public.market_config enable row level security;
revoke all on public.market_config from anon, authenticated;
grant all on public.market_config to service_role;
create trigger market_config_actualizado before update on public.market_config
  for each row execute function public.set_actualizado_at();

create table public.market_pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
  nombre text not null,
  email text,
  telefono text not null,
  ciudad text,
  pais text,
  mensaje text,
  origen text not null default 'carrito' check (origen in ('carrito','encargo')),
  estado text not null default 'nuevo' check (estado in ('nuevo','contactado','esperando_senia','reservado','pagado','cerrado','cancelado')),
  total numeric(12,2) not null default 0,
  senia_total numeric(12,2) not null default 0,
  moneda text not null default 'USD' check (moneda in ('USD','ARS')),
  creado_at timestamptz not null default now()
);
create index market_pedidos_creado_idx on public.market_pedidos (creado_at desc);
alter table public.market_pedidos enable row level security;
revoke all on public.market_pedidos from anon, authenticated;
grant all on public.market_pedidos to service_role;
-- Las transiciones se validan en la función de servidor de abajo.

create table public.market_pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.market_pedidos(id) on delete cascade,
  obra_id uuid references public.obras(id) on delete set null,
  titulo text not null,
  slug text,
  categoria text not null,
  precio numeric(12,2) not null,
  moneda text not null check (moneda in ('USD','ARS')),
  porcentaje_senia numeric(5,2) not null default 30 check (porcentaje_senia between 0 and 100),
  importe_senia numeric(12,2) not null default 0 check (importe_senia >= 0),
  creado_at timestamptz not null default now()
);
create index market_pedido_items_pedido_idx on public.market_pedido_items (pedido_id);
alter table public.market_pedido_items enable row level security;
revoke all on public.market_pedido_items from anon, authenticated;
grant all on public.market_pedido_items to service_role;

-- Las altas públicas se hacen solo desde el servidor con service role, luego de
-- validar obras, precios y campos. No se habilita INSERT público directo.

create or replace function public.cambiar_estado_market_pedido(p_pedido uuid, p_estado text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actual text;
  v_obra record;
begin
  if p_estado not in ('nuevo','contactado','esperando_senia','reservado','pagado','cerrado','cancelado') then
    raise exception 'Estado no valido';
  end if;
  select estado into v_actual from public.market_pedidos where id = p_pedido for update;
  if not found then raise exception 'Pedido inexistente'; end if;
  if v_actual = 'pagado' and p_estado not in ('pagado','cerrado') then
    raise exception 'Un pedido pagado no puede volver a un estado anterior';
  end if;
  if v_actual in ('cancelado','cerrado') and p_estado <> v_actual then
    raise exception 'El pedido ya esta cerrado';
  end if;
  if (v_actual = 'nuevo' and p_estado not in ('nuevo','contactado','esperando_senia','reservado','cancelado'))
    or (v_actual = 'contactado' and p_estado not in ('contactado','esperando_senia','reservado','cancelado'))
    or (v_actual = 'esperando_senia' and p_estado not in ('esperando_senia','reservado','cancelado'))
    or (v_actual = 'reservado' and p_estado not in ('reservado','pagado','cancelado'))
    or (v_actual = 'pagado' and p_estado not in ('pagado','cerrado')) then
    raise exception 'Transicion de estado no permitida';
  end if;

  if p_estado = 'reservado' and v_actual <> 'reservado' then
    if exists (select 1 from public.market_pedido_items where pedido_id = p_pedido and obra_id is null) then
      raise exception 'Una obra del pedido ya no existe';
    end if;
    for v_obra in select o.id, o.estado, o.para_venta, o.publicada
      from public.market_pedido_items i
      join public.obras o on o.id = i.obra_id
      where i.pedido_id = p_pedido order by o.id for update of o
    loop
      if not v_obra.publicada or not v_obra.para_venta or v_obra.estado <> 'disponible' then
        raise exception 'Una de las obras ya no esta disponible';
      end if;
    end loop;
    update public.obras o set estado = 'no_disponible'
      where o.id in (select obra_id from public.market_pedido_items where pedido_id = p_pedido and obra_id is not null);
  end if;

  if p_estado = 'pagado' and v_actual <> 'pagado' then
    if exists (select 1 from public.market_pedido_items where pedido_id = p_pedido and obra_id is not null) and v_actual <> 'reservado' then
      raise exception 'Primero confirmá la seña y reservá las obras';
    end if;
    update public.obras o set estado = 'vendido', para_venta = false
      where o.id in (select obra_id from public.market_pedido_items where pedido_id = p_pedido and obra_id is not null);
  end if;

  if p_estado = 'cancelado' and v_actual = 'reservado' then
    update public.obras o set estado = 'disponible'
      where o.id in (select obra_id from public.market_pedido_items where pedido_id = p_pedido and obra_id is not null)
        and o.estado = 'no_disponible' and o.para_venta = true;
  end if;
  update public.market_pedidos set estado = p_estado where id = p_pedido;
end;
$$;
revoke all on function public.cambiar_estado_market_pedido(uuid,text) from public, anon, authenticated;
grant execute on function public.cambiar_estado_market_pedido(uuid,text) to service_role;
