import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/server"
import ColeccionesClient from "./ColeccionesClient"

export const dynamic = "force-dynamic"

export default async function ColeccionesAdminPage() {
  const supabase = await createAdminClient()

  const { data: series } = await supabase
    .from("series")
    .select("*, obras(count)")
    .order("orden", { ascending: true, nullsFirst: false })
    .order("año_inicio", { ascending: false })

  const lista = (series ?? []).map((s) => ({
    ...s,
    obras_count: (s.obras as unknown as { count: number }[])?.[0]?.count ?? 0,
  }))

  return (
    <div className="p-10 max-w-4xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
            Colecciones
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
            {lista.length} colección{lista.length !== 1 ? "es" : ""}
          </p>
        </div>
        <Link
          href="/admin/colecciones/nueva"
          className="h-9 px-5 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase flex items-center hover:bg-[var(--color-text)] transition-colors"
        >
          + Nueva
        </Link>
      </div>

      <ColeccionesClient series={lista} />
    </div>
  )
}
