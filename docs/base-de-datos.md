# Base de datos

> Supabase PostgreSQL con 5 tablas, RLS habilitado y Storage bucket para imágenes.

## Esquema

### Tabla `series`

Colecciones o agrupamientos temáticos de obras.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid` PK | Identificador único |
| `slug` | `text UNIQUE NOT NULL` | Slug para URL (ej: `introspecciones`) |
| `nombre` | `text NOT NULL` | Nombre de la colección |
| `descripcion` | `text` | Texto descriptivo |
| `año_inicio` | `integer` | Año de inicio de la serie |
| `año_fin` | `integer` | Año de finalización |
| `imagen_cover` | `text` | URL de imagen de portada |
| `orden` | `integer` | Orden de display |
| `created_at` | `timestamptz` | Fecha de creación |

### Tabla `obras`

Obra pictórica individual.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid` PK | Identificador único |
| `slug` | `text UNIQUE NOT NULL` | Slug para URL |
| `titulo` | `text NOT NULL` | Título de la obra |
| `año` | `integer` | Año de realización |
| `tecnica` | `text` | "Óleo sobre tela", "Acrílico", etc. |
| `dimensiones` | `text` | Texto display: "100 × 80 cm" |
| `dimensiones_alto` | `integer` | Alto en cm (para cálculos) |
| `dimensiones_ancho` | `integer` | Ancho en cm |
| `descripcion` | `text` | Texto sobre la obra |
| `serie_id` | `uuid FK → series` | Colección a la que pertenece (ON DELETE SET NULL) |
| `publicada` | `boolean DEFAULT false` | Controla visibilidad pública (RLS) |
| `disponible` | `boolean DEFAULT false` | Disponible para la venta |
| `precio` | `numeric` | Precio en USD (null = consultar) |
| `tipo_venta` | `text` | `original` \| `print` \| `ambos` |
| `print_edicion` | `integer` | Nº de edición limitada |
| `print_stock` | `integer` | Unidades disponibles |
| `print_precio` | `numeric` | Precio del print si difiere |
| `imagen_url` | `text` | URL de Supabase Storage (WebP optimizado) |
| `imagen_hires` | `text` | Versión alta resolución (opcional) |
| `blur_data_url` | `text` | base64 10×10px para `placeholder="blur"` |
| `orden` | `integer` | Orden en galería |
| `destacada` | `boolean DEFAULT false` | Marca para home/hero |
| `created_at` | `timestamptz DEFAULT now()` | Fecha de creación |

Índices:
- `publicada`, `destacada`, `disponible`, `serie_id` — para filtros de galería
- `orden` — para ordenamiento

### Tabla `exposiciones`

