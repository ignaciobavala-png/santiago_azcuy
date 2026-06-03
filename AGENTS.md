# AGENTS.md — Santiago Azcuy Art Platform

> Instrucciones para el agente de IA que trabaja en este proyecto.
> Leer este archivo al inicio de **cada sesión**.

---

## Contexto del proyecto

Plataforma web para el artista plástico argentino **Santiago Azcuy**.
- Galería de exposición de obra pictórica (óleos, acrílicos, técnicas mixtas)
- Tienda / consulta de compra (obras originales + prints)
- Admin panel para gestión de obras
- Estética: **oscura, editorial, galería de arte contemporánea**

Ver `plan.md` para arquitectura completa, modelo de datos y fases.

---

## Stack y convenciones

```
Framework:    Next.js 16 (App Router)
UI:           React 19 + Tailwind CSS v4 + Framer Motion v12
Estado:       Zustand v5
DB:           Supabase (PostgreSQL + Auth + Storage + RLS)
Deploy:       Vercel
Package:      pnpm
Linting:      ESLint 9 (flat config)
Lenguaje:     TypeScript strict
```

### Convenciones obligatorias

- **Server Components por defecto** — `"use client"` solo cuando hay hooks de estado/efecto o eventos del DOM
- **Path alias `@/*`** apunta a la raíz del proyecto (o `./src/*` si existe `src/`)
- **Tailwind v4**: tokens vía `@theme {}` en el CSS global, no `tailwind.config.*`
- **Animaciones**: Framer Motion v12, nunca CSS `transition` para elementos de UI principales
- **Forms**: react-hook-form + zod, nunca estado local manual para formularios
- **No Context API** para estado global — usar Zustand v5
- **Imágenes**: siempre `next/image` con `sizes` y `placeholder="blur"`
- **Migraciones**: archivos `.sql` en `supabase/migrations/`, nunca modificar tablas por dashboard

### Estructura de carpetas esperada

```
app/
  (public)/           # Rutas públicas sin auth
  (admin)/            # Rutas admin con auth guard
  api/                # Route Handlers
components/
  ui/                 # Átomos reutilizables (Button, Input, etc.)
  gallery/            # GalleryGrid, ObraCard, ObraViewer, HeroCarousel
  layout/             # Header, Footer, SectionReveal
  admin/              # Formularios y tablas del panel admin
lib/
  supabase/           # createClient (browser + server), tipos generados
  utils.ts
supabase/
  migrations/         # Archivos SQL planos
types/
  database.ts         # Tipos generados por Supabase CLI
```

---

## Sistema de diseño

### Paleta (tokens `@theme`)

```css
--color-background: #0a0a0a;
--color-surface:    #141414;
--color-border:     #2a2a2a;
--color-text:       #e8e4dc;
--color-muted:      #6b6560;
--color-accent:     #c9a87c;
--color-danger:     #a05040;
```

### Tipografía

- **Display / títulos**: `Cormorant Garamond` (Google Fonts vía `next/font`)
- **UI / cuerpo**: `DM Sans` (Google Fonts vía `next/font`)

---

## Base de datos

### Tablas principales

- `obras` — obra pictórica (slug, titulo, año, tecnica, dimensiones, imagen_url, disponible, precio, serie_id)
- `series` — colecciones de obras
- `exposiciones` — historial expositivo del artista
- `consultas` — mensajes de contacto / consultas de compra

Ver `plan.md` sección 4 para esquema completo.

### RLS

- **Configurar RLS en Fase 3**, no en setup inicial — evita bloqueos de queries en desarrollo
- Lectura pública: `obras` (donde `publicada = true`), `series`, `exposiciones`
- Escritura: solo autenticado con rol `admin`
- `consultas`: insert público, select/update solo admin
- **`SUPABASE_SERVICE_ROLE_KEY`** solo en Server Actions y Route Handlers. Nunca en `"use client"` ni en `NEXT_PUBLIC_*`.

### Storage

- Bucket: `obras` (público para lecturas)
- Path: `{obra_id}/original.webp` y `{obra_id}/thumb.webp`
- **Pipeline de upload**: Server Action → `sharp` (resize + conversión WebP + generación de base64 10x10 para `blur_data_url`) → Supabase Storage
- Límite de upload: 20MB. Imágenes originales pueden ser TIF/JPG escaneados.

---

## Librerías multimedia

| Librería | Propósito |
|---------|-----------|
| `embla-carousel-react` | Hero carousel, slideshow de series |
| `react-medium-image-zoom` | Zoom in obra en detalle |
| `framer-motion` v12 | Animaciones de página, reveal, transiciones |
| `@vercel/og` | OG images dinámicas |

---

## Reglas de calidad

