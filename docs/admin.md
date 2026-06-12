# Guía del panel de administración

> Cómo usar el panel de control para gestionar el contenido del sitio.

## Acceso

El panel de administración está en `/admin`. Actualmente no requiere autenticación (período de desarrollo). Cuando se active, el acceso será mediante login con email/contraseña de Supabase Auth.

## Dashboard

**Ruta:** `/admin`

Vista principal con:

- **Estadísticas** en 4 cards: colecciones, obras totales, publicadas, disponibles. Cada una linkea a su sección.
- **Acciones rápidas**: atajos a las operaciones más frecuentes.

## Gestión de obras

### Listado de obras

**Ruta:** `/admin/obras`

Muestra todas las obras ordenadas por fecha de creación (más recientes primero).

Cada fila muestra:
- Thumbnail de la obra (56×56px)
- Título en Cormorant + info (serie · técnica · año)

**Acciones por obra:**
- **Toggle publicar/ocultar**: switch que activa o desactiva la visibilidad pública. Cambio instantáneo (optimistic update). La obra solo es visible en el sitio público si está marcada como "Visible".
- **Eliminar**: botón que aparece al hover. Pide confirmación. La eliminación es permanente.

### Subir obra nueva

**Ruta:** `/admin/obras/nueva`

Formulario de carga de obra en dos pasos:

#### Paso 1: Imagen

1. Clic en la zona de upload
2. Seleccionar archivo (JPG, PNG, WebP o TIFF — máx 20MB)
3. El sistema procesa automáticamente:
   - Convierte a WebP (2400px lado mayor, calidad 85%)
   - Genera blur placeholder
   - Sube a Supabase Storage
4. Aparece "✓ Imagen subida correctamente"

#### Paso 2: Datos de la obra

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Serie | No | Select con las colecciones existentes. Cargar colecciones antes de subir obras |
| Título | Sí | Se usa para generar el slug automáticamente |
| Año | No | Año de realización |
| Técnica | No | Ej: "Óleo sobre tela", "Acrílico" |
| Dimensiones | No | Alto × Ancho en cm |
| Descripción | No | Texto sobre la obra |

#### Sección Venta

- **Toggle "Disponible para la venta"**: activa/desactiva los campos de precio
- Si está disponible:
  - **Precio (USD)**: monto en dólares
  - **Tipo**: Original, Print o Ambos

#### Guardar

El botón "Guardar obra" inserta en la base de datos y redirige al dashboard.

**El slug se genera automáticamente** desde el título:
1. Normaliza caracteres (quita acentos)
2. Convierte a minúsculas
3. Reemplaza espacios por guiones
4. Si el slug ya existe, agrega timestamp al final

---

## Gestión de colecciones

### Listado de colecciones

**Ruta:** `/admin/colecciones`

Muestra todas las series con:
- Nombre en Cormorant
- Rango de años
- Descripción
- Conteo de obras en esa colección

**Acciones:**
- **Eliminar**: hover reveal. Las obras quedan sin colección asignada (no se eliminan).

### Nueva colección

**Ruta:** `/admin/colecciones/nueva`

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre | Sí | Genera el slug automáticamente |
| Año inicio | No | Año de inicio de la colección |
| Año fin | No | Año de cierre |
| Descripción | No | Texto descriptivo |
| Orden | No | Número para ordenar en el sitio |

---

## Gestión de biografía

**Ruta:** `/admin/biografia`

### Texto biográfico

Textarea multilínea para la biografía del artista. Cada salto de línea se renderiza como un párrafo separado en la página `/sobre`.

Botón "Guardar texto" — feedback visual con "✓ Guardado" durante 2.5 segundos.

### Exposiciones

Lista de exposiciones (individuales y colectivas) mostradas en orden de carga (más reciente primero).

**Agregar exposición** (botón "+ Agregar"):

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Título | Sí | Nombre de la exposición |
| Lugar | No | Galería, museo, espacio |
| Ciudad | No | Ciudad |
| País | No | País |
| Año | No | Se guarda como fecha 01-01 del año |
| Tipo | No | Individual o Colectiva |

**Eliminar exposición**: hover reveal con confirmación.

---

## Contacto

**Ruta:** `/admin/contacto`

Actualmente es un stub con datos mock. Permitirá configurar:
- Email público
- Teléfono / WhatsApp
- Redes sociales (Instagram, Facebook)
- Texto de la página de contacto

No conectado a base de datos todavía.

---

## Flujo de trabajo recomendado

1. **Crear colecciones primero** — antes de subir obras, crear las series/colecciones para poder asignarlas
2. **Subir obras** — con imagen, título y datos
3. **Publicar** — las obras se crean como publicadas por defecto. Usar el toggle en `/admin/obras` para ocultar las que no estén listas
4. **Completar biografía** — texto y exposiciones en `/admin/biografia`
5. **Verificar en el sitio público** — click en "Ver sitio" en el sidebar
