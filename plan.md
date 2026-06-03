# Plan — Santiago Azcuy Art Platform

> Plataforma editorial de exposición y venta de obra pictórica del artista argentino Santiago Azcuy.
> Estética: oscura, elegante, de galería de arte contemporánea.

---

## 1. Visión del producto

Una plataforma web de alta gama que actúa como:
- **Galería online**: exposición de obras con experiencia visual de museo
- **Tienda**: venta directa o por contacto (obras originales + prints)
- **Portafolio profesional**: bio, statement, prensa, exposiciones

Referentes estéticos: Gagosian Gallery, pace gallery, Mubi.

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind v4 + Framer Motion v12 |
| DB + Auth | Supabase (PostgreSQL + Auth + Storage + RLS) |
| Deploy | Vercel |
| Package manager | pnpm |
| Lenguaje | TypeScript strict |
| Estado global | Zustand v5 |
| Linting | ESLint 9 (flat config) |

### Librerías multimedia y galería

| Librería | Uso |
|---------|-----|
| `embla-carousel-react` | Carousel principal de obras + slideshow hero |
| `react-medium-image-zoom` | Zoom de alta resolución en detalle de obra |
| `framer-motion` v12 | Transiciones de página, entrada de elementos, cursor personalizado |
| `react-intersection-observer` | Scroll-triggered reveals en galería (más liviano que solo FM) |
| `nuqs` | Estado de filtros de galería sincronizado con URL search params |
| `@vercel/og` + Satori | OG images dinámicas (usar fuente subset para Edge Runtime) |
| `sharp` | Procesamiento de imágenes en upload (conversión a WebP, resize) |
| Supabase Storage + Next.js `<Image>` | Hosting y optimización de imágenes |

> **Nota sobre Framer Motion v12 + React 19**: `AnimatePresence` y `layout` animations funcionan, pero evitar `layoutId` en listas con Suspense boundaries — puede causar jank. Testar animaciones de galería con datos reales antes de Fase 5.

---

## 3. Arquitectura de rutas (App Router)

```
app/
├── (public)/
│   ├── page.tsx                    # Home — hero fullscreen + obras destacadas
│   ├── obras/
│   │   ├── page.tsx                # Galería completa con filtros
│   │   └── [slug]/page.tsx         # Detalle de obra — imagen fullbleed + info + zoom
│   ├── series/
│   │   ├── page.tsx                # Colecciones / series del artista
│   │   └── [slug]/page.tsx         # Serie con todas sus obras
│   ├── sobre/page.tsx              # Bio + statement + exposiciones
│   ├── contacto/page.tsx           # Formulario de contacto / consulta de compra
│   └── tienda/
│       ├── page.tsx                # Catálogo de piezas disponibles para venta
│       └── [slug]/page.tsx         # Ficha de venta — precio, dimensiones, envío
│
├── (admin)/
│   ├── layout.tsx                  # Auth guard — solo admin autenticado
│   ├── dashboard/page.tsx          # Panel principal
│   ├── obras/
│   │   ├── page.tsx                # Lista de obras con acciones
│   │   ├── nueva/page.tsx          # Formulario de carga de obra
│   │   └── [id]/editar/page.tsx    # Edición de obra existente
│   └── mensajes/page.tsx           # Mensajes de contacto / consultas de compra
│
└── api/
    ├── og/route.ts                 # OG image dinámica
    └── contact/route.ts            # Envío de formulario de contacto (Resend)
```

---

## 4. Modelo de datos (Supabase)

### `obras`
```sql
id              uuid PK
slug            text UNIQUE NOT NULL
titulo          text NOT NULL
año             integer
tecnica         text                  -- "Óleo sobre tela", "Acrílico", etc.
dimensiones     text                  -- "100 x 80 cm" (texto display)
dimensiones_alto  integer             -- cm, para filtros y cálculo de envío
dimensiones_ancho integer             -- cm
descripcion     text
serie_id        uuid FK → series
publicada       boolean DEFAULT false -- controla visibilidad pública (RLS)
disponible      boolean DEFAULT false -- está a la venta
precio          numeric               -- null = consultar precio
tipo_venta      text                  -- 'original' | 'print' | 'ambos'
print_edicion   integer               -- nº de edición limitada (nullable)
print_stock     integer               -- unidades disponibles (nullable)
print_precio    numeric               -- precio del print si difiere (nullable)
imagen_url      text                  -- URL de Supabase Storage (WebP optimizado)
imagen_hires    text                  -- Opcional: versión alta resolución
blur_data_url   text                  -- base64 tiny para placeholder="blur"
orden           integer               -- Para ordenar en galería
destacada       boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

### `series`
```sql
id            uuid PK
slug          text UNIQUE NOT NULL
nombre        text NOT NULL
descripcion   text
año_inicio    integer
año_fin       integer
imagen_cover  text
orden         integer
```

### `exposiciones`
```sql
id            uuid PK
titulo        text NOT NULL
lugar         text
ciudad        text
pais          text
fecha_inicio  date
fecha_fin     date
tipo          text     -- 'individual' | 'colectiva'
url           text
```

### `consultas`
```sql
id              uuid PK
nombre          text
email           text
telefono        text                  -- opcional, útil para seguimiento
obra_id         uuid FK → obras (nullable)
tipo_consulta   text DEFAULT 'general' -- 'compra' | 'general' | 'prensa'
mensaje         text
leido           boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

---

## 5. Sistema de diseño

