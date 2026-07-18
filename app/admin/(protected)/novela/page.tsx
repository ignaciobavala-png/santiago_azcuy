import { createAdminClient } from "@/lib/supabase/server"
import { getNovelaContenido } from "./actions"
import LeadsTable from "./LeadsTable"
import { NovelaContenidoForm } from "./NovelaContenidoForm"

export const metadata = { title: "Novela · Admin" }

export const dynamic = "force-dynamic"

export default async function NovelaAdminPage() {
  const supabase = await createAdminClient()
  const [{ data: leads }, contenido] = await Promise.all([
    supabase
      .from("novela_leads")
      .select("id, email, created_at")
      .order("created_at", { ascending: false }),
    getNovelaContenido(),
  ])

  return (
    <div className="p-10 max-w-5xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          El Aprendiz
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Contenido de la pagina y leads capturados
        </p>
      </div>

      <section className="mb-16">
        <NovelaContenidoForm contenido={contenido} />
      </section>

      <section className="border-t border-[var(--color-border)] pt-12">
        <h2 className="font-[family-name:var(--font-cormorant)] font-light text-2xl text-[var(--color-text)] mb-1">
          Leads
        </h2>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mb-6">
          Emails capturados por la descarga de la novela
        </p>
        <LeadsTable leads={leads ?? []} />
      </section>
    </div>
  )
}