1. **No hay tests** en este proyecto — verificar funcionalidad corriendo el dev server
2. **No Docker** — usar Supabase cloud en desarrollo y producción
3. No escribir comentarios obvios en el código — solo si el WHY no es obvio
4. Cada ruta pública debe tener `generateMetadata` con OG image
5. Toda imagen en Storage debe cargarse con `next/image`, nunca con `<img>`
6. Los Server Actions van en archivos `actions.ts` dentro de cada feature folder
7. Los tipos de la DB se generan con `pnpm supabase gen types` y nunca se editan a mano

---

## Comandos frecuentes

```bash
pnpm dev                          # Dev server
pnpm build                        # Build de producción
pnpm supabase start               # Supabase local (si se usa local)
pnpm supabase gen types --local > types/database.ts   # Regenerar tipos
pnpm supabase db push             # Aplicar migraciones a remoto
```

---

## Estado actual del proyecto

### ✅ Completado

- **Fase 1 — Fundación**
  - Schema BD: `obras`, `series`, `exposiciones`, `consultas`, `biografia`
  - Storage bucket `obras` (público, 20MB, WebP/JPG/PNG/TIFF)
  - RLS habilitado con políticas de lectura pública
  - Clientes Supabase SSR (`client.ts`, `server.ts` con `createAdminClient`)
  - Tipos TypeScript generados desde schema real (`types/database.ts`)
  - Sistema de diseño: tokens `@theme`, fuentes Cormorant + DM Sans
  - Layout global con Header y Footer
  - `vercel.json` con cron keep-alive cada 3 días (`/api/keepalive`)

- **Fase 2 — Galería pública**
  - `/obras` — galería con filtros por serie/técnica/disponibilidad (nuqs)
  - `/obras/[slug]` — detalle con `next/image`, blur placeholder, CTA de compra
  - `/series` y `/series/[slug]` — series conectadas a BD
  - `/sobre` — bio desde BD + exposiciones reales (individuales/colectivas)
  - `ObraCard` con `next/image` y blur placeholder
  - `lib/supabase/queries.ts` — helpers tipados para todas las queries públicas
  - Home conectada a BD via `getSeriesConObras`, fallback para BD vacía
  - Logo `new_logo.png` en hero (blanco, doble tamaño)

- **Admin — parcial**
  - `/admin/obras/nueva` — upload real con `sharp` (WebP 2400px, calidad 85, blur_data_url)
  - `/admin/biografia` — bio y exposiciones editables, guardado real en Supabase

---

### 🔄 Pendiente para próxima sesión

#### Variables de entorno (URGENTE antes de deploy)
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (sin esto el admin no funciona)
- [ ] Agregar `CRON_SECRET` en `.env.local` (valor ya generado: `26e54abfe9fa894ea7d82d3fd2b152ba1e524b492ba07f51397666d235e25229`)

#### Deploy Vercel
- [ ] Crear proyecto en Vercel vinculado al repo `ignaciobavala-png/santiago_azcuy`
- [ ] Cargar las 5 variables de entorno en Vercel (URL, ANON_KEY, SERVICE_ROLE, CRON_SECRET, SITE_URL)
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` con la URL de Vercel después del primer deploy

#### Admin panel — pendiente de conectar
- [ ] `/admin` (dashboard) — lista de obras con acciones publicar/despublicar
- [ ] `/admin/obras` — listado real desde BD (actualmente stub)
- [ ] `/admin/colecciones` — CRUD de series conectado a Supabase (actualmente mock)
- [ ] `/admin/colecciones/nueva` — formulario de nueva serie con imagen cover
- [ ] `/admin/contacto` — bandeja de consultas recibidas (actualmente stub)

#### Fase 3 — Contacto y venta
- [ ] `/contacto` — formulario real (react-hook-form + zod), pre-completado con `?obra=slug`
- [ ] `app/api/contact/route.ts` — guarda en `consultas` + email con Resend al artista
- [ ] OG images dinámicas (`app/api/og/route.ts`) para obras y series

#### Fase 5 — Pulido
- [ ] Animaciones Framer Motion (reveal al scroll, transiciones de página)
- [ ] `generateMetadata` completo en todas las rutas con OG image dinámica
- [ ] `sitemap.xml` generado dinámicamente desde Supabase
- [ ] Dominio custom en Vercel

---

## Skills de referencia (brain-data)

- `nextjs-app-router-patterns` — patrones de App Router, Server Components
- `supabase-postgres-best-practices` — schema, RLS, queries optimizadas
- `supabase-oauth-nextjs` — si se añade OAuth en el futuro
- `tailwindcss-mobile-first` — Tailwind v4, tokens, responsive
- `vercel-react-best-practices` — performance, optimización Vercel
