import { createClient } from "./server"
import type { Tables } from "@/types/database"

export type Obra = Tables<"obras"> & { series: Pick<Tables<"series">, "nombre" | "slug"> | null }
export type ObraCard = Pick<Tables<"obras">, "id" | "slug" | "titulo" | "año" | "tecnica" | "dimensiones" | "imagen_url" | "blur_data_url" | "disponible" | "destacada">
export type Serie = Tables<"series">
export type Exposicion = Tables<"exposiciones">

export interface FiltrosObras {
  serie?: string
  tecnica?: string
  disponible?: boolean
}

export async function getObras(filtros?: FiltrosObras): Promise<ObraCard[]> {
  const supabase = await createClient()

  let query = supabase
    .from("obras")
    .select("*")
    .eq("publicada", true)
    .order("orden", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (filtros?.disponible === true) {
    query = query.eq("disponible", true)
  }

  if (filtros?.tecnica) {
    query = query.ilike("tecnica", `%${filtros.tecnica}%`)
  }

  if (filtros?.serie) {
    const supabase2 = await createClient()
    const { data: serie } = await supabase2
      .from("series")
      .select("id")
      .eq("slug", filtros.serie)
      .single()

    if (serie) {
      query = query.eq("serie_id", serie.id)
    }
  }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}

export async function getObra(slug: string): Promise<Obra | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("obras")
    .select("*, series(nombre, slug)")
    .eq("slug", slug)
    .eq("publicada", true)
    .single()

  if (error) return null
  return data as Obra
}

export async function getObrasDestacadas(): Promise<ObraCard[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("obras")
    .select("*")
    .eq("publicada", true)
    .eq("destacada", true)
    .order("orden", { ascending: true, nullsFirst: false })
    .limit(6)

  if (error) return []
  return data ?? []
}

export async function getSeries(): Promise<Serie[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("series")
    .select("*")
    .order("orden", { ascending: true, nullsFirst: false })
    .order("año_inicio", { ascending: false })

  if (error) return []
  return data ?? []
}

export async function getSerie(slug: string): Promise<(Serie & { obras: ObraCard[] }) | null> {
  const supabase = await createClient()

  const { data: serie, error } = await supabase
    .from("series")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !serie) return null

  const { data: obras } = await supabase
    .from("obras")
    .select("*")
    .eq("serie_id", serie.id)
    .eq("publicada", true)
    .order("orden", { ascending: true, nullsFirst: false })

  return { ...serie, obras: obras ?? [] }
}

export async function getTecnicas(): Promise<string[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("obras")
    .select("tecnica")
    .eq("publicada", true)
    .not("tecnica", "is", null)

  const unicas = [...new Set((data ?? []).map((o) => o.tecnica).filter(Boolean))] as string[]
  return unicas.sort()
}

export async function getSeriesConObras(maxSeries = 3, obrasPerSerie = 3): Promise<(Serie & { obras: ObraCard[] })[]> {
  const series = await getSeries()
  const top = series.slice(0, maxSeries)

  const results = await Promise.all(
    top.map(async (serie) => {
      const supabase = await createClient()
      const { data: obras } = await supabase
        .from("obras")
        .select("*")
        .eq("serie_id", serie.id)
        .eq("publicada", true)
        .order("orden", { ascending: true, nullsFirst: false })
        .limit(obrasPerSerie)
      return { ...serie, obras: obras ?? [] }
    })
  )

  return results.filter((s) => s.obras.length > 0)
}

export async function getExposiciones(): Promise<Exposicion[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("exposiciones")
    .select("*")
    .order("fecha_inicio", { ascending: false })

  if (error) return []
  return data ?? []
}
