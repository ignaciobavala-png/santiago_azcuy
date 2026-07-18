# Arquitectura del sistema

## Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.7 |
| UI | React | 19.2.4 |
| Estilos | Tailwind CSS | v4 |
| Animaciones | Framer Motion | 12.40.0 |
| Estado global | Zustand | 5.0.14 |
| Base de datos | Supabase (PostgreSQL) | Cloud |
| Autenticación | Supabase Auth | `@supabase/ssr` 0.10.3 |
| Storage | Supabase Storage | Cloud |
| Deploy | Vercel | Hobby plan |
| Package manager | pnpm | — |
| Lenguaje | TypeScript | 5.x (strict) |
| Linting | ESLint | 9 (flat config) |
| Formularios | react-hook-form + zod | 7.77.0 / 4.4.3 |

### Librerías adicionales

| Librería | Propósito |
|---------|-----------|
| `embla-carousel-react` 8.6.0 | Carousel de obras en hero |
| `react-medium-image-zoom` 5.4.5 | Zoom en detalle de obra |
| `react-intersection-observer` 10.0.3 | Reveal al scroll |
| `nuqs` 2.8.9 | Filtros de galería sincronizados con URL |
| `sharp` 0.34.5 | Procesamiento de imágenes (upload) |
| `@vercel/og` | OG images dinámicas (pendiente) |

## Estructura de carpetas

```
santi-art/
├── app/
│   ├── layout.tsx                 # Root layout — fuentes, NuqsAdapter
│   ├── globals.css                # Tailwind v4 + @theme tokens
│   ├── favicon.ico
│   ├── (site)/                    # Route group público — layout persistente (nav no se desmonta)
│   │   ├── layout.tsx             # DesktopBackground + SiteIndex + <main> + ConditionalFooter
│   │   ├── page.tsx               # Home = Escritorio (grid de cards sobre el banner)
│   │   ├── obras/                 # Pinturas: galería y detalle
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── series/                # Listado y detalle de series
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── musica/page.tsx        # Música: Videoclips · Álbumes · Plataformas · En vivo
│   │   ├── institucional/page.tsx # Trayectoria editorial (de cara a instituciones)
│   │   ├── el-aprendiz/page.tsx   # Novela + audiolibro
│   │   ├── dossier/page.tsx
│   │   ├── sobre/page.tsx         # Bio + exposiciones
│   │   └── contacto/page.tsx
│   ├── admin/                     # Admin panel (fuera del route group público)
│   │   ├── login/page.tsx
│   │   └── (protected)/           # Route group con auth gate en su layout
│   │       ├── layout.tsx         # getUser() + redirect + Sidebar
│   │       ├── page.tsx           # Dashboard con stats
│   │       ├── obras/  colecciones/  biografia/  contacto/
│   │       ├── musica/            # CRUD videos_musica / albumes / plataformas
│   │       │   ├── page.tsx
│   │       │   ├── VideosPanel.tsx  AlbumesPanel.tsx  PlataformasPanel.tsx
│   │       │   └── actions.ts
│   │       └── novela/            # CRUD de leads/capítulos de El Aprendiz
│   └── api/
│       └── keepalive/route.ts     # Cron endpoint
├── components/
│   ├── layout/
│   │   ├── SiteIndex.tsx          # File explorer: escritorio ⇄ barra de sección (framer-motion)
│   │   ├── DesktopBackground.tsx  # Banner persistente en carousel (fondo fijo)
│   │   ├── CardVideoPreview.tsx   # Preview de video dentro de cada card
│   │   ├── sectionTree.ts         # Fuente única: secciones + subsecciones (anclas)
│   │   ├── SectionTitle.tsx       # Encabezado de sección (reemplaza al viejo SectionHero)
│   │   ├── ConditionalFooter.tsx  # Footer oculto en el home (Escritorio)
│   │   └── Footer.tsx
│   ├── musica/
│   │   └── VideoGallery.tsx  AlbumGallery.tsx  StreamingLinks.tsx
│   ├── gallery/
│   │   ├── ObraCard.tsx           # Card de obra con hover
│   │   └── FiltrosObras.tsx       # Filtros con nuqs
│   └── admin/
│       └── Sidebar.tsx            # Navegación lateral admin
├── lib/
│   └── supabase/
│       ├── client.ts              # Cliente browser (anon key)
│       ├── server.ts              # Cliente server + admin (service_role)
│       └── queries.ts             # Funciones de consulta tipadas
├── types/
│   └── database.ts                # Tipos autogenerados de Supabase
├── supabase/
│   └── migrations/                # Archivos SQL de migración
├── public/                        # Assets estáticos
├── proxy.ts                       # Middleware auth para /admin/*
├── next.config.ts                 # remotePatterns para imágenes
├── vercel.json                    # Cron keep-alive
└── package.json
```

## Concepto de navegación: Escritorio + File Explorer

El sitio público no se navega como páginas separadas sino como **un mismo espacio que muta** —
la sensación de hipervínculos dinámicos de las redes: nunca "entrás" ni "salís" del todo.
Se apoya en dos metáforas:

