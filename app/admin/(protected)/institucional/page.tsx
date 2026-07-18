import { getSeccionesInstitucional } from "./actions"
import { InstitucionalAdmin } from "./InstitucionalAdmin"

export const dynamic = "force-dynamic"

export default async function InstitucionalAdminPage() {
  const secciones = await getSeccionesInstitucional()

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Institucional
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Trayectoria, formacion, distinciones y obras clave
        </p>
      </div>

      <InstitucionalAdmin secciones={secciones} />
    </div>
  )
}
