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
│   ├── page.tsx                   # Home — hero + series con obras
│   ├── globals.css                # Tailwind v4 + @theme tokens
│   ├── favicon.ico
│   ├── obras/                     # Pública: galería y detalle
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── series/                    # Pública: listado y detalle
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── sobre/page.tsx             # Pública: bio + exposiciones
│   ├── contacto/page.tsx          # Pública: formulario (stub)
│   ├── admin/                     # Admin panel
│   │   ├── layout.tsx             # Layout con Sidebar
│   │   ├── page.tsx               # Dashboard con stats
│   │   ├── obras/
│   │   │   ├── page.tsx           # Listado
│   │   │   ├── ObrasAdminClient.tsx
│   │   │   ├── actions.ts         # Server Actions
│   │   │   └── nueva/page.tsx     # Upload form
│   │   ├── colecciones/
│   │   │   ├── page.tsx
│   │   │   ├── ColeccionesClient.tsx
│   │   │   ├── actions.ts
│   │   │   └── nueva/page.tsx
│   │   ├── biografia/
│   │   │   ├── page.tsx
│   │   │   ├── BiografiaForm.tsx
│   │   │   └── actions.ts
│   │   └── contacto/page.tsx      # Stub
│   └── api/
│       └── keepalive/route.ts     # Cron endpoint
├── components/
│   ├── layout/
│   │   ├── Header.tsx             # Nav fijo + menú mobile
│   │   └── Footer.tsx
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

### Auth middleware

El archivo `proxy.ts` (no `middleware.ts`) protege todas las rutas bajo `/admin/*`:

1. Verifica si hay sesión de Supabase Auth vía `getUser()`
2. Si no hay sesión y no está en `/admin/login`, redirige a login
3. Si hay sesión y está en `/admin/login`, redirige a dashboard
4. Usa `createServerClient` con cookies del request para mantener la sesión SSR-safe

**Nota:** Actualmente el middleware está comentado/deshabilitado para permitir desarrollo sin auth. Las rutas admin son accesibles sin login en este momento.

## Patrones y convenciones

1. **Server Components por defecto** — solo agregar `"use client"` cuando sea estrictamente necesario (estado, efectos, eventos del DOM)
2. **Path alias `@/*`** — apunta a la raíz del proyecto
3. **No Context API** para estado global — usar Zustand si se necesita
4. **Imágenes** — siempre `next/image` con `sizes` y `placeholder="blur"` cuando hay `blur_data_url`
5. **Server Actions** — un archivo `actions.ts` por feature folder del admin
6. **Tipos de DB** — generados con `pnpm supabase gen types`, nunca editar a mano
7. **CSS** — tokens vía `@theme {}` en `globals.css`, sin `tailwind.config.*`
8. **Estilos condicionales** — usar `[var(--color-token)]` en lugar de clases de Tailwind cuando se necesita acceso a tokens CSS
