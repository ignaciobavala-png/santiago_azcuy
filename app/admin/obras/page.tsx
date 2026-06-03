import Link from "next/link"
import Image from "next/image"
import { createAdminClient } from "@/lib/supabase/server"
import ObrasAdminClient from "./ObrasAdminClient"

export const dynamic = "force-dynamic"

export default async function ObrasAdminPage() {
  const supabase = await createAdminClient()

  const { data: obrasRaw } = await supabase
    .from("obras")
    .select("*, series(nombre)")
    .order("created_at", { ascending: false })

  const obras = (obrasRaw ?? []) as unknown as Array<{
    id: string; slug: string; titulo: string; año: number | null
    tecnica: string | null; imagen_url: string | null
    publicada: boolean; disponible: boolean
    series: { nombre: string } | null
  }>

  return (
    <div className="p-10 max-w-5xl">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
            Obras
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
            {obras?.length ?? 0} obra{obras?.length !== 1 ? "s" : ""} en total
          </p>
        </div>
        <Link
          href="/admin/obras/nueva"
          className="h-9 px-5 bg-[var(--color-accent)] text-[var(--color-background)] text-xs tracking-[0.2em] uppercase flex items-center hover:bg-[var(--color-text)] transition-colors"
        >
          + Nueva obra
        </Link>
      </div>

      <ObrasAdminClient obras={obras} />
    </div>
  )
}
