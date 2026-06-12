# Sistema de diseño

> Tokens, paleta, tipografía y patrones visuales de la plataforma.

## Paleta de colores

Definida como tokens CSS en `app/globals.css` vía `@theme {}` (Tailwind v4).

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-background` | `#0a0a0a` | Fondo principal — negro profundo |
| `--color-surface` | `#141414` | Superficie de cards, inputs, sidebar |
| `--color-border` | `#2a2a2a` | Bordes, separadores, dividers |
| `--color-text` | `#e8e4dc` | Texto principal — crema cálido |
| `--color-muted` | `#6b6560` | Texto secundario, labels, placeholders |
| `--color-accent` | `#c9a87c` | Acento editorial — dorado arena |
| `--color-danger` | `#a05040` | Alertas, errores, botón eliminar |

### Uso en Tailwind

Los tokens se referencian como `[var(--color-token)]`:

```tsx
// Fondo
className="bg-[var(--color-background)]"

// Texto
className="text-[var(--color-text)]"

// Borde
className="border-[var(--color-border)]"

// Hover
className="hover:text-[var(--color-accent)]"
```

No se usan clases arbitrarias de Tailwind para colores — siempre vía tokens.

## Tipografía

Dos fuentes cargadas desde Google Fonts vía `next/font/google` en el layout raíz.

### Cormorant Garamond
- **Variable CSS:** `--font-cormorant`
- **Uso:** Títulos, headings, nombres de obra, texto editorial
- **Pesos:** 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold)
- **Aplicación:** `font-[family-name:var(--font-cormorant)]`

### DM Sans
- **Variable CSS:** `--font-dm-sans`
- **Uso:** UI, cuerpo de texto, labels, botones, navegación
- **Aplicación:** Es la fuente por defecto en `body` (`font-family: var(--font-sans)`)

### Escala tipográfica común

| Elemento | Clases | Tamaño aprox |
|----------|--------|-------------|
| Título de página | `text-5xl md:text-6xl font-light` | 3rem / 3.75rem |
| Título de sección | `text-4xl md:text-5xl font-light` | 2.25rem / 3rem |
| Subtítulo serif | `text-2xl md:text-3xl font-light` | 1.5rem / 1.875rem |
| Cuerpo serif | `text-xl leading-relaxed` | 1.25rem |
| Texto UI | `text-sm` | 0.875rem |
| Labels uppercase | `text-xs tracking-[0.2em]` | 0.75rem |
| Micro labels | `text-[10px] tracking-[0.2em]` | 10px |

## Patrones de layout

### Grid de galería

```tsx
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
```

- 2 columnas en mobile, 3 en tablet, 4 en desktop
- Gap: 4 (16px) mobile, 6 (24px) desktop

### Contenedor máximo

```tsx
<div className="max-w-7xl mx-auto px-8">
```

- Ancho máximo 80rem (1280px)
- Padding horizontal fijo de 2rem (32px)

### Separadores

```tsx
<div className="border-t border-[var(--color-border)]" />
```

- Borde superior con el token `--color-border`
- Padding vertical típico: `py-12` o `pt-8`

### Breadcrumb

```tsx
<nav className="flex items-center gap-2 text-xs tracking-[0.15em] uppercase text-[var(--color-muted)]">
  <Link href="..." className="hover:text-[var(--color-text)] transition-colors">...</Link>
  <span>/</span>
  <span className="text-[var(--color-text)]">Actual</span>
</nav>
```

### Línea decorativa

```tsx
<div className="w-12 h-px bg-[var(--color-accent)] mx-auto" />
<div className="w-8 h-px bg-[var(--color-accent)] mx-auto" />
<div className="w-px h-8 bg-[var(--color-muted)]" />
```

## Inputs y formularios

### Input estándar

```tsx
const inputCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"
```

### Select estándar

```tsx
const selectCls =
  "w-full bg-[var(--color-surface)] border border-[var(--color-border)] px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-muted)] transition-colors"
```

### Field wrapper (usado en forms del admin)

```tsx
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
        {label}{required && <span className="text-[var(--color-accent)] ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
```

## Botones

### Botón primario (acción principal)

```tsx
className="h-10 px-8 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase hover:bg-[var(--color-text)] transition-colors disabled:opacity-50"
```

### Botón secundario (cancelar, volver)

```tsx
className="h-10 px-6 border border-[var(--color-border)] text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
```

### Botón link (texto)

```tsx
className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
```

### Toggle switch (publicada/disponible)

```tsx
<button className={`relative w-9 h-5 rounded-full transition-colors ${active ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}>
  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-[var(--color-background)] transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
</button>
```

## Estados

### Estado vacío

```tsx
<div className="py-32 text-center">
  <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
    Sin obras publicadas.
  </p>
</div>
```

### Estado de carga (implícito)

Los Server Components async manejan la carga automáticamente. Para Client Components se usa `useTransition`:

```tsx
const [isPending, startTransition] = useTransition()
// isPending se usa para disabled:opacity-50 en botones
```

### Error

```tsx
<div className="mb-6 px-4 py-3 border border-[var(--color-danger)] text-xs text-[var(--color-danger)]">
  {mensaje}
</div>
```

### Feedback de guardado

```tsx
const [saved, setSaved] = useState(false)
// En botón:
{saved ? "✓ Guardado" : "Guardar cambios"}
```

### Imagen no disponible

```tsx
<div className="w-full h-full flex items-center justify-center">
  <span className="text-xs tracking-[0.2em] uppercase text-[var(--color-border)]">
    Sin imagen
  </span>
</div>
```

## Responsive

- **Mobile-first**: los estilos base son para mobile, se sobreescriben con breakpoints `md:` y `lg:`
- Header: menú hamburger en mobile (`md:hidden`), nav horizontal en desktop
- Galería: `grid-cols-2` → `md:grid-cols-3` → `lg:grid-cols-4`
- Detalle de obra: layout single column → `lg:grid-cols-2` con imagen sticky
- Sidebar admin: siempre visible (`w-56`), no colapsa en mobile
