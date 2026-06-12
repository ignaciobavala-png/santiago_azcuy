# Estado del proyecto

> Fases completadas y pendientes según `plan.md`.

## Fase 1 — Fundación ✅

Configuración inicial del proyecto.

- [x] Next.js 16 con TypeScript strict y Tailwind v4
- [x] Schema de BD: tablas `obras`, `series`, `exposiciones`, `consultas`, `biografia`
- [x] Storage bucket `obras` (público, 20MB, WebP/JPG/PNG/TIFF)
- [x] RLS habilitado con políticas de lectura pública
- [x] Clientes Supabase SSR (`client.ts` para browser, `server.ts` con `createAdminClient`)
- [x] Tipos TypeScript generados desde schema real (`types/database.ts`)
- [x] Sistema de diseño: tokens `@theme`, fuentes Cormorant + DM Sans
- [x] Layout global con Header (nav + mobile menu) y Footer
- [x] `vercel.json` con cron keep-alive cada 3 días
- [x] Pipeline de imágenes con `sharp` (WebP 2400px, blur_data_url 10×10)

## Fase 2 — Galería pública ✅

Rutas y componentes públicos conectados a BD.

- [x] `/obras` — galería con grid responsive y filtros (serie, técnica, disponibilidad) vía `nuqs`
- [x] `/obras/[slug]` — detalle con `next/image`, blur placeholder, ficha técnica, CTA de compra
- [x] `/series` — listado de colecciones con imagen cover y hover
- [x] `/series/[slug]` — detalle de serie con header + grid de obras
- [x] `/sobre` — bio desde tabla `biografia` + exposiciones reales (individuales/colectivas)
- [x] `ObraCard` reutilizable con hover overlay y blur placeholder
- [x] `FiltrosObras` con `nuqs` sincronizado con URL search params
- [x] `lib/supabase/queries.ts` — helpers tipados para todas las queries públicas
- [x] Home conectada a BD vía `getSeriesConObras`, fallback para BD vacía

## Fase 3 — Contacto y venta 🔄

En progreso parcial.

- [x] Página `/contacto` con layout (contenido: stub)
- [x] CTA de consulta en detalle de obra (linkea a `/contacto?obra=slug`)
- [ ] Formulario de contacto funcional con react-hook-form + zod
- [ ] `app/api/contact/route.ts` — guarda en `consultas` + email con Resend
- [ ] OG images dinámicas (`app/api/og/route.ts`) para obras y series
- [ ] `generateMetadata` completo en todas las rutas

## Fase 4 — Admin panel 🔄

CRUD parcialmente implementado.

- [x] `/admin` — dashboard con stats reales (conteos de BD)
- [x] `/admin/obras` — listado con toggle publicar/ocultar y eliminar
- [x] `/admin/obras/nueva` — upload de imagen con sharp + guardado en BD
- [x] `/admin/colecciones` — listado con eliminar
- [x] `/admin/colecciones/nueva` — formulario de creación
- [x] `/admin/biografia` — editor de bio + CRUD de exposiciones
- [x] Sidebar de navegación con links activos
- [ ] `/admin` — login con Supabase Auth (middleware `proxy.ts` existe pero no activo)
- [ ] Edición de obra existente (`/admin/obras/[id]/editar`)
- [ ] `/admin/contacto` — conectar a BD real (actualmente stub con datos mock)
- [ ] Bandeja de consultas recibidas (tabla `consultas`)

## Fase 5 — Pulido y deploy ⏳

No iniciada.

- [ ] Animaciones Framer Motion (reveal al scroll, transiciones de página)
- [ ] `generateMetadata` completo en todas las rutas con OG image dinámica
- [ ] `sitemap.xml` generado dinámicamente desde Supabase
- [ ] `robots.txt`
- [ ] Deploy en Vercel con dominio custom
- [ ] Variables de entorno en producción

## Próximos pasos prioritarios

### Antes de deploy (URGENTE)

1. Configurar `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (sin esto el admin no funciona)
2. Configurar `CRON_SECRET` en `.env.local` (valor ya generado)
3. Crear proyecto en Vercel y cargar las 5 variables de entorno
4. Activar middleware de auth (`proxy.ts`)
5. Crear página `/admin/login`

### Siguiente sesión

1. Implementar formulario de contacto funcional (react-hook-form + zod)
2. Conectar envío a tabla `consultas` y email con Resend
3. Completar `generateMetadata` en rutas faltantes
4. Crear sitemap.xml dinámico

## Decisiones pendientes

Según `plan.md`:

- [ ] ¿El artista quiere venta directa online (MercadoPago) o solo consulta por email en MVP?
- [ ] ¿Hay prints de edición limitada o solo originales?
- [ ] ¿Se necesita versión en inglés (i18n)?
- [ ] ¿Cursor personalizado o interacción hover clásica?
- [ ] ¿Videos de obras / proceso?

## Tabla resumen

| Fase | Descripción | Estado | Completado |
|------|-------------|--------|------------|
| 1 | Fundación | ✅ Completa | 10/10 items |
| 2 | Galería pública | ✅ Completa | 9/9 items |
| 3 | Contacto y venta | 🔄 En progreso | 2/5 items |
| 4 | Admin panel | 🔄 En progreso | 7/10 items |
| 5 | Pulido y deploy | ⏳ Pendiente | 0/7 items |