- **Escritorio (desktop)** — el banner dinámico ocupa toda la pantalla como fondo fijo y
  **persistente**, con un carousel de videos que rota de forma continua (`DesktopBackground`,
  montado en `app/(site)/layout.tsx`, nunca se desmonta al navegar).
- **File Explorer** — en el home, las secciones son **cards** sobre el escritorio (`SiteIndex`).
  Al "ingresar" a una card, las demás **se borran** y la card entrada hace **morph**
  (framer-motion `layoutId`) hacia una barra superior sticky con:
  - un **breadcrumb** `⌂ Escritorio / Sección / Subsección`,
  - **chips de subsección** que hacen scroll suave al ancla correspondiente,
  - **scroll-spy** (IntersectionObserver) que marca la subsección visible.

La ventana de contenido es **transparente**: el escritorio (banner) sigue vivo detrás con un
scrim translúcido. Para cambiar de sección se vuelve al Escritorio (firma o breadcrumb).

**Fuente única de navegación:** `components/layout/sectionTree.ts` define el árbol
(secciones → subsecciones como anclas). Cada página expone sus subsecciones con
`id="..." data-subsection scroll-mt-32` para que el breadcrump y el scroll-spy las detecten.

> El route group `app/(site)/` existe precisamente para que este layout de navegación sea
> **persistente**: React mantiene montados `DesktopBackground` y `SiteIndex` entre navegaciones,
> logrando que el fondo y el morph de cards sean continuos (no hay flash ni remonta).

## Flujo de datos

### Clientes Supabase
El proyecto usa tres clientes distintos según el contexto:

- **Cliente browser** (`lib/supabase/client.ts`): `createBrowserClient` con `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Usado solo en `"use client"` para queries de solo lectura (ej: cargar lista de series en el form de nueva obra).

- **Cliente server** (`lib/supabase/server.ts` → `createClient`): `createServerClient` con `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Usado en Server Components para queries públicas (obras, series, bio, exposiciones).

- **Cliente admin** (`lib/supabase/server.ts` → `createAdminClient`): `createServerClient` con `SUPABASE_SERVICE_ROLE_KEY`. Usado **exclusivamente** en Server Actions y Route Handlers para bypass de RLS. **Nunca** en componentes cliente ni en variables `NEXT_PUBLIC_*`.

### Server Components vs Client Components

| Tipo | Archivos | Cuándo se usa |
|------|---------|---------------|
| Server Component | 13 páginas (todas las públicas + layouts admin) | Por defecto. Fetch de datos, renderizado estático |
| Client Component | 6 componentes (`"use client"`) | Estado local (`useState`), eventos del DOM, `useRouter`, `usePathname` |
| Server Action | 3 archivos (`"use server"`) | Escritura en DB vía `createAdminClient` |

### Pipeline de upload de imágenes

```
Cliente selecciona archivo (JPG/PNG/WebP/TIFF, máx 20MB)
  → Server Action: uploadObraImage(formData)
    → sharp: rotate → resize(2400px) → webp(quality: 85) → buffer
    → sharp: rotate → resize(10x10) → webp(quality: 60) → base64 (blur_data_url)
    → Supabase Storage: upload a obras/{uuid}/original.webp
    → Retorna { imagen_url, blur_data_url }
  → Server Action: crearObra(formData)
    → Genera slug desde título (NFD normalize, sanitize)
    → Verifica unicidad de slug
    → INSERT en tabla obras
    → revalidatePath("/obras", "/")
```

### Auth (doble capa)

La protección de `/admin/*` es en **dos capas** (no se depende solo del proxy — mitigación de
CVE-2025-29927):

1. **`proxy.ts`** (edge): verifica sesión vía `getUser()` y redirige a `/admin/login` si no hay.
2. **`app/admin/(protected)/layout.tsx`** (server component): repite `getUser()` y hace
   `redirect("/admin/login")` si no hay usuario. Esta capa es la que garantiza el acceso incluso
   si el proxy fuera evadido.

**Auth activo** — las rutas admin requieren login. El route group `(protected)` agrupa todo lo
que pasa por el gate; `/admin/login` queda fuera.

## Patrones y convenciones

1. **Server Components por defecto** — solo agregar `"use client"` cuando sea estrictamente necesario (estado, efectos, eventos del DOM)
2. **Path alias `@/*`** — apunta a la raíz del proyecto
3. **No Context API** para estado global — usar Zustand si se necesita
4. **Imágenes** — siempre `next/image` con `sizes` y `placeholder="blur"` cuando hay `blur_data_url`
5. **Server Actions** — un archivo `actions.ts` por feature folder del admin
6. **Tipos de DB** — generados con `pnpm supabase gen types`, nunca editar a mano
7. **CSS** — tokens vía `@theme {}` en `globals.css`, sin `tailwind.config.*`
8. **Estilos condicionales** — usar `[var(--color-token)]` en lugar de clases de Tailwind cuando se necesita acceso a tokens CSS
