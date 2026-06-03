# Santiago Azcuy — Plataforma artística

Sitio web para el artista plástico argentino **Santiago Azcuy**. Galería de exposición, consulta de obra y panel de administración.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 + Framer Motion v12 |
| DB + Auth | Supabase (PostgreSQL + Storage + RLS) |
| Deploy | Vercel |
| Package manager | pnpm |
| Lenguaje | TypeScript strict |

## Estructura de rutas

```
/                   → Home con series y obras destacadas
/obras              → Galería completa con filtros (serie, técnica, disponibilidad)
/obras/[slug]       → Detalle de obra — imagen, ficha técnica, consulta de compra
/series             → Listado de series / colecciones
/series/[slug]      → Serie con todas sus obras
/sobre              → Bio del artista + historial de exposiciones
/contacto           → Formulario de contacto y consulta de compra
/admin/*            → Panel de administración (acceso sin auth en período de prueba)
```

## Variables de entorno

Crear `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Base de datos

Las migraciones están en `supabase/migrations/`. Para aplicar en un proyecto nuevo:

```bash
# Aplicar migraciones via Supabase CLI
pnpm supabase db push

# Regenerar tipos TypeScript
pnpm supabase gen types --local > types/database.ts
```

## Estado del proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 — Fundación | Setup Next.js, Supabase schema, Storage bucket, RLS | ✅ Completa |
| 2 — Galería pública | Obras, series, sobre el artista, filtros | ✅ Completa |
| 3 — Contacto y venta | Formulario de consulta, email (Resend), OG images | 🔄 En progreso |
| 4 — Admin panel | CRUD de obras, series, exposiciones, bandeja de consultas | ⏳ Pendiente |
| 5 — Pulido y deploy | Animaciones Framer Motion, SEO completo, deploy Vercel | ⏳ Pendiente |
