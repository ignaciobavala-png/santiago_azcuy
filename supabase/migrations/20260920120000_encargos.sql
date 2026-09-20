-- ============================================================
-- MIGRACIÓN — Formulario de Proyectos por Encargo (sitio santi-art).
--
-- Proyecto Supabase: addlscvfjlslnseyfxpi
-- Ejecutar el script COMPLETO (todas las sentencias). Es idempotente:
-- usa ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS / ON CONFLICT,
-- así que correrlo dos veces no rompe nada.
--
-- Crea o modifica:
--   1. columnas de encargo en public.consultas
--   2. tabla public.consulta_archivos (+ RLS)
--   3. bucket privado de Storage "encargos"
--
-- No requiere la CLI de Supabase: alcanza con ejecutar el SQL contra la base
-- (MCP: apply_migration o execute_sql).
-- ============================================================
-- Formulario de Proyectos por Encargo.
--
-- Reusa la tabla `consultas` (misma bandeja del panel) y le suma los campos
-- propios del encargo. Las dos clases de mensaje se distinguen por `clase`:
-- 'consulta' es el contacto general / por obra, 'encargo' es este formulario.
--
-- Las referencias que sube la persona van a un bucket PRIVADO: son bocetos de
-- un proyecto que todavia no existe y no tienen por que quedar publicos como
-- las imagenes de obras. El panel las lee con URLs firmadas.
-- ============================================================

alter table public.consultas
  add column if not exists clase         text not null default 'consulta'
    check (clase in ('consulta', 'encargo')),
  add column if not exists whatsapp      text,
  add column if not exists ciudad        text,
  add column if not exists pais          text,
  add column if not exists tipo_proyecto text
    check (tipo_proyecto in ('pintura', 'dibujo', 'diseno', 'mural', 'exposicion', 'otro')),
  add column if not exists tipo_otro     text,
  add column if not exists destino       text
    check (destino in ('residencia', 'comercial', 'institucion', 'publico', 'galeria', 'otro')),
  add column if not exists destino_otro  text,
  add column if not exists referencias   text;

-- ------------------------------------------------------------
-- Adjuntos del encargo: una fila por imagen de referencia.
-- El path es la clave en Storage ("encargos/{uuid}/{n}.webp").
-- ------------------------------------------------------------
create table if not exists public.consulta_archivos (
  id          uuid primary key default gen_random_uuid(),
  consulta_id uuid not null references public.consultas(id) on delete cascade,
  path        text not null,
  nombre      text,
  bytes       int,
  tipo        text,
  creado_at   timestamptz not null default now()
);

create index if not exists consulta_archivos_consulta_idx
  on public.consulta_archivos (consulta_id);

alter table public.consulta_archivos enable row level security;

-- Solo el admin (via service key en el server del panel) toca esta tabla.
drop policy if exists "admin gestiona archivos de consulta" on public.consulta_archivos;
create policy "admin gestiona archivos de consulta"
  on public.consulta_archivos for all to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- Bucket privado para las referencias. Sin policies: se sube con URLs
-- firmadas desde el server y se lee con URLs firmadas desde el panel. El
-- bucket publico `medios` queda para lo que si es publico.
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'encargos',
  'encargos',
  false,
  15728640,  -- 15 MB por archivo: de sobra para un WebP comprimido en el navegador
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
on conflict (id) do nothing;
