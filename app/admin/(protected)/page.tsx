import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const ACCIONES = [
  { label: "Nueva coleccion", href: "/admin/colecciones/nueva", desc: "Crear un nuevo agrupamiento de obras" },
  { label: "Subir obra", href: "/admin/obras/nueva", desc: "Agregar una nueva pieza al catalogo" },
  { label: "Editar biografia", href: "/admin/biografia", desc: "Actualizar texto y exposiciones del artista" },
  { label: "Ver obras", href: "/admin/obras", desc: "Gestionar y publicar/ocultar obras" },
  { label: "Editar institucional", href: "/admin/institucional", desc: "Trayectoria, formacion, obras clave" },
  { label: "Editar dossier", href: "/admin/dossier", desc: "Capitulos de Espiral Virtuosa" },
]

export default async function AdminDashboard() {
  const supabase = await createAdminClient()

  const [
    { count: totalObras },
    { count: publicadas },
    { count: disponibles },
    { count: totalSeries },
    { count: totalConsultas },
    { count: consultasNoLeidas },
    { count: totalLeads },
  ] = await Promise.all([
    supabase.from("obras").select("*", { count: "exact", head: true }),
    supabase.from("obras").select("*", { count: "exact", head: true }).eq("publicada", true),
    supabase.from("obras").select("*", { count: "exact", head: true }).eq("disponible", true),
    supabase.from("series").select("*", { count: "exact", head: true }),
    supabase.from("consultas").select("*", { count: "exact", head: true }),
    supabase.from("consultas").select("*", { count: "exact", head: true }).eq("leido", false),
    supabase.from("novela_leads").select("*", { count: "exact", head: true }),
  ])

  const stats = [
    { label: "Colecciones", value: String(totalSeries ?? 0), href: "/admin/colecciones" },
    { label: "Obras totales", value: String(totalObras ?? 0), href: "/admin/obras" },
    { label: "Publicadas", value: String(publicadas ?? 0), href: "/admin/obras" },
    { label: "Disponibles", value: String(disponibles ?? 0), href: "/admin/obras" },
    { label: "Consultas", value: String(totalConsultas ?? 0), href: "/admin/contacto" },
    { label: "Sin leer", value: String(consultasNoLeidas ?? 0), href: "/admin/contacto" },
    { label: "Leads novela", value: String(totalLeads ?? 0), href: "/admin/novela" },
  ]

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Panel de control
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Gestion del sitio
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
        {stats.map(({ label, value, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] p-4 hover:border-[var(--color-muted)] transition-colors group"
          >
            <p className="font-[family-name:var(--font-cormorant)] text-3xl font-light text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
              {value}
            </p>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-muted)] mt-1.5">
              {label}
            </p>
          </Link>
        ))}
      </div>

      <p className="text-xs tracking-[0.3em] uppercase text-[var(--color-muted)] mb-4">
        Acciones rapidas
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
  )
}
