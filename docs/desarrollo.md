# Guía de desarrollo

> Setup local, comandos y convenciones para trabajar en el proyecto.

## Requisitos

- Node.js 20+
- pnpm 9+
- Cuenta de Supabase (proyecto cloud existente)
- Las variables de entorno en `.env.local`

## Setup inicial

```bash
# Clonar el repositorio
git clone git@github.com:ignaciobavala-png/santiago_azcuy.git
cd santiago_azcuy

# Instalar dependencias
pnpm install

# Crear .env.local con las variables requeridas
cp .env.example .env.local  # si existe
# O crear manualmente con las variables de deploy.md

# Iniciar dev server
pnpm dev
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar servidor de desarrollo en `localhost:3000` |
| `pnpm build` | Build de producción |
| `pnpm start` | Iniciar servidor de producción |
| `pnpm lint` | Ejecutar ESLint |
| `pnpm supabase db push` | Aplicar migraciones a Supabase remoto |
| `pnpm supabase gen types --local > types/database.ts` | Regenerar tipos TypeScript desde el schema |

## Estructura de archivos

Ver [arquitectura.md](./arquitectura.md) para el árbol completo.

## Convenciones de código

### TypeScript
- Strict mode habilitado en `tsconfig.json`
- Path alias `@/*` → raíz del proyecto
- Tipos de BD: usar los tipos autogenerados en `types/database.ts`
- No usar `any` — si un tipo es complejo, definir una interfaz

### React / Next.js
- **Server Components por defecto** — solo agregar `"use client"` cuando sea necesario (hooks de estado, efectos, eventos del DOM, `useRouter`, `usePathname`)
- **Server Actions** en archivos `actions.ts` dentro de cada feature folder del admin
- **Formularios**: usar `react-hook-form` + `zod` para formularios públicos (Fase 3). Los forms del admin actualmente usan `FormData` nativo + `useTransition`
- **Imágenes**: siempre `next/image` con `sizes` y `placeholder="blur"` cuando hay `blur_data_url`. Nunca usar `<img>`
- **Estado global**: Zustand si se necesita (no Context API). Actualmente no hay stores globales implementados
- **Metadata**: `generateMetadata` en layouts y páginas dinámicas. OG images pendientes

### Supabase
- **Cliente browser** (`lib/supabase/client.ts`): solo para queries de lectura en `"use client"`
- **Cliente server** (`lib/supabase/server.ts` → `createClient`): para Server Components y queries públicas
- **Cliente admin** (`lib/supabase/server.ts` → `createAdminClient`): solo en Server Actions y Route Handlers
- **Nunca** exponer `SUPABASE_SERVICE_ROLE_KEY` en el bundle del cliente
- **Migraciones**: siempre archivos `.sql` en `supabase/migrations/`, nunca modificar schema por dashboard
- **Tipos**: regenerar con `pnpm supabase gen types` después de cambios de schema

### Estilos
- Tailwind v4 con tokens `@theme` en `globals.css`
- No existe `tailwind.config.ts`
- Colores: usar `[var(--color-token)]`, no clases arbitrarias
- Fuentes: `font-[family-name:var(--font-cormorant)]` o `font-[family-name:var(--font-dm-sans)]`
- Animaciones: Framer Motion (no CSS transitions para UI principal)

### Calidad
- **No hay tests** — verificar funcionalidad corriendo `pnpm dev`
- No escribir comentarios obvios — solo si el WHY no es obvio
- Cada ruta pública debe tener `generateMetadata` con OG image (pendiente en varias rutas)
- Ejecutar `pnpm lint` antes de commit

## Pipeline de imágenes

Cuando se sube una imagen en `/admin/obras/nueva`:

1. El archivo se envía al Server Action `uploadObraImage`
2. `sharp` procesa: rotación EXIF → resize 2400px → WebP calidad 85
3. `sharp` genera thumbnail 10×10px → base64 para `blur_data_url`
4. Se sube a Supabase Storage: `obras/{uuid}/original.webp`
5. Se retorna `{ imagen_url, blur_data_url }`
6. El formulario guarda ambos en la tabla `obras`

## Sesiones de Supabase

El proyecto usa `@supabase/ssr` con el patrón de cookies de Next.js:

- **Server Components**: `createServerClient` con `cookies()` de `next/headers`
- **Client Components**: `createBrowserClient` sin manejo de cookies
- **Middleware**: `createServerClient` con cookies del request (`proxy.ts`)

Actualmente la autenticación no está activa en desarrollo. El middleware (`proxy.ts`) no se está ejecutando. Cuando se active:
- Las rutas `/admin/*` requerirán sesión
- Se necesitará crear un usuario admin en Supabase Auth
- Implementar página de login en `/admin/login`

## Pendientes técnicos

Ver [estado-del-proyecto.md](./estado-del-proyecto.md) para el roadmap completo.

Elementos que requieren atención antes de producción:

1. **`SUPABASE_SERVICE_ROLE_KEY`** — reemplazar placeholder en `.env.local` con la key real
2. **`CRON_SECRET`** — configurar el string aleatorio generado
3. **Auth middleware** — activar `proxy.ts` como middleware de Next.js
4. **Página de login** — crear `/admin/login`
5. **Formulario de contacto** — implementar con react-hook-form + zod + guardado en `consultas`
6. **OG images** — implementar `@vercel/og` para obras y series
7. **sitemap.xml** — generación dinámica desde Supabase
8. **CMS de contacto** — conectar `/admin/contacto` a BD real

## Debugging

- **Imágenes no cargan**: verificar `remotePatterns` en `next.config.ts` y que las URLs sean correctas
- **Server Actions fallan**: el error se captura en el Client Component y se muestra en banner rojo. Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- **Datos no se actualizan**: las Server Actions llaman a `revalidatePath()` — si no se ve el cambio, puede ser cache del navegador
- **CORS en Storage**: el bucket `obras` es público. Si hay error de carga, verificar políticas del bucket
