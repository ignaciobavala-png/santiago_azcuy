-- SERIES (va primero, obras la referencia)
create table if not exists series (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nombre        text not null,
  descripcion   text,
  año_inicio    integer,
  año_fin       integer,
  imagen_cover  text,
  orden         integer,
  created_at    timestamptz default now()
);

-- OBRAS
create table if not exists obras (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  titulo              text not null,
  año                 integer,
  tecnica             text,
  dimensiones         text,
  dimensiones_alto    integer,
  dimensiones_ancho   integer,
  descripcion         text,
  serie_id            uuid references series(id) on delete set null,
  publicada           boolean not null default false,
  disponible          boolean not null default false,
  precio              numeric,
  tipo_venta          text check (tipo_venta in ('original', 'print', 'ambos')),
  print_edicion       integer,
  print_stock         integer,
  print_precio        numeric,
  imagen_url          text,
  imagen_hires        text,
  blur_data_url       text,
  orden               integer,
  destacada           boolean not null default false,
  created_at          timestamptz default now()
);

-- EXPOSICIONES
create table if not exists exposiciones (
  id            uuid primary key default gen_random_uuid(),
  titulo        text not null,
  lugar         text,
  ciudad        text,
  pais          text,
  fecha_inicio  date,
  fecha_fin     date,
  tipo          text check (tipo in ('individual', 'colectiva')),
  url           text,
  created_at    timestamptz default now()
);

-- CONSULTAS
create table if not exists consultas (
  id              uuid primary key default gen_random_uuid(),
  nombre          text,
  email           text,
  telefono        text,
  obra_id         uuid references obras(id) on delete set null,
  tipo_consulta   text not null default 'general' check (tipo_consulta in ('compra', 'general', 'prensa')),
  mensaje         text,
  leido           boolean not null default false,
  created_at      timestamptz default now()
);

-- Índices útiles para queries frecuentes
create index if not exists obras_publicada_idx on obras(publicada);
create index if not exists obras_destacada_idx on obras(destacada);
create index if not exists obras_disponible_idx on obras(disponible);
create index if not exists obras_serie_id_idx on obras(serie_id);
create index if not exists obras_orden_idx on obras(orden);
create index if not exists consultas_leido_idx on consultas(leido);