Historial expositivo del artista.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid` PK | Identificador único |
| `titulo` | `text NOT NULL` | Nombre de la exposición |
| `lugar` | `text` | Galería, museo, espacio |
| `ciudad` | `text` | Ciudad |
| `pais` | `text` | País |
| `fecha_inicio` | `date` | Fecha de inicio |
| `fecha_fin` | `date` | Fecha de finalización |
| `tipo` | `text` | `individual` \| `colectiva` |
| `url` | `text` | Link externo |
| `created_at` | `timestamptz` | Fecha de creación |

### Tabla `consultas`

Mensajes de contacto y consultas de compra recibidos del formulario público.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `uuid` PK | Identificador único |
| `nombre` | `text` | Nombre del contacto |
| `email` | `text` | Email |
| `telefono` | `text` | Teléfono (opcional) |
| `obra_id` | `uuid FK → obras` | Obra consultada (nullable) |
| `tipo_consulta` | `text DEFAULT 'general'` | `compra` \| `general` \| `prensa` |
| `mensaje` | `text` | Cuerpo del mensaje |
| `leido` | `boolean DEFAULT false` | Marcado como leído por admin |
| `created_at` | `timestamptz` | Fecha de envío |

### Tabla `biografia`

Texto biográfico del artista. Diseño de **una sola fila** (id = 1).

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `integer PK DEFAULT 1` | Siempre 1 |
| `texto` | `text` | Biografía completa |
| `updated_at` | `timestamptz` | Última actualización |

Constraint: `UNIQUE(id)` — garantiza que solo exista una fila.
La fila se inserta vacía al crear la tabla (`ON CONFLICT DO NOTHING`).

## Relaciones

```
series 1 ──── * obras      (obras.serie_id → series.id, ON DELETE SET NULL)
obras  1 ──── * consultas  (consultas.obra_id → obras.id)
```

- Una serie tiene muchas obras
- Una obra pertenece a una serie (opcional)
- Una consulta puede estar asociada a una obra (opcional)

## RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. Las políticas se definen en la migración `20260603000002_enable_rls_policies.sql`.

| Tabla | Lectura pública | Escritura pública |
|-------|----------------|-------------------|
| `series` | ✅ Todos (anon + authenticated) | ❌ Solo service_role |
| `exposiciones` | ✅ Todos | ❌ Solo service_role |
| `obras` | ✅ Solo donde `publicada = true` | ❌ Solo service_role |
| `consultas` | ❌ Solo service_role | ✅ Insert público (anon + authenticated) |
| `biografia` | ✅ Todos | ❌ Solo service_role |

El cliente `createAdminClient()` usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS en:
- Server Actions (crear, actualizar, eliminar)
- Route Handlers (keepalive)

## Storage

### Bucket `obras`

| Configuración | Valor |
|---------------|-------|
| Acceso | Público |
| Límite de upload | 20 MB |
| MIME types permitidos | `image/jpeg`, `image/png`, `image/webp`, `image/tiff` |

### Estructura de archivos

```
obras/
  {obra_id}/
    original.webp    # Imagen procesada (2400px, calidad 85)
    # thumb.webp     # (planeado, no implementado aún)
```

### Pipeline de procesamiento

El upload se realiza en el Server Action `uploadObraImage` (`app/admin/obras/actions.ts`):

1. **Recibe** el archivo como `FormData`
2. **Procesa con `sharp`**:
   - `rotate()` — corrige orientación EXIF
   - `resize(2400, 2400, { fit: "inside", withoutEnlargement: true })` — redimensiona manteniendo aspect ratio
   - `webp({ quality: 85 })` — convierte a WebP
3. **Genera blur placeholder**:
   - `resize(10, 10, { fit: "cover" })` — thumbnail de 10×10px
   - `webp({ quality: 60 })` — comprime
   - Convierte a `data:image/webp;base64,...` para guardar en `blur_data_url`
4. **Sube a Storage**: `obras/{uuid}/original.webp`
5. **Retorna** `{ imagen_url, blur_data_url }`

El `blur_data_url` se guarda en la tabla `obras` para que `next/image` pueda usar `placeholder="blur"` con imágenes externas (única forma de tener blur placeholder con imágenes alojadas fuera del filesystem local).

## Migraciones

Las migraciones están en `supabase/migrations/` y se aplican en orden cronológico:

| Archivo | Contenido |
|---------|-----------|
| `20260603000000_init_schema.sql` | Crea tablas `series`, `obras`, `exposiciones`, `consultas` + índices |
| `20260603000001_create_storage_bucket.sql` | Crea bucket `obras` con restricciones |
| `20260603000002_enable_rls_policies.sql` | Habilita RLS y define políticas de lectura/inserción |
| `20260603000003_create_biografia_table.sql` | Crea tabla `biografia` (single row) + RLS |

Para aplicar migraciones en un proyecto nuevo:

```bash
pnpm supabase db push
pnpm supabase gen types --local > types/database.ts
```

## Tipos TypeScript

Generados automáticamente desde el schema real de Supabase en `types/database.ts` (357 líneas).

Exporta:
- `Database` — tipo raíz con todas las tablas
- `Tables<"tabla">` — fila completa
- `TablesInsert<"tabla">` — fila para INSERT
- `TablesUpdate<"tabla">` — fila para UPDATE
- `Enums<"enum">` — tipos de enum
- `Constants` — constantes de BD

**Nunca editar `types/database.ts` a mano.** Regenerar con `pnpm supabase gen types`.
