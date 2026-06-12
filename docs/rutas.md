# Rutas de la aplicación

> Árbol completo de rutas con tipo de componente, parámetros y Server Actions asociadas.

## Rutas públicas

| Ruta | Archivo | Tipo | Descripción |
|------|---------|------|-------------|
| `/` | `app/page.tsx` | Server Component (async) | Home: hero con logo, secciones por serie, statement, footer |
| `/obras` | `app/obras/page.tsx` | Server Component (async) | Galería con grid de obras. Filtros por serie, técnica y disponibilidad vía `nuqs` |
| `/obras/[slug]` | `app/obras/[slug]/page.tsx` | Server Component (async) | Detalle: imagen full, ficha técnica, CTA de compra, breadcrumb |
| `/series` | `app/series/page.tsx` | Server Component (async) | Listado de series/colecciones con imagen cover |
| `/series/[slug]` | `app/series/[slug]/page.tsx` | Server Component (async) | Detalle de serie: header + grid de obras de esa serie |
| `/sobre` | `app/sobre/page.tsx` | Server Component (async) | Bio del artista + exposiciones (individuales/colectivas) |
| `/contacto` | `app/contacto/page.tsx` | Server Component (sync) | Página de contacto (stub: "Proximamente") |

### Parámetros de búsqueda (search params)

`/obras` acepta los siguientes query params manejados por `nuqs`:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `serie` | `string` | Slug de la serie para filtrar |
| `tecnica` | `string` | Técnica para filtrar (ILIKE) |
| `disponible` | `"true"` | Solo obras disponibles para la venta |

### Metadata dinámica

Las rutas con `[slug]` generan metadata dinámico:

- `/obras/[slug]`: `generateMetadata` — título y description desde la obra
- `/series/[slug]`: `generateMetadata` — título y description desde la serie

Ambas usan `export const dynamic = "force-dynamic"` para evitar caching estático.

## Rutas admin

Todas bajo prefijo `/admin`. Layout compartido con `Sidebar`.

| Ruta | Archivo | Tipo | Descripción |
|------|---------|------|-------------|
| `/admin` | `app/admin/page.tsx` | Server Component (async) | Dashboard: stats (obras, series, publicadas, disponibles) + accesos rápidos |
| `/admin/obras` | `app/admin/obras/page.tsx` | Server Component (async) | Listado de obras con toggle publicar/ocultar y eliminar |
| `/admin/obras/nueva` | `app/admin/obras/nueva/page.tsx` | Client Component | Formulario de upload: imagen → process → guardar obra |
| `/admin/colecciones` | `app/admin/colecciones/page.tsx` | Server Component (async) | Listado de series con conteo de obras y eliminar |
| `/admin/colecciones/nueva` | `app/admin/colecciones/nueva/page.tsx` | Client Component | Formulario de nueva colección |
| `/admin/biografia` | `app/admin/biografia/page.tsx` | Server Component (async) | Editor de bio + CRUD de exposiciones |
| `/admin/contacto` | `app/admin/contacto/page.tsx` | Client Component | Configuración de contacto (stub: mock, no conectado a BD) |

### Auth middleware

El archivo `proxy.ts` protege `/admin/*`:
- Redirige a `/admin/login` si no hay sesión
- Redirige a `/admin` si ya hay sesión y está en login
- Usa `getUser()` de Supabase para validar JWT

**Actualmente el middleware está deshabilitado** para desarrollo. Las rutas admin son accesibles sin login.

## Server Actions

Tres archivos de Server Actions, uno por feature del admin:

### `app/admin/obras/actions.ts`

| Acción | Signatura | Descripción |
|--------|-----------|-------------|
| `uploadObraImage` | `(FormData) → Promise<UploadImageResult>` | Procesa imagen con sharp, sube a Storage, retorna URL + blur |
| `crearObra` | `(FormData) → Promise<void>` | Inserta obra en BD. Genera slug, verifica unicidad |
| `togglePublicada` | `(id: string, publicada: boolean) → Promise<void>` | Activa/desactiva visibilidad pública |
| `eliminarObra` | `(id: string) → Promise<void>` | Elimina obra de la BD |

### `app/admin/colecciones/actions.ts`

| Acción | Signatura | Descripción |
|--------|-----------|-------------|
| `crearSerie` | `(FormData) → Promise<void>` | Crea serie. Genera slug desde nombre |
| `eliminarSerie` | `(id: string) → Promise<void>` | Elimina serie (obras quedan sin serie_id) |

### `app/admin/biografia/actions.ts`

| Acción | Signatura | Descripción |
|--------|-----------|-------------|
| `guardarBiografia` | `(texto: string) → Promise<void>` | Actualiza el texto biográfico (id=1) |
| `crearExposicion` | `(FormData) → Promise<void>` | Crea exposición. Convierte año a `fecha_inicio` |
| `eliminarExposicion` | `(id: string) → Promise<void>` | Elimina exposición |

Todas las Server Actions:
- Usan `createAdminClient()` (service_role) para bypass de RLS
- Llaman `revalidatePath()` para invalidar cache de Next.js
- Lanzan `Error` en caso de fallo (capturado por el Client Component)

## API Routes

| Ruta | Archivo | Método | Descripción |
|------|---------|--------|-------------|
| `/api/keepalive` | `app/api/keepalive/route.ts` | GET | Cron endpoint. Query a Supabase para evitar cold start. Requiere header `Authorization: Bearer {CRON_SECRET}` |

### Keepalive

- Llamado por el cron de Vercel cada 3 días a las 12:00 UTC
- Configurado en `vercel.json`
- Ejecuta `SELECT id FROM series LIMIT 1` para mantener activa la BD de Supabase (hobby plan se pausa tras inactividad)
- Protegido con `CRON_SECRET` vía header `Authorization: Bearer`
