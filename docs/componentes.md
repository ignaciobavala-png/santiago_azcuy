# Componentes

> Catálogo de componentes reutilizables del proyecto.

## Componentes de layout

> La navegación pública sigue el concepto **Escritorio + File Explorer**
> (ver `arquitectura.md`). Los componentes viven en `app/(site)/layout.tsx` y **persisten**
> entre navegaciones. El viejo `<Header>` fijo fue reemplazado por este sistema.

### `<SiteIndex>`

**Archivo:** `components/layout/SiteIndex.tsx`
**Tipo:** Client Component (`"use client"`)

Índice de navegación persistente (file explorer). Vive en el layout, no se desmonta al navegar.

**Props:** `{ banners: Banner[] }`

**Dos estados (framer-motion `LayoutGroup` + `AnimatePresence`):**
- **Home (`/`) = Escritorio:** grid de cards de sección sobre el banner. Cada card usa
  `layoutId={card-${href}}` + `<CardVideoPreview>`.
- **Sección (`≠ /`):** las cards del escritorio salen (fade) y la card activa hace **morph**
  a una barra superior sticky con firma, breadcrumb `⌂ Escritorio / Sección / Subsección`
  y **chips de subsección**.

**Comportamiento clave:**
- `findSection(pathname)` (de `sectionTree.ts`) determina la sección activa.
- **Scroll-spy** con `IntersectionObserver` (`rootMargin: "-25% 0px -65% 0px"`) marca la
  subsección visible → alimenta breadcrumb y chips.
- Los chips hacen `scrollIntoView({ behavior: "smooth" })` al ancla.
- Para cambiar de sección se vuelve al Escritorio (firma o breadcrumb "⌂ Escritorio").

---

### `<DesktopBackground>`

**Archivo:** `components/layout/DesktopBackground.tsx`
**Tipo:** Client Component (`"use client"`)

Banner de fondo fijo y persistente (el "escritorio"). `fixed inset-0 z-0`.

**Props:** `{ banners: Banner[] }`

**Comportamiento:**
- **Carousel continuo:** reproduce un video a la vez (orden aleatorio, Fisher-Yates); al terminar
  (`onEnded`) avanza al siguiente. Sigue girando entre navegaciones (el componente no se remonta).
- Scrim encima: `bg-black/40` en el home, `bg-[var(--color-background)]/68 backdrop-blur` en secciones
  (ventana transparente — el fondo se ve a través del contenido).
- Fallback `sky-glow` si no hay banners.

---

### `<CardVideoPreview>` · `<ConditionalFooter>` · `sectionTree.ts` · `<SectionTitle>`

| Archivo | Tipo | Rol |
|---------|------|-----|
| `CardVideoPreview.tsx` | Client | Preview de video (banner) dentro de cada card del escritorio |
| `ConditionalFooter.tsx` | Client | Renderiza `<Footer>` salvo en el home (Escritorio no lleva footer) |
| `sectionTree.ts` | — | **Fuente única** de navegación: `SECTION_TREE` (secciones → subsecciones como anclas) + `findSection(pathname)` |
| `SectionTitle.tsx` | Server | Encabezado de sección (eyebrow + título). Reemplaza al viejo `SectionHero` que traía su propio banner |

---

### `<Footer>`

**Archivo:** `components/layout/Footer.tsx`
**Tipo:** Server Component

Footer minimalista con links y copyright.

**Secciones:**
- Nombre del artista ("Santiago Azcuy") + subtítulo
- Links de navegación (mismos que Header)
- Copyright dinámico (`© {año actual} Santiago Azcuy`)

---

## Componentes de galería

### `<ObraCard>`

**Archivo:** `components/gallery/ObraCard.tsx`
**Tipo:** Server Component

Card de obra para grids de galería.

**Props** (tipo `ObraCard` definido en `lib/supabase/queries.ts`):

| Prop | Tipo | Descripción |
|------|------|-------------|
| `slug` | `string` | Slug para link a detalle |
| `titulo` | `string` | Título de la obra |
| `año` | `number \| null` | Año de realización |
| `tecnica` | `string \| null` | Técnica pictórica |
| `dimensiones` | `string \| null` | Dimensiones en texto |
| `imagen_url` | `string \| null` | URL de la imagen en Storage |
| `blur_data_url` | `string \| null` | Base64 para blur placeholder |
| `disponible` | `boolean` | Si está a la venta |
| `id` | `string` | ID de la obra |
| `destacada` | `boolean` | Si es destacada |

