import Link from "next/link";

const STATS = [
  { label: "Colecciones", value: "3", href: "/admin/colecciones" },
  { label: "Obras totales", value: "35", href: "/admin/obras/nueva" },
  { label: "Disponibles", value: "12", href: "/admin/obras/nueva" },
];

const ACCIONES = [
  { label: "Nueva colección", href: "/admin/colecciones/nueva", desc: "Crear un nuevo agrupamiento de obras" },
  { label: "Subir obra", href: "/admin/obras/nueva", desc: "Agregar una nueva pieza al catálogo" },
  { label: "Editar biografía", href: "/admin/biografia", desc: "Actualizar el texto del artista" },
  { label: "Datos de contacto", href: "/admin/contacto", desc: "Email, redes, información de contacto" },
];

export default function AdminDashboard() {
  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Panel de control
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Gestión del sitio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        {STATS.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 hover:border-[var(--color-muted)] transition-colors group"
          >
            <p className="font-[family-name:var(--font-cormorant)] text-5xl font-light text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
              {value}
            </p>
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-2">
              {label}
            </p>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas */}
      <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">
        Acciones rápidas
      </p>
      <div className="grid grid-cols-2 gap-3">
        {ACCIONES.map(({ label, href, desc }) => (
          <Link
            key={href}
            href={href}
            className="border border-[var(--color-border)] p-5 hover:border-[var(--color-muted)] hover:bg-[var(--color-surface)] transition-all group"
          >
            <p className="text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors mb-1">
              {label} →
            </p>
            <p className="text-xs text-[var(--color-muted)]">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
