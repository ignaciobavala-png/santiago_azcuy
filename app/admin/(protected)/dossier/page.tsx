import { getSeccionesDossier } from "./actions"
import { DossierAdmin } from "./DossierAdmin"

export const dynamic = "force-dynamic"

export default async function DossierAdminPage() {
  const secciones = await getSeccionesDossier()

  return (
    <div className="p-10 max-w-4xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Dossier
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Espiral Virtuosa — Dossier de proceso
        </p>
      </div>

      <DossierAdmin secciones={secciones} />
    </div>
  )
}
