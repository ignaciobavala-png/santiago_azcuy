import { createAdminClient } from "@/lib/supabase/server"
import LeadsTable from "./LeadsTable"

export const metadata = { title: "Novela — Leads · Admin" }

export const dynamic = "force-dynamic"

export default async function NovelaAdminPage() {
  const supabase = await createAdminClient()
  const { data: leads } = await supabase
    .from("novela_leads")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="p-10">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          El Aprendiz — Leads
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Emails capturados por la descarga de la novela
        </p>
      </div>

      <LeadsTable leads={leads ?? []} />
    </div>
  )
}
