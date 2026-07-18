# Rutas de la aplicación

> Árbol completo de rutas con tipo de componente, parámetros y Server Actions asociadas.

## Rutas públicas

> Todas viven bajo el route group `app/(site)/` con un **layout persistente** (banner de fondo +
> navegación file-explorer que no se desmonta al navegar). Ver "Concepto de navegación" en
> `arquitectura.md`. El route group no afecta la URL (`(site)` no aparece en el path).

| Ruta | Archivo | Tipo | Descripción |
|------|---------|------|-------------|
| `/` | `app/(site)/page.tsx` | Server Component (async) | Home = **Escritorio**: grid de cards de sección sobre el banner |
| `/obras` | `app/(site)/obras/page.tsx` | Server Component (async) | Pinturas: grid de obras. Filtros por serie, técnica y disponibilidad vía `nuqs` |
| `/obras/[slug]` | `app/(site)/obras/[slug]/page.tsx` | Server Component (async) | Detalle: imagen, ficha técnica, CTA de compra, breadcrumb |
| `/series` | `app/(site)/series/page.tsx` | Server Component (async) | Listado de series/colecciones con imagen cover |
| `/series/[slug]` | `app/(site)/series/[slug]/page.tsx` | Server Component (async) | Detalle de serie: header + grid de obras |
| `/musica` | `app/(site)/musica/page.tsx` | Server Component (async) | Subsecciones: Videoclips · Álbumes · Plataformas · En vivo (anclas `data-subsection`) |
| `/institucional` | `app/(site)/institucional/page.tsx` | Server Component (sync) | Trayectoria editorial de cara a instituciones. Subsecciones: Trayectoria · Formación · Distinciones · Obra. **Omite datos personales** (DNI/domicilio/teléfono) por ser página pública |
| `/el-aprendiz` | `app/(site)/el-aprendiz/page.tsx` | Server Component (sync) | Novela (descarga PDF) + Audiolibro (embed Spotify). Subsecciones: Novela · Audiolibro |
| `/dossier` | `app/(site)/dossier/page.tsx` | Server Component | Dossier del artista |
| `/sobre` | `app/(site)/sobre/page.tsx` | Server Component (async) | Bio del artista + exposiciones |
| `/contacto` | `app/(site)/contacto/page.tsx` | Server Component | Página de contacto |

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
| `/admin/biografia` | `app/admin/(protected)/biografia/page.tsx` | Server Component (async) | Editor de bio + CRUD de exposiciones |
| `/admin/contacto` | `app/admin/(protected)/contacto/page.tsx` | Client Component | Configuración de contacto |
| `/admin/musica` | `app/admin/(protected)/musica/page.tsx` | Server Component (async) | CRUD de Música: `VideosPanel` (videoclip + vivo), `AlbumesPanel`, `PlataformasPanel` |
| `/admin/novela` | `app/admin/(protected)/novela/page.tsx` | Server Component (async) | Gestión de El Aprendiz (leads / capítulos) |

> Las páginas del admin (salvo `/admin/login`) viven bajo el route group `app/admin/(protected)/`.

### Auth (doble capa)

Protección de `/admin/*` en dos niveles (mitigación de CVE-2025-29927):

1. **`proxy.ts`** (edge): redirige a `/admin/login` si no hay sesión; a `/admin` si ya hay sesión y está en login.
2. **`app/admin/(protected)/layout.tsx`**: `getUser()` + `redirect("/admin/login")` — garantía server-side aunque se evada el proxy.

**Auth activo** — las rutas admin requieren login.

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

### `app/admin/(protected)/musica/actions.ts`

| Acción | Signatura | Descripción |
|--------|-----------|-------------|
| `getSignedUploadUrl` | `() → Promise<SignedUploadResult>` | URL firmada para subir portada de álbum (bucket `obras`, path `albumes/{uuid}/portada`) |
| `crearVideo` / `toggleVideo` / `eliminarVideo` | `(FormData)` / `(id, activo)` / `(id)` | CRUD de `videos_musica`. `crearVideo` extrae el ID de YouTube desde URL o ID pelado (`extraerYoutubeId`) |
| `crearAlbum` / `toggleAlbum` / `eliminarAlbum` | `(FormData)` / `(id, activo)` / `(id)` | CRUD de `albumes` |
| `crearPlataforma` / `actualizarPlataforma` / `togglePlataforma` / `eliminarPlataforma` | — | CRUD de `plataformas` (links de streaming) |

Todas revalidan `/musica` y `/admin/musica`.

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
