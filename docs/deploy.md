# Deploy

> Guía de deploy en Vercel y configuración de producción.

## Variables de entorno

Crear un archivo `.env.local` en la raíz con estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wjjpuxjhufzxjqeekzfn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=REEMPLAZAR_CON_SERVICE_ROLE_KEY
RESEND_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=REEMPLAZAR_CON_STRING_ALEATORIO
```

### Variables requeridas

| Variable | Dónde se usa | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente browser + server | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente browser + server | Key anónima para queries públicas |
| `SUPABASE_SERVICE_ROLE_KEY` | `createAdminClient()` | Key con permisos admin (bypass RLS). **Nunca exponer en cliente** |
| `NEXT_PUBLIC_SITE_URL` | Prod/dev | URL base del sitio |
| `CRON_SECRET` | `/api/keepalive` | String secreto para autorizar el cron (generar aleatorio) |
| `RESEND_API_KEY` | Formulario de contacto (pendiente) | API key de Resend para emails |

### Seguridad

- `SUPABASE_SERVICE_ROLE_KEY` **nunca** debe aparecer en bundles del cliente
- Solo se usa en Server Actions (`"use server"`) y Route Handlers
- Verificar que no tenga prefijo `NEXT_PUBLIC_`

## Deploy en Vercel

### Setup inicial

1. Crear proyecto en Vercel vinculado al repositorio `ignaciobavala-png/santiago_azcuy`
2. Configurar las 5 variables de entorno en Vercel Dashboard (Settings → Environment Variables)
3. Framework preset: Next.js (detección automática)
4. Build command: `pnpm build`
5. Output directory: `.next`

### Primer deploy

```bash
# Conectar Vercel CLI si no está conectado
vercel link

# Deploy
vercel --prod
```

### Dominio custom

Después del primer deploy, configurar el dominio en Vercel Dashboard:
- Settings → Domains → Add domain
- Actualizar `NEXT_PUBLIC_SITE_URL` con el nuevo dominio
- Configurar DNS del dominio para apuntar a Vercel

## Cron keep-alive

Supabase pausa proyectos inactivos en plan hobby. Para evitarlo, un cron de Vercel hace una query simple cada 3 días.

**Configuración** en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/keepalive",
      "schedule": "0 12 */3 * *"
    }
  ]
}
```

- **Schedule:** cada 3 días a las 12:00 UTC
- **Endpoint:** `GET /api/keepalive`
- **Auth:** header `Authorization: Bearer {CRON_SECRET}`
- **Query:** `SELECT id FROM series LIMIT 1`

### Configurar CRON_SECRET

1. Generar un string aleatorio seguro
2. Agregar a variables de entorno en Vercel
3. El mismo valor debe estar en `CRON_SECRET` del `.env.local`

El valor ya generado para este proyecto: `26e54abfe9fa894ea7d82d3fd2b152ba1e524b492ba07f51397666d235e25229`

## Configuración de next.config.ts

```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wjjpuxjhufzxjqeekzfn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}
```

Permite a `next/image` cargar imágenes desde Supabase Storage. Si se cambia el proyecto de Supabase, actualizar el `hostname`.

## Post-deploy checklist

- [ ] El sitio carga en la URL de producción
- [ ] Las imágenes de obras se cargan correctamente (verificar `remotePatterns`)
- [ ] La galería muestra obras (verificar que haya obras con `publicada = true`)
- [ ] El admin funciona (verificar `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] El cron de keepalive está activo (verificar en Vercel Dashboard → Cron Jobs)
- [ ] Variables de entorno sin prefijo `NEXT_PUBLIC_` no están expuestas en el bundle
- [ ] `NEXT_PUBLIC_SITE_URL` apunta a la URL de producción

## Repositorio

- **GitHub:** `ignaciobavala-png/santiago_azcuy`
- **Branch principal:** `main`
- **Deploy triggers:** pushes a `main`

## Archivos ignorados en deploy

Ver `.gitignore`:
```
node_modules/
.next/
.env*.local
.vercel
.mcp.json
```
