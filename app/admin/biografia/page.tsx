import { createAdminClient } from "@/lib/supabase/server"
import BiografiaForm from "./BiografiaForm"

export const dynamic = "force-dynamic"

export default async function BiografiaAdminPage() {
  const supabase = await createAdminClient()

  const [{ data: bio }, { data: exposiciones }] = await Promise.all([
    supabase.from("biografia").select("texto").eq("id", 1).single(),
    supabase
      .from("exposiciones")
      .select("*")
      .order("fecha_inicio", { ascending: false }),
  ])

  return (
    <div className="p-10 max-w-3xl">
      <div className="mb-10">
        <h1 className="font-[family-name:var(--font-cormorant)] font-light text-4xl text-[var(--color-text)]">
          Biografía
        </h1>
        <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)] mt-1">
          Texto del artista y exposiciones
        </p>
      </div>

      <BiografiaForm
        textoInicial={bio?.texto ?? ""}
        exposiciones={exposiciones ?? []}
      />
    </div>
  )
}