**Comportamiento:**
- Aspect ratio fijo `3/4` con `object-cover`
- Hover: overlay negro semitransparente con técnica, dimensiones y badge "Disponible"
- Imagen con `scale-105` en hover (transición 700ms)
- `placeholder="blur"` si hay `blur_data_url`, sino `"empty"`
- Título en Cormorant con hover color acento
- Indicador de disponibilidad: dot dorado junto al título
- Sin imagen: estado vacío con texto "Sin imagen"

---

### `<FiltrosObras>`

**Archivo:** `components/gallery/FiltrosObras.tsx`
**Tipo:** Client Component (`"use client"`)

Filtros de galería sincronizados con la URL vía `nuqs`.

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `series` | `{ slug: string; nombre: string }[]` | Lista de series para filtrar |
| `tecnicas` | `string[]` | Lista de técnicas únicas |

**Query params manejados:**

| Parámetro | Hook nuqs |
|-----------|-----------|
| `serie` | `useQueryState("serie")` |
| `tecnica` | `useQueryState("tecnica")` |
| `disponible` | `useQueryState("disponible")` |

**Comportamiento:**
- Botones toggle: click selecciona, click de nuevo desselecciona
- Botón "Todas" para limpiar filtro de serie o técnica
- Botón "Solo disponibles" para toggle del filtro de disponibilidad
- Estilo activo: borde y texto dorado (`--color-accent`)
- Estilo inactivo: borde sutil, texto muted
- `shallow: false` — actualiza el servidor (no solo cliente)
- Los filtros de serie y técnica se ocultan si no hay datos

---

## Componentes de admin

### `<Sidebar>`

**Archivo:** `components/admin/Sidebar.tsx`
**Tipo:** Client Component (`"use client"`)

Barra lateral fija para navegación del panel admin.

**Estado:** usa `usePathname()` para determinar la ruta activa.

**Secciones de navegación:**

| Label | Href | Ícono SVG |
|-------|------|-----------|
| Panel | `/admin` | Grid 2×2 |
| Colecciones | `/admin/colecciones` | 3 líneas horizontales |
| Obras | `/admin/obras` | Imagen placeholder |
| Música | `/admin/musica` | Nota musical |
| Biografía | `/admin/biografia` | Persona |
| Contacto | `/admin/contacto` | Sobre de email |

**Comportamiento:**
- Fixed left, altura completa, ancho `w-56`
- Logo "Santiago Azcuy" + "Panel de control" en el header
- Link activo: fondo `--color-border`, texto blanco
- Link inactivo: texto muted, hover con fondo sutil
- Link "Ver sitio" en el footer (abre en nueva pestaña)

**Detección de ruta activa:**
- `/admin`: match exacto
- Resto: `pathname.startsWith(href)`

---

## Componentes del admin (in-page)

Estos componentes viven dentro de las páginas del admin, no en `components/`:

| Componente | Archivo | Tipo |
|-----------|---------|------|
| `ObrasAdminClient` | `app/admin/obras/ObrasAdminClient.tsx` | Client |
| `ColeccionesClient` | `app/admin/colecciones/ColeccionesClient.tsx` | Client |
| `BiografiaForm` | `app/admin/biografia/BiografiaForm.tsx` | Client |

### `ObrasAdminClient`

Lista interactiva de obras con toggle de publicación y eliminación.

**Props:** `{ obras: Obra[] }` — listado inicial desde servidor

**Estado:**
- `obras` — lista local (optimistic update en toggle y delete)
- `isPending` — useTransition para loading state
- `error` — mensaje de error de Server Action

**Acciones:**
- Toggle switch publicada/oculta (optimistic update + Server Action)
- Botón eliminar (confirm + Server Action)
- Thumbnail de 56px con `next/image`
- Info: título en Cormorant + serie · técnica · año
- Errores: se muestran en banner y se revierte el optimistic update

### `ColeccionesClient`

Lista interactiva de colecciones con eliminación.

**Props:** `{ series: Serie[] }` — con `obras_count`

**Acciones:**
- Botón eliminar (hover reveal, confirm)
- Muestra conteo de obras por colección
- Errores en banner

### `BiografiaForm`

Editor de biografía con CRUD de exposiciones integrado.

**Props:** `{ textoInicial: string, exposiciones: Exposicion[] }`

**Estado:**
- `texto` — textarea de biografía
- `expos` — lista de exposiciones
- `saved` — feedback visual de guardado (2.5s)
- `showForm` — toggle del formulario de nueva exposición

**Acciones:**
- Guardar texto biográfico
- Agregar exposición (form inline con título, lugar, ciudad, país, año, tipo)
- Eliminar exposición (hover reveal)
- Optimistic update en exposiciones (agrega con ID temporal)
