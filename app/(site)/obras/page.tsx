import { Suspense } from "react"
import ObraCard from "@/components/gallery/ObraCard"
import FiltrosObras from "@/components/gallery/FiltrosObras"
import SectionTitle from "@/components/layout/SectionTitle"
import { getObras, getSeries, getTecnicas } from "@/lib/supabase/queries"

export const metadata = {
  title: "Pinturas",
  description:
    "Catálogo de pinturas de Santiago Azcuy: óleo, acrílico y técnica mixta. Obra simbólica y geométrica, con piezas disponibles para adquisición.",
  alternates: { canonical: "/obras" },
}

interface Props {
  searchParams: Promise<{ serie?: string; tecnica?: string; disponible?: string }>
}

export default async function ObrasPage({ searchParams }: Props) {
  const params = await searchParams

  const [obras, series, tecnicas] = await Promise.all([
    getObras({
      serie: params.serie,
      tecnica: params.tecnica,
      disponible: params.disponible === "true" ? true : undefined,
    }),
    getSeries(),
    getTecnicas(),
  ])

  return (
    <div className="pt-16 pb-24 px-5 md:px-8 max-w-7xl mx-auto w-full">
      <SectionTitle eyebrow="Catálogo" title="Pinturas" />
      <Suspense>
          <FiltrosObras
            series={series.map((s) => ({ slug: s.slug, nombre: s.nombre }))}
            tecnicas={tecnicas}
          />
        </Suspense>

        {obras.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-[var(--color-muted)]">
              No hay pinturas publicadas{params.serie || params.tecnica || params.disponible ? " con estos filtros" : ""}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {obras.map((obra) => (
              <ObraCard key={obra.id} {...obra} />
            ))}
          </div>
        )}
    </div>
  )
}