### Paleta de colores (tokens Tailwind v4)
```css
@theme {
  --color-background: #0a0a0a;     /* negro profundo */
  --color-surface:    #141414;     /* superficie de card */
  --color-border:     #2a2a2a;     /* separadores */
  --color-text:       #e8e4dc;     /* crema cálido */
  --color-muted:      #6b6560;     /* texto secundario */
  --color-accent:     #c9a87c;     /* dorado arena — acento editorial */
  --color-danger:     #a05040;     /* alertas */
}
```

### Tipografía
- **Display / títulos**: `Cormorant Garamond` — serif elegante, alto contraste
- **Cuerpo / UI**: `DM Sans` — sans-serif limpia, neutra
- Ambas desde `next/font/google`

### Componentes clave
- `<GalleryGrid>` — grid masonry o columns responsive, hover reveal título
- `<ObraCard>` — imagen + overlay suave con título, técnica, año
- `<ObraViewer>` — pantalla completa, zoom, navegación lateral, info plegable
- `<HeroCarousel>` — slideshow fullscreen con Embla, transición crossfade
- `<SectionReveal>` — wrapper Framer Motion para reveal al scroll
- `<CursorDot>` — cursor personalizado sobre imágenes (opcional)
- `<ContactForm>` — formulario con validación (react-hook-form + zod)

---

## 6. Features de venta

**MVP (sin payment gateway):**
- Obras marcadas como `disponible: true` con precio o "Consultar precio"
- Formulario de consulta pre-completado con la obra seleccionada
- Email al artista vía Resend (o Supabase Edge Function)
- Admin ve las consultas en panel

**Fase 2 (opcional):**
- Integración MercadoPago (prints de edición limitada)
- Carrito mínimo para prints

---

## 7. SEO y metadatos

- `metadata` estático en layouts, dinámico en `[slug]/page.tsx`
- OG images con `@vercel/og` — imagen de la obra + título + nombre del artista
- `sitemap.xml` generado dinámicamente desde Supabase
- `robots.txt` permisivo para indexación de obras

---

## 8. Admin / CMS

- Auth de Supabase (email/password, solo un usuario: el artista o gestor)
- Panel simple para:
  - Subir obra: imagen (Supabase Storage), todos los campos
  - Marcar obra como destacada / disponible
  - Ver y responder consultas
- No hay CMS externo — el panel admin es la app misma

---

## 9. Fases de desarrollo

### Fase 1 — Fundación (setup)
- [ ] `create-next-app` con TypeScript + Tailwind v4
- [ ] Configurar Supabase: proyecto, tablas, Storage bucket (`obras`, público)
- [ ] Conectar Supabase en Next.js (SSR-safe con `@supabase/ssr`) usando `service_role` en dev
- [ ] Sistema de diseño: tokens CSS `@theme`, fuentes Cormorant + DM Sans, componentes base
- [ ] Layout global: header minimalista, footer
- [ ] **RLS se configura en Fase 3**, no aquí — evita bloqueos en desarrollo
- [ ] Pipeline de imágenes: Server Action de upload con `sharp` → WebP + thumb + `blur_data_url`

### Fase 2 — Galería pública
- [ ] Página de galería con grid y filtros (serie, técnica, disponibilidad)
- [ ] Detalle de obra con zoom y metadata
- [ ] Hero carousel en home
- [ ] Sección "Sobre el artista"
- [ ] Sección "Exposiciones"

### Fase 3 — Venta y contacto
- [ ] Tienda / catálogo de obras disponibles
- [ ] Formulario de consulta de compra
- [ ] Envío de email con Resend
- [ ] OG images dinámicas

### Fase 4 — Admin
- [ ] Login de admin (Supabase Auth)
- [ ] CRUD de obras con upload a Storage
- [ ] Gestión de series y exposiciones
- [ ] Bandeja de consultas

### Fase 5 — Pulido y deploy
- [ ] Animaciones Framer Motion en todas las secciones
- [ ] SEO: sitemap, robots, metadatos completos
- [ ] Optimización de imágenes (blur placeholder, lazy load)
- [ ] Deploy en Vercel, variables de entorno, dominio custom
- [ ] `vercel.json` con cron para keep-alive de Supabase

---

## 10. Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

---

## 11. Consideraciones de seguridad y performance

- **`service_role` solo en servidor**: `SUPABASE_SERVICE_ROLE_KEY` únicamente en Server Actions y Route Handlers. Nunca en componentes `"use client"` ni en `NEXT_PUBLIC_*`.
- **Imágenes**: límite de upload en el admin de 20MB. El pipeline convierte a WebP antes de subir a Storage y genera `blur_data_url` (base64 10x10px) que se guarda en la tabla — es la única forma de tener `placeholder="blur"` con imágenes externas.
- **Slug único**: validar unicidad en el Server Action antes de insertar, no solo confiar en el constraint de BD (para dar un error de UX limpio).
- **OG fonts**: subsetear Cormorant Garamond a caracteres latinos básicos para el route handler de OG — los archivos de fuente variable completa superan el límite de Edge Runtime.

---

## 12. Decisiones pendientes

- [ ] ¿El artista quiere venta directa online (MercadoPago) o solo consulta por email en MVP?
- [ ] ¿Hay prints de edición limitada o solo originales?
- [ ] ¿Se necesita versión en inglés (i18n)?
- [ ] ¿Cursor personalizado o interacción hover clásica?
- [ ] ¿Videos de obras / proceso? (implica estrategia Mux vs YouTube embed)
