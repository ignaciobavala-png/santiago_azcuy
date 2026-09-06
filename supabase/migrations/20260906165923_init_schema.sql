-- ============================================================
-- Esquema base del sitio de Santiago Azcuy
-- 7 tablas: obras, series, textos, musica, proyectos,
--           proyecto_imagenes, consultas
-- ============================================================

-- Trigger compartido para mantener actualizado_at
create or replace function public.set_actualizado_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.actualizado_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- series: ejes tematicos. Nace vacia; Santiago los propone luego.
-- ------------------------------------------------------------
create table public.series (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  nombre        text not null,
  descripcion   text,
  orden         int  not null default 0,
  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- obras: el corazon del sitio (~150 filas al arrancar)
-- ------------------------------------------------------------
create table public.obras (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titulo        text not null,
  anio          int,
  tecnica       text,
  ancho_cm      numeric(7,2),
  alto_cm       numeric(7,2),
  categoria     text not null check (categoria in ('figurativo','abstracto','dibujo')),
  serie_id      uuid references public.series(id) on delete set null,
  es_encargo    boolean not null default false,
  destacada     boolean not null default false,
  disponible    boolean not null default true,
  publicada     boolean not null default true,
  descripcion   text,
  -- imagen: path base en storage, SIN sufijo de tamano ni extension.
  -- Los tres tamanos se derivan: {imagen}-sm.webp / -md.webp / -lg.webp
  imagen        text not null,
  imagen_w      int  not null,
  imagen_h      int  not null,
  blur          text,
  orden         int  not null default 0,
  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create index obras_categoria_idx  on public.obras (categoria) where publicada;
create index obras_serie_idx      on public.obras (serie_id)  where publicada;
create index obras_destacada_idx  on public.obras (destacada) where publicada and destacada;
create index obras_encargo_idx    on public.obras (es_encargo) where publicada and es_encargo;
create index obras_orden_idx      on public.obras (orden, creado_at desc);

-- ------------------------------------------------------------
-- textos: reemplaza biografia + institucional + dossier + novela
-- ------------------------------------------------------------
create table public.textos (
  clave         text primary key,
  titulo        text,
  contenido     text not null default '',
  actualizado_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- musica: todo embebido (Spotify / YouTube). 0 MB de storage.
-- ------------------------------------------------------------
create table public.musica (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('album','video','show')),
  titulo        text not null,
  url_embed     text not null,
  plataforma    text,
  anio          int,
  visible       boolean not null default true,
  orden         int not null default 0,
  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create index musica_tipo_idx on public.musica (tipo, orden) where visible;

-- ------------------------------------------------------------
-- proyectos + proyecto_imagenes: arquitectura (pocos, multi-imagen)
-- ------------------------------------------------------------
create table public.proyectos (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  titulo        text not null,
  ubicacion     text,
  anio          int,
  estado        text,
  descripcion   text,
  publicado     boolean not null default true,
  orden         int not null default 0,
  creado_at     timestamptz not null default now(),
  actualizado_at timestamptz not null default now()
);

create table public.proyecto_imagenes (
  id            uuid primary key default gen_random_uuid(),
  proyecto_id   uuid not null references public.proyectos(id) on delete cascade,
  imagen        text not null,
  imagen_w      int  not null,
  imagen_h      int  not null,
  blur          text,
  epigrafe      text,
  orden         int  not null default 0
);

create index proyecto_imagenes_proyecto_idx on public.proyecto_imagenes (proyecto_id, orden);

-- ------------------------------------------------------------
-- consultas: formulario de contacto
-- ------------------------------------------------------------
create table public.consultas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  email         text not null,
  mensaje       text not null,
  obra_id       uuid references public.obras(id) on delete set null,
  leida         boolean not null default false,
  creado_at     timestamptz not null default now()
);

create index consultas_creado_idx on public.consultas (creado_at desc);

-- ------------------------------------------------------------
-- triggers de actualizado_at
-- ------------------------------------------------------------
create trigger series_actualizado     before update on public.series     for each row execute function public.set_actualizado_at();
create trigger obras_actualizado      before update on public.obras      for each row execute function public.set_actualizado_at();
create trigger textos_actualizado     before update on public.textos     for each row execute function public.set_actualizado_at();
create trigger musica_actualizado     before update on public.musica     for each row execute function public.set_actualizado_at();
create trigger proyectos_actualizado  before update on public.proyectos  for each row execute function public.set_actualizado_at();
